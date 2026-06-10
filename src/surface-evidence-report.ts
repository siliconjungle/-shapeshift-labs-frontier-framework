import type {
  FrontierFrameworkAgentLoopReport,
  FrontierFrameworkSurfaceCoverageReport
} from './index.ts';

export type SurfaceCoverageRecord = FrontierFrameworkSurfaceCoverageReport['records'][number];
export type SurfaceCoverageProbe = SurfaceCoverageRecord['probes'][number];
export type SurfaceCoverageProbePlan = SurfaceCoverageRecord['nextProbes'][number];
export type SurfaceCoverageBucket = { total: number; ok: number; missing: number; evidenceLinked: number };
export type SurfaceProbeBucket = { total: number; covered: number; missing: number; planned: number; surfaces: string[] };

export function createSurfaceCoverageSummary(records: readonly SurfaceCoverageRecord[]): FrontierFrameworkSurfaceCoverageReport['summary'] {
  let requiredSurfaceCount = 0;
  let okCount = 0;
  let missingCount = 0;
  let plannedProbeCount = 0;
  let coveredProbeCount = 0;
  let missingProbeCount = 0;
  let nextProbeCount = 0;
  let evidenceLinkedCount = 0;
  let contractCount = 0;
  let passedContractCount = 0;
  let failedContractCount = 0;
  let missingContractCount = 0;
  let plannedContractCount = 0;
  for (const record of records) {
    if (record.required.length > 0 || record.contracts.some((contract) => contract.required)) requiredSurfaceCount += 1;
    if (record.ok) okCount += 1;
    else missingCount += 1;
    if (record.surface.evidence.length > 0) evidenceLinkedCount += 1;
    nextProbeCount += record.nextProbes.length;
    for (const probe of record.probes) {
      if (probe.status === 'planned') plannedProbeCount += 1;
      if (probe.status === 'covered') coveredProbeCount += 1;
      if (probe.status === 'missing') missingProbeCount += 1;
    }
    contractCount += record.contractProofs.length;
    for (const proof of record.contractProofs) {
      if (proof.status === 'passed') passedContractCount += 1;
      if (proof.status === 'failed') failedContractCount += 1;
      if (proof.status === 'missing') missingContractCount += 1;
      if (proof.status === 'planned') plannedContractCount += 1;
    }
  }
  return {
    surfaceCount: records.length,
    requiredSurfaceCount,
    okCount,
    missingCount,
    plannedProbeCount,
    coveredProbeCount,
    missingProbeCount,
    nextProbeCount,
    evidenceLinkedCount,
    contractCount,
    passedContractCount,
    failedContractCount,
    missingContractCount,
    plannedContractCount
  };
}

export function createSurfaceCoverageDashboard(records: readonly SurfaceCoverageRecord[]): FrontierFrameworkSurfaceCoverageReport['dashboard'] {
  const byKind: Record<string, SurfaceCoverageBucket> = {};
  const byStatus: Record<string, SurfaceCoverageBucket> = {};
  const byProbe: Record<string, SurfaceProbeBucket> = {};
  const byContract: FrontierFrameworkSurfaceCoverageReport['dashboard']['byContract'] = {};
  const routes = new Map<string, { route: string; total: number; ok: number; missing: number; surfaces: string[] }>();
  for (const record of records) {
    updateSurfaceBucket(byKind, record.surface.kind, record);
    updateSurfaceBucket(byStatus, record.surface.status, record);
    for (const probe of record.probes) updateProbeBucket(byProbe, probe, record.surface.id);
    for (const proof of record.contractProofs) updateContractBucket(byContract, proof, record.surface.id);
    if (record.surface.route) {
      const route = record.surface.route.startsWith('/') ? record.surface.route : '/' + record.surface.route;
      const bucket = routes.get(route) ?? { route, total: 0, ok: 0, missing: 0, surfaces: [] };
      bucket.total += 1;
      if (record.ok) bucket.ok += 1;
      else bucket.missing += 1;
      bucket.surfaces.push(record.surface.id);
      routes.set(route, bucket);
    }
  }
  return {
    byKind,
    byStatus,
    byRoute: Array.from(routes.values()).sort((left, right) => left.route.localeCompare(right.route)),
    byProbe,
    byContract
  };
}

function updateSurfaceBucket(
  buckets: Record<string, SurfaceCoverageBucket>,
  key: string,
  record: SurfaceCoverageRecord
): void {
  const bucket = buckets[key] ?? { total: 0, ok: 0, missing: 0, evidenceLinked: 0 };
  bucket.total += 1;
  if (record.ok) bucket.ok += 1;
  else bucket.missing += 1;
  if (record.surface.evidence.length > 0) bucket.evidenceLinked += 1;
  buckets[key] = bucket;
}

function updateProbeBucket(
  buckets: Record<string, SurfaceProbeBucket>,
  probe: SurfaceCoverageProbe,
  surfaceId: string
): void {
  const bucket = buckets[probe.kind] ?? { total: 0, covered: 0, missing: 0, planned: 0, surfaces: [] };
  bucket.total += 1;
  if (probe.status === 'covered') bucket.covered += 1;
  if (probe.status === 'missing') bucket.missing += 1;
  if (probe.status === 'planned') bucket.planned += 1;
  if (!bucket.surfaces.includes(surfaceId)) bucket.surfaces.push(surfaceId);
  buckets[probe.kind] = bucket;
}

