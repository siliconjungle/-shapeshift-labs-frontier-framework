import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  recordEvidenceTestRun,
  type FrontierTestManifest
} from '@shapeshift-labs/frontier-test';
import {
  createFrontierFramework,
  type FrontierFrameworkAgentLoopReport,
  type FrontierFrameworkSurfaceCoverageReport,
  type NormalizedFrontierFrameworkConfig
} from './index.ts';
import {
  createAgentLoopFocus,
  createAgentLoopSurface,
  createAgentLoopWorkQueue,
  createSurfaceCoverageDashboard,
  createSurfaceCoverageSummary,
  sortAgentLoopSurface,
  type SurfaceCoverageRecord
} from './surface-evidence-report.ts';

type CliFrameworkPlan = ReturnType<typeof createFrontierFramework>;
type SurfaceCoverageProbePlan = SurfaceCoverageRecord['nextProbes'][number];
type SurfaceContract = SurfaceCoverageRecord['contracts'][number];
type SurfaceContractProof = SurfaceCoverageRecord['contractProofs'][number];
type EvidenceArtifactCheck = { ok: boolean; artifact: string; reason: string; message: string; file?: string };

export function createCliFrameworkPlan(cwd: string, config: NormalizedFrontierFrameworkConfig): CliFrameworkPlan {
  const plan = createFrontierFramework(config);
  return {
    ...plan,
    surfaceCoverage: verifySurfaceCoverageEvidence(cwd, config, plan.surfaceCoverage, plan.tests)
  };
}

export function verifyAgentLoopEvidence(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  report: FrontierFrameworkAgentLoopReport,
  tests?: FrontierTestManifest
): FrontierFrameworkAgentLoopReport {
  const coverage = verifySurfaceCoverageEvidence(cwd, config, report.coverage, tests);
  const matchedIds = new Set(report.status.surfaces.map((surface) => surface.id));
  const records = coverage.records.filter((record) => matchedIds.has(record.surface.id));
  const missing = records.filter((record) => !record.ok).map(createAgentLoopSurface);
  const next = records
    .filter((record) => !record.ok || record.probes.some((probe) => probe.status === 'planned'))
    .map(createAgentLoopSurface)
    .sort(sortAgentLoopSurface)
    .slice(0, 12);
  const workQueue = createAgentLoopWorkQueue(records);
  return {
    ...report,
    ok: missing.length === 0 && coverage.ok,
    coverage,
    dashboard: {
      byKind: coverage.dashboard.byKind,
      byStatus: coverage.dashboard.byStatus,
      byRoute: coverage.dashboard.byRoute,
      focus: createAgentLoopFocus(records, report.focusKinds)
    },
    next,
    missing,
    workQueue,
    summary: {
      matchedSurfaces: report.status.summary.matchCount,
      claimedSurfaces: records.filter((record) => record.required.length > 0).length,
      missingSurfaces: missing.length,
      nextSurfaceCount: next.length,
      coveredProbes: records.flatMap((record) => record.probes).filter((probe) => probe.status === 'covered').length,
      missingProbes: records.flatMap((record) => record.probes).filter((probe) => probe.status === 'missing').length,
      plannedProbes: records.flatMap((record) => record.probes).filter((probe) => probe.status === 'planned').length,
      failedContracts: records.flatMap((record) => record.contractProofs).filter((proof) => proof.status === 'failed').length,
      missingContracts: records.flatMap((record) => record.contractProofs).filter((proof) => proof.status === 'missing').length,
      nextProbes: records.flatMap((record) => record.nextProbes).length,
      workItems: workQueue.length,
      requiredWorkItems: workQueue.filter((item) => item.required).length
    }
  };
}

export function verifySurfaceCoverageEvidence(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  report: FrontierFrameworkSurfaceCoverageReport,
  tests?: FrontierTestManifest
): FrontierFrameworkSurfaceCoverageReport {
  const hasContracts = report.records.some((record) => (record.contracts ?? record.surface.contracts ?? []).length > 0);
  if (!report.enabled || (!shouldVerifySurfaceEvidence(config) && !hasContracts)) {
    return tests ? attachSurfaceCoverageAcceptance(report, tests) : report;
  }
  const records = report.records.map((record) => verifySurfaceCoverageRecord(cwd, config, record));
  const verified = {
    ...report,
    ok: records.every((record) => record.ok),
    records,
    dashboard: createSurfaceCoverageDashboard(records),
    summary: createSurfaceCoverageSummary(records)
  };
  return tests ? attachSurfaceCoverageAcceptance(verified, tests) : verified;
}