function updateContractBucket(
  buckets: FrontierFrameworkSurfaceCoverageReport['dashboard']['byContract'],
  proof: SurfaceCoverageRecord['contractProofs'][number],
  surfaceId: string
): void {
  const bucket = buckets[proof.kind] ?? { total: 0, passed: 0, failed: 0, missing: 0, planned: 0, surfaces: [] };
  bucket.total += 1;
  if (proof.status === 'passed') bucket.passed += 1;
  if (proof.status === 'failed') bucket.failed += 1;
  if (proof.status === 'missing') bucket.missing += 1;
  if (proof.status === 'planned') bucket.planned += 1;
  if (!bucket.surfaces.includes(surfaceId)) bucket.surfaces.push(surfaceId);
  buckets[proof.kind] = bucket;
}

export function createAgentLoopSurface(record: SurfaceCoverageRecord): FrontierFrameworkAgentLoopReport['missing'][number] {
  return {
    id: record.surface.id,
    kind: record.surface.kind,
    title: record.surface.title,
    status: record.surface.status,
    route: record.surface.route,
    feature: record.surface.feature,
    owner: record.surface.owner,
    ok: record.ok,
    required: [...record.required],
    missing: [...record.missing],
    covered: [...record.covered],
    evidence: [...record.surface.evidence],
    probes: record.probes.map((probe) => ({ ...probe, tags: [...probe.tags] })),
    nextProbes: record.nextProbes.map((probe) => ({ ...probe, tags: [...probe.tags] })),
    contracts: record.contracts.map((contract) => ({ ...contract, tags: [...contract.tags], metadata: { ...contract.metadata } })),
    contractProofs: record.contractProofs.map((proof) => ({ ...proof, tags: [...proof.tags] })),
    nextCommand: agentLoopNextCommand(record),
    hint: record.hints[0],
    tags: [...record.surface.tags]
  };
}

function agentLoopNextCommand(record: SurfaceCoverageRecord): string {
  if (record.nextProbes[0]) return record.nextProbes[0].command;
  if (record.missing.includes('evidence')) return 'attach-evidence';
  if (record.missing.length > 0) return 'attach-' + record.missing[0] + '-evidence';
  if (record.probes.some((probe) => probe.status === 'planned')) return 'complete-planned-probe';
  return 'inspect';
}

export function sortAgentLoopSurface(
  left: FrontierFrameworkAgentLoopReport['missing'][number],
  right: FrontierFrameworkAgentLoopReport['missing'][number]
): number {
  if (left.ok !== right.ok) return left.ok ? 1 : -1;
  if (left.route && !right.route) return -1;
  if (!left.route && right.route) return 1;
  return left.id.localeCompare(right.id);
}

export function createAgentLoopWorkQueue(
  records: readonly SurfaceCoverageRecord[]
): FrontierFrameworkAgentLoopReport['workQueue'] {
  const work: FrontierFrameworkAgentLoopReport['workQueue'] = [];
  for (const record of records) {
    const plannedKinds = new Set(record.nextProbes.map((probe) => probe.kind));
    for (const probe of record.nextProbes) work.push(createProbeWork(record, probe, work.length));
    for (const probe of record.probes) {
      if (probe.status !== 'planned' || plannedKinds.has(probe.kind)) continue;
      work.push(createPlannedWork(record, probe, work.length));
    }
    if (!record.ok && record.nextProbes.length === 0) work.push(createInspectionWork(record, work.length));
  }
  return work.sort(sortWorkItem).map((item, index) => ({ ...item, priority: index + 1 }));
}

function createProbeWork(
  record: SurfaceCoverageRecord,
  probe: SurfaceCoverageProbePlan,
  index: number
): FrontierFrameworkAgentLoopReport['workQueue'][number] {
  return {
    id: 'work:' + record.surface.id + ':' + probe.kind + ':' + probe.command,
    priority: index + 1,
    kind: probe.status === 'planned' ? 'planned-probe' : 'missing-probe',
    surfaceId: record.surface.id,
    surfaceKind: record.surface.kind,
    surfaceStatus: record.surface.status,
    title: 'Resolve ' + probe.kind + ' coverage for ' + record.surface.title,
    route: probe.route ?? record.surface.route,
    feature: record.surface.feature,
    owner: record.surface.owner,
    probeKind: probe.kind,
    command: probe.command,
    reason: probe.reason,
    required: record.required.includes(probe.kind) || probe.status === 'missing',
    artifacts: uniqueStrings([probe.artifact, ...record.surface.evidence].filter((item): item is string => Boolean(item))),
    acceptance: createProbeAcceptance(record, probe),
    tags: uniqueStrings(['agent-loop', 'work-queue', ...probe.tags, record.surface.kind, record.surface.status])
  };
}

function createPlannedWork(
  record: SurfaceCoverageRecord,
  probe: SurfaceCoverageProbe,
  index: number
): FrontierFrameworkAgentLoopReport['workQueue'][number] {
  return {
    id: 'work:' + record.surface.id + ':' + probe.kind + ':complete-planned-probe',
    priority: index + 1,
    kind: 'planned-probe',
    surfaceId: record.surface.id,
    surfaceKind: record.surface.kind,
    surfaceStatus: record.surface.status,
    title: 'Complete planned ' + probe.kind + ' probe for ' + record.surface.title,
    route: probe.route ?? record.surface.route,
    feature: record.surface.feature,
    owner: record.surface.owner,
    probeKind: probe.kind,
    command: 'complete-planned-probe',
    reason: probe.tags.find((tag) => !['surface-coverage', 'planned', record.surface.kind, record.surface.status].includes(tag)) ?? 'Probe is planned but not covered yet.',
    required: false,
    artifacts: probe.artifact ? [probe.artifact] : [],
    acceptance: [
      'Surface ' + record.surface.id + ' either covers ' + probe.kind + ' or no longer declares it as planned.',
      'Rerun frontier loop --json after updating the surface or evidence.'
    ],
    tags: uniqueStrings(['agent-loop', 'work-queue', ...probe.tags, record.surface.kind, record.surface.status])
  };
}

function createInspectionWork(
  record: SurfaceCoverageRecord,
  index: number
): FrontierFrameworkAgentLoopReport['workQueue'][number] {
  return {
    id: 'work:' + record.surface.id + ':inspect',
    priority: index + 1,
    kind: 'surface-inspection',
    surfaceId: record.surface.id,
    surfaceKind: record.surface.kind,
    surfaceStatus: record.surface.status,
    title: 'Inspect missing surface coverage for ' + record.surface.title,
    route: record.surface.route,
    feature: record.surface.feature,
    owner: record.surface.owner,
    command: 'inspect',
    reason: record.hints[0] ?? 'Surface is missing required coverage but has no concrete probe plan.',
    required: true,
    artifacts: [...record.surface.evidence],
    acceptance: [
      'Surface ' + record.surface.id + ' is ok in frontier loop output.',
      'Rerun frontier loop --strict --json when strict coverage is enabled.'
    ],
    tags: uniqueStrings(['agent-loop', 'work-queue', record.surface.kind, record.surface.status])
  };
}

function createProbeAcceptance(
  record: SurfaceCoverageRecord,
  probe: SurfaceCoverageProbePlan
): string[] {
  const acceptance = [
    'Surface ' + record.surface.id + ' covers ' + probe.kind + '.',
    'Rerun frontier loop --json after updating the surface or evidence.'
  ];
  if (probe.route) acceptance.push('Route ' + probe.route + ' has render/state/evidence coverage when that probe is required.');
  if (probe.statePath) acceptance.push('State path ' + probe.statePath + ' is covered by a scenario or evidence artifact.');
  return acceptance;
}

function sortWorkItem(
  left: FrontierFrameworkAgentLoopReport['workQueue'][number],
  right: FrontierFrameworkAgentLoopReport['workQueue'][number]
): number {
  if (left.required !== right.required) return left.required ? -1 : 1;
  const leftCommand = commandPriority(left.command);
  const rightCommand = commandPriority(right.command);
  if (leftCommand !== rightCommand) return leftCommand - rightCommand;
  const leftKind = surfaceKindPriority(left.surfaceKind);
  const rightKind = surfaceKindPriority(right.surfaceKind);
  if (leftKind !== rightKind) return leftKind - rightKind;
  if (left.route && !right.route) return -1;
  if (!left.route && right.route) return 1;
  return left.id.localeCompare(right.id);
}

function commandPriority(command: string): number {
  if (command === 'add-route-scenario') return 10;
  if (command === 'add-render-evidence') return 20;
  if (command === 'add-state-probe') return 30;
  if (command.startsWith('attach-') && command.endsWith('-evidence')) return 40;
  if (command === 'attach-evidence') return 50;
  if (command === 'refresh-evidence') return 60;
  if (command === 'complete-planned-probe') return 80;
  return 90;
}

function surfaceKindPriority(kind: string): number {
  if (kind === 'route') return 10;
  if (kind === 'page') return 20;
  if (kind === 'action') return 30;
  if (kind === 'filter') return 40;
  if (kind === 'feature') return 50;
  return 90;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function createAgentLoopFocus(
  records: readonly SurfaceCoverageRecord[],
  focusKinds: readonly string[]
): FrontierFrameworkAgentLoopReport['dashboard']['focus'] {
  const focus: FrontierFrameworkAgentLoopReport['dashboard']['focus'] = {};
  for (const kind of focusKinds) focus[kind] = { total: 0, ok: 0, missing: 0, next: [] };
  for (const record of records) {
    if (!focusKinds.includes(record.surface.kind)) continue;
    const bucket = focus[record.surface.kind] ?? { total: 0, ok: 0, missing: 0, next: [] };
    bucket.total += 1;
    if (record.ok) bucket.ok += 1;
    else {
      bucket.missing += 1;
      bucket.next.push(record.surface.id);
    }
    focus[record.surface.kind] = bucket;
  }
  return focus;
}