function attachSurfaceCoverageAcceptance(
  report: FrontierFrameworkSurfaceCoverageReport,
  tests: FrontierTestManifest
): FrontierFrameworkSurfaceCoverageReport {
  const specId = 'frontier-framework.surface-coverage';
  const specIds = tests.specs.some((spec) => spec.id === specId) ? [specId] : undefined;
  const acceptance = recordEvidenceTestRun(tests, {
    mode: 'surface-coverage',
    specIds,
    surfaceCoverage: report,
    artifacts: [report.reportFile, report.dashboardFile],
    failOnMissing: true,
    metadata: {
      appId: report.appId,
      source: 'frontier-framework.surface-coverage'
    },
    proofMetadata: {
      appId: report.appId,
      source: 'frontier-framework.surface-coverage'
    }
  });
  return {
    ...report,
    acceptance: {
      kind: 'frontier.framework.surface-coverage.acceptance',
      ...acceptance
    }
  };
}

function verifySurfaceCoverageRecord(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  record: SurfaceCoverageRecord
): SurfaceCoverageRecord {
  const checks = new Map(record.surface.evidence.map((artifact) => [artifact, checkEvidenceArtifact(cwd, config, record, artifact)]));
  const probeChecks = new Map<string, EvidenceArtifactCheck>();
  const probes = record.probes.map((probe) => {
    if (probe.status !== 'covered' || probe.source !== 'surface-evidence' || !probe.artifact) return probe;
    const check = checks.get(probe.artifact);
    if (!check) return probe;
    if (!check.ok) return markSurfaceEvidenceProbeMissing(probe, check);
    if (!shouldVerifyProbeKind(config, probe.kind)) return probe;
    const probeCheckKey = probe.artifact + '\0' + probe.kind;
    const probeCheck = probeChecks.get(probeCheckKey) ?? checkEvidenceProbeKind(config, probe.artifact, probe.kind, check.file);
    probeChecks.set(probeCheckKey, probeCheck);
    return probeCheck.ok ? probe : markSurfaceEvidenceProbeMissing(probe, probeCheck);
  });
  const covered = record.required.filter((kind) => probes.some((probe) => probe.kind === kind && probe.status === 'covered'));
  const missing = record.required.filter((kind) => !covered.includes(kind));
  const contracts = record.contracts ?? record.surface.contracts ?? [];
  const contractProofs = contracts.map((contract) => verifySurfaceContract(cwd, config, record, contract, checks));
  const missingRequiredContracts = contractProofs.filter((proof) => proof.required && proof.status !== 'passed');
  const staleOrMissingEvidence = [...checks.values()].filter((check) => !check.ok);
  const plannedContractMessages = new Set(record.contractProofs.filter((proof) => proof.status === 'planned').map((proof) => proof.message));
  const hints = record.hints.filter((hint) => !plannedContractMessages.has(hint));
  const nextProbes = [...record.nextProbes];
  for (const kind of missing) {
    if (!nextProbes.some((probe) => probe.kind === kind)) {
      const check = staleOrMissingEvidence[0];
      const reason = check?.message ?? 'Required "' + kind + '" coverage is not backed by a current evidence artifact.';
      hints.push(reason);
      nextProbes.push(createSurfaceProbePlan(record, kind, reason, 'refresh-evidence', check?.artifact));
    }
  }
  for (const proof of missingRequiredContracts) {
    if (!hints.includes(proof.message)) hints.push(proof.message);
  }
  return {
    ...record,
    covered,
    missing,
    probes,
    nextProbes,
    contracts,
    contractProofs,
    hints,
    ok: missing.length === 0 && missingRequiredContracts.length === 0
  };
}

function checkEvidenceArtifact(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  record: SurfaceCoverageRecord,
  artifact: string
): EvidenceArtifactCheck {
  if (!shouldCheckEvidenceArtifact(artifact)) {
    return { ok: true, artifact, reason: 'external', message: 'Evidence artifact is not a local file path.' };
  }
  const artifactPath = resolveEvidenceArtifactPath(cwd, config, artifact);
  const artifactStat = safeStat(artifactPath);
  if (!artifactStat) {
    return {
      ok: false,
      artifact,
      reason: 'missing-artifact',
      message: 'Linked evidence artifact does not exist in configured roots: ' + artifact,
      file: artifactPath
    };
  }
  if (!config.surfaces.coverage.verifyEvidenceFreshness) {
    return { ok: true, artifact, reason: 'exists', message: 'Evidence artifact exists.', file: artifactPath };
  }
  const reference = newestEvidenceReference(cwd, record);
  if (reference && artifactStat.mtimeMs < reference.mtimeMs) {
    return {
      ok: false,
      artifact,
      reason: 'stale-artifact',
      message: 'Linked evidence artifact is older than ' + reference.label + ': ' + artifact,
      file: artifactPath
    };
  }
  return { ok: true, artifact, reason: 'fresh', message: 'Evidence artifact is current.', file: artifactPath };
}

function shouldVerifySurfaceEvidence(config: NormalizedFrontierFrameworkConfig): boolean {
  return config.surfaces.coverage.verifyEvidenceFiles
    || config.surfaces.coverage.verifyEvidenceFreshness
    || config.surfaces.coverage.verifyEvidenceProbeKinds;
}

function shouldVerifyProbeKind(config: NormalizedFrontierFrameworkConfig, kind: string): boolean {
  return config.surfaces.coverage.verifyEvidenceProbeKinds && kind !== 'evidence';
}

function markSurfaceEvidenceProbeMissing(
  probe: SurfaceCoverageRecord['probes'][number],
  check: EvidenceArtifactCheck
): SurfaceCoverageRecord['probes'][number] {
  return {
    ...probe,
    status: 'missing' as const,
    source: missingProbeSource(check.reason),
    tags: [...probe.tags, check.reason, check.message]
  };
}

function missingProbeSource(reason: string): string {
  if (reason === 'stale-artifact') return 'stale-surface-evidence';
  if (reason === 'missing-probe-kind') return 'missing-surface-evidence-probe';
  return 'missing-surface-evidence';
}

function checkEvidenceProbeKind(
  config: NormalizedFrontierFrameworkConfig,
  artifact: string,
  kind: string,
  file?: string
): EvidenceArtifactCheck {
  if (!shouldCheckEvidenceArtifact(artifact)) {
    return { ok: true, artifact, reason: 'external', message: 'External evidence artifact cannot be content-scanned.' };
  }
  if (!file) {
    return { ok: false, artifact, reason: 'missing-artifact', message: 'Linked evidence artifact could not be resolved for probe scan: ' + artifact };
  }
  const text = safeReadText(file);
  if (text === undefined) {
    return { ok: false, artifact, reason: 'missing-artifact', message: 'Linked evidence artifact could not be read for probe scan: ' + artifact, file };
  }
  if (evidenceTextContainsProbeKind(config, kind, text)) {
    return { ok: true, artifact, reason: 'probe-kind', message: 'Evidence artifact contains "' + kind + '" probe markers.', file };
  }
  return {
    ok: false,
    artifact,
    reason: 'missing-probe-kind',
    message: 'Linked evidence artifact does not mention required "' + kind + '" probe markers: ' + artifact,
    file
  };
}

function verifySurfaceContract(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  record: SurfaceCoverageRecord,
  contract: SurfaceContract,
  checks: ReadonlyMap<string, EvidenceArtifactCheck>
): SurfaceContractProof {
  const artifacts = contract.artifact ? [contract.artifact] : record.surface.evidence;
  if (artifacts.length === 0) return contractProof(record, contract, 'missing', undefined, 'Surface contract "' + contract.id + '" has no evidence artifact to verify.');
  let fallback: SurfaceContractProof | undefined;
  for (const artifact of artifacts) {
    const check = checks.get(artifact) ?? checkEvidenceArtifact(cwd, config, record, artifact);
    if (!check.ok) {
      fallback = contractProof(record, contract, 'missing', artifact, check.message);
      continue;
    }
    const json = check.file ? safeReadJson(check.file) : undefined;
    if (json === undefined) {
      fallback = contractProof(record, contract, 'missing', artifact, 'Surface contract evidence is not readable JSON: ' + artifact);
      continue;
    }
    const evaluated = evaluateSurfaceContract(record, contract, artifact, json);
    if (evaluated.status === 'passed') return evaluated;
    fallback = evaluated;
  }
  return fallback ?? contractProof(record, contract, 'missing', artifacts[0], 'Surface contract "' + contract.id + '" could not be verified.');
}

function evaluateSurfaceContract(
  record: SurfaceCoverageRecord,
  contract: SurfaceContract,
  artifact: string,
  evidence: unknown
): SurfaceContractProof {
  if (contract.kind === 'evidence-ok') {
    return readRecord(evidence).ok === true
      ? contractProof(record, contract, 'passed', artifact, 'Evidence artifact reports ok: true.')
      : contractProof(record, contract, 'failed', artifact, 'Evidence artifact does not report ok: true.');
  }
  if (contract.kind === 'no-gaps') {
    const gaps = countNamedArrays(evidence, 'gaps');
    return gaps === 0
      ? contractProof(record, contract, 'passed', artifact, 'Evidence has no recorded gaps.')
      : contractProof(record, contract, 'failed', artifact, 'Evidence has ' + gaps + ' recorded gap(s).');
  }
  if (contract.kind === 'no-warnings') {
    const warnings = countNamedArrays(evidence, 'warnings');
    return warnings === 0
      ? contractProof(record, contract, 'passed', artifact, 'Evidence has no recorded warnings.')
      : contractProof(record, contract, 'failed', artifact, 'Evidence has ' + warnings + ' recorded warning(s).');
  }
  if (contract.kind === 'route-comparison') {
    return evaluateRouteComparisonContract(record, contract, artifact, evidence);
  }
  return contractProof(record, contract, 'failed', artifact, 'Unsupported surface contract kind: ' + contract.kind);
}

function evaluateRouteComparisonContract(
  record: SurfaceCoverageRecord,
  contract: SurfaceContract,
  artifact: string,
  evidence: unknown
): SurfaceContractProof {
  const route = contract.route ?? record.surface.route;
  const samplePath = contract.samplePath;
  if (!route && !samplePath) return contractProof(record, contract, 'missing', artifact, 'Route-comparison contract needs a route or samplePath.');
  const matches = collectRouteComparisonRecords(evidence).filter((entry) => {
    const routeMatches = route ? routeComparisonPathMatches(entry.path, route) || routeComparisonPathMatches(entry.samplePath, route) : true;
    const sampleMatches = samplePath ? routeComparisonPathMatches(entry.samplePath, samplePath) || routeComparisonPathMatches(entry.path, samplePath) : true;
    const scenarioMatches = contract.scenario ? String(entry.scenario || '') === contract.scenario : true;
    return routeMatches && sampleMatches && scenarioMatches;
  });
  if (matches.length === 0) {
    return contractProof(record, contract, 'missing', artifact, 'Evidence has no route comparison record for ' + (samplePath ?? route ?? record.surface.id) + '.');
  }
  const passing = matches.find((entry) => entry.ok !== false && (!Array.isArray(entry.gaps) || entry.gaps.length === 0));
  if (passing) return contractProof(record, contract, 'passed', artifact, 'Route comparison passed for ' + (passing.samplePath || passing.path || route) + '.');
  const failed = matches.find((entry) => Array.isArray(entry.gaps) && entry.gaps.length > 0) ?? matches[0];
  const failedGaps = Array.isArray(failed.gaps) ? failed.gaps : [];
  return contractProof(record, contract, 'failed', artifact, 'Route comparison has ' + (failedGaps.length || 1) + ' gap(s) for ' + (failed.samplePath || failed.path || route) + '.');
}

function contractProof(
  record: SurfaceCoverageRecord,
  contract: SurfaceContract,
  status: SurfaceContractProof['status'],
  artifact: string | undefined,
  message: string
): SurfaceContractProof {
  return {
    id: record.surface.id + ':' + contract.id + ':contract-proof',
    contractId: contract.id,
    kind: contract.kind,
    status,
    required: contract.required,
    artifact,
    route: contract.route ?? record.surface.route,
    samplePath: contract.samplePath,
    scenario: contract.scenario,
    message,
    tags: uniqueStrings(['surface-contract', status, contract.kind, record.surface.kind, record.surface.status, ...contract.tags])
  };
}

function evidenceTextContainsProbeKind(
  config: NormalizedFrontierFrameworkConfig,
  kind: string,
  text: string
): boolean {
  const normalized = text.toLowerCase();
  return evidenceProbeTokens(config, kind).some((token) => normalized.includes(token.toLowerCase()));
}

function evidenceProbeTokens(config: NormalizedFrontierFrameworkConfig, kind: string): string[] {
  return uniqueStrings([
    kind,
    ...(DEFAULT_EVIDENCE_PROBE_TOKENS[kind] ?? []),
    ...(config.surfaces.coverage.evidenceProbeTokens[kind] ?? [])
  ]);
}

const DEFAULT_EVIDENCE_PROBE_TOKENS: Record<string, string[]> = {
  action: ['actionId', 'actionIds', 'actions', 'interaction'],
  filter: ['filter', 'filters', 'query', 'search'],
  render: ['render', 'rendering', 'renderedPathname', 'renderableNodes', 'layout', 'screenshot', 'canvas', 'visual'],
  state: ['state', 'statePath', 'statePaths', 'stateVector', 'snapshot']
};

function resolveEvidenceArtifactPath(cwd: string, config: NormalizedFrontierFrameworkConfig, artifact: string): string {
  if (path.isAbsolute(artifact)) return artifact;
  for (const root of config.surfaces.coverage.evidenceRoots) {
    const candidate = path.resolve(cwd, root, artifact);
    if (existsSync(candidate)) return candidate;
  }
  const fallbackRoot = config.surfaces.coverage.evidenceRoots[0] ?? '.';
  return path.resolve(cwd, fallbackRoot, artifact);
}

function newestEvidenceReference(cwd: string, record: SurfaceCoverageRecord): { label: string; mtimeMs: number } | undefined {
  const references = record.surface.files.map((file) => ({ label: file, file: path.isAbsolute(file) ? file : path.resolve(cwd, file) }));
  let newest: { label: string; mtimeMs: number } | undefined;
  for (const reference of references) {
    const stat = safeStat(reference.file);
    if (!stat) continue;
    if (!newest || stat.mtimeMs > newest.mtimeMs) newest = { label: reference.label, mtimeMs: stat.mtimeMs };
  }
  return newest;
}

function shouldCheckEvidenceArtifact(artifact: string): boolean {
  const trimmed = artifact.trim();
  if (!trimmed) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return false;
  if (trimmed.startsWith('urn:') || trimmed.startsWith('#')) return false;
  return true;
}

function safeStat(file: string): { mtimeMs: number } | undefined {
  try {
    return statSync(file);
  } catch {
    return undefined;
  }
}

function safeReadText(file: string): string | undefined {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
}

function safeReadJson(file: string): unknown {
  const text = safeReadText(file);
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function readRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function countNamedArrays(value: unknown, key: string, depth = 0): number {
  if (depth > 8 || value === null || typeof value !== 'object') return 0;
  if (Array.isArray(value)) return value.reduce<number>((count, item) => count + countNamedArrays(item, key, depth + 1), 0);
  const record = readRecord(value);
  const own = Array.isArray(record[key]) ? record[key].length : 0;
  return Object.values(record).reduce<number>((count, item) => count + countNamedArrays(item, key, depth + 1), own);
}

function collectRouteComparisonRecords(value: unknown, depth = 0): Array<Record<string, unknown>> {
  if (depth > 8 || value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectRouteComparisonRecords(item, depth + 1));
  const record = readRecord(value);
  const candidateRecords = [...arrayFromUnknown(record.records), ...arrayFromUnknown(record.comparisonRecords)];
  const ownRecords = candidateRecords
    .filter((entry) => {
      const item = readRecord(entry);
      return Boolean(item.path || item.samplePath) && ('frontier' in item || 'legacy' in item || 'deltas' in item || 'gaps' in item);
    }).map((entry) => readRecord(entry))
  const nested = Object.values(record).flatMap((item) => collectRouteComparisonRecords(item, depth + 1));
  return [...ownRecords, ...nested];
}

function routeComparisonPathMatches(candidate: unknown, target: string): boolean {
  const left = comparablePath(String(candidate || ''));
  const right = comparablePath(target);
  if (left === right) return true;
  return routePatternMatches(left, right) || routePatternMatches(right, left);
}

function routePatternMatches(pattern: string, pathname: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(':') && patternPart.endsWith('*')) return pathParts.length >= index;
    if (patternPart.startsWith(':')) {
      if (!pathPart) return false;
      continue;
    }
    if (pathPart !== patternPart) return false;
  }
  return patternParts.length === pathParts.length;
}

function arrayFromUnknown(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function comparablePath(value: string): string {
  return ensureLeadingSlash(value).split(/[?#]/, 1)[0] ?? '';
}

function ensureLeadingSlash(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
}

function createSurfaceProbePlan(
  record: SurfaceCoverageRecord,
  kind: string,
  reason: string,
  command: string,
  artifact?: string
): SurfaceCoverageProbePlan {
  return {
    id: record.surface.id + ':' + kind + ':evidence-file',
    surfaceId: record.surface.id,
    kind,
    status: 'missing',
    command,
    reason,
    route: record.surface.route,
    artifact,
    tags: ['surface-coverage', 'next-probe', kind, command, record.surface.kind, record.surface.status]
  };
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
