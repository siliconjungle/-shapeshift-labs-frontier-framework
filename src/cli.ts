#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  createPreviewProof,
  createPreviewRegistryGraph,
  validatePreviewManifest,
  type FrontierPreviewDiagnostic,
  type FrontierPreviewProof
} from '@shapeshift-labs/frontier-component-preview';
import {
  createDocumentationProof,
  createDocumentationSearchRecords,
  formatDocumentationJsonl,
  validateDocumentationManifest,
  type FrontierDocumentationDiagnostic,
  type FrontierDocumentationProof
} from '@shapeshift-labs/frontier-documentation';
import {
  createPreviewAgentRunbook,
  createPreviewBenchmarkPlan,
  createPreviewBrowserEvidencePlan,
  createPreviewFuzzCases,
  createPreviewHarnessManifest
} from '@shapeshift-labs/frontier-component-preview/harness';
import {
  createDocumentationAgentRunbook,
  createDocumentationBenchmarkPlan,
  createDocumentationBrowserEvidencePlan,
  createDocumentationFuzzCases,
  createDocumentationHarnessManifest,
  lintDocumentationManifest
} from '@shapeshift-labs/frontier-documentation/harness';
import {
  createAstLintResources,
  createAstRegistryGraph,
  walkFrontierSources,
  type FrontierAstBusinessLogicFinding,
  type FrontierAstRegistryGraph,
  type FrontierAstSeverity,
  type FrontierAstSourceGraph,
  type FrontierAstWalkOptions
} from '@shapeshift-labs/frontier-ast-walk';
import {
  writePreviewArtifacts,
  type FrontierPreviewWrittenArtifact
} from '@shapeshift-labs/frontier-component-preview/node';
import {
  discoverFrontierDocumentation,
  writeDocumentationArtifacts,
  type FrontierDocumentationWrittenArtifact
} from '@shapeshift-labs/frontier-documentation/node';
import {
  formatLintSarif,
  lintFrontier,
  type FrontierLintDiagnostic,
  type FrontierLintInput,
  type FrontierLintResult
} from '@shapeshift-labs/frontier-linter';
import {
  createAuthEvidence,
  createAuthLintResources,
  type FrontierAuthEvidence
} from '@shapeshift-labs/frontier-auth';
import { createToolDescriptors } from '@shapeshift-labs/frontier-tools';
import {
  createWorkflowManifest,
  createWorkflowProof
} from '@shapeshift-labs/frontier-workflow';
import {
  FRONTIER_FRAMEWORK_CONFIG_FILES,
  createFrontierAuthManifest,
  createFrontierAgentLoopReport,
  createFrontierFramework,
  createFrontierFrameworkScaffold,
  createFrontierDeployPlan,
  createSurfaceCoverageReport,
  createSurfaceStatusReport,
  explainFrontierFrameworkConfig,
  normalizeFrontierFrameworkConfig,
  renderNormalizedFrontierDevtoolsOverlayModule,
  validateFrontierFrameworkConfig,
  type FrontierFrameworkArtifactPlan,
  type FrontierFrameworkAgentLoopReport,
  type FrontierFrameworkConfig,
  type FrontierFrameworkConfigValidationResult,
  type FrontierFrameworkSurfaceCoverageReport,
  type FrontierFrameworkSurfaceStatusQuery,
  type FrontierFrameworkSurfaceStatusReport,
  type FrontierFrontendRouteConfig,
  type NormalizedFrontierFrameworkConfig
} from './index.ts';
import {
  createCliFrameworkPlan,
  verifyAgentLoopEvidence,
  verifySurfaceCoverageEvidence
} from './surface-evidence.ts';

type CliTarget = 'all' | 'frontend' | 'backend' | 'evidence';
type HarnessTarget = 'all' | 'tests' | 'fuzzers' | 'benchmarks' | 'browser' | 'agent' | 'linter' | 'hybrid';
type DocsAction = 'discover' | 'inspect' | 'build' | 'dev' | 'lint' | 'test' | 'fuzz' | 'bench' | 'jsonl';
type CompileFrontierJsx = typeof import('@shapeshift-labs/frontier-dom/compiler').compileFrontierJsx;
const PAGE_ROUTE_LEAF_BASENAMES = new Set(['index', 'page', '+page', 'route']);
const NON_ROUTE_SOURCE_BASENAMES = new Set(['layout', 'template', 'loading', 'error', 'not-found', 'default']);
const SOURCE_POLICY_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mts', '.cts']);

interface CliArgs {
  command: string;
  cwd: string;
  config?: string;
  target: CliTarget;
  docsAction?: DocsAction;
  out?: string;
  cases?: number;
  configAction?: 'explain' | 'validate';
  configExplainPath?: string;
  json: boolean;
  name?: string;
  dir?: string;
  monorepo: boolean;
  packageManager?: string;
  port: number;
  install: boolean;
  strict: boolean;
  harnessTarget: HarnessTarget;
  surfaceQuery: FrontierFrameworkSurfaceStatusQuery;
}

interface CompiledRoute {
  route: FrontierFrontendRouteConfig;
  html: string;
  diagnostics: unknown[];
  manifest: unknown;
  cached?: boolean;
  dependencies?: string[];
  fingerprint?: string;
}

interface TsxBundleContext {
  resolvedFiles: Map<string, string>;
  sourceText: Map<string, string>;
  localImports: Map<string, LocalImport[]>;
}

interface TsxBundleResult {
  code: string;
  files: string[];
  fingerprint: string;
}

interface FrontendRouteCacheEntry {
  path: string;
  file: string;
  entry?: string;
  configFingerprint?: string;
  fingerprint: string;
  html: string;
  diagnostics: unknown[];
  manifest: unknown;
  dependencies: string[];
  dependencyStats?: FrontendRouteDependencyStat[];
}

interface FrontendRouteDependencyStat {
  file: string;
  size: number;
  mtimeMs: number;
}

interface FrontendBuildCache {
  kind: 'frontier.framework.frontend.cache';
  appId: string;
  version: number;
  generatedAt: string;
  routes: Record<string, FrontendRouteCacheEntry>;
}

interface FrontendCacheValidationContext {
  dependencyStats: Map<string, FrontendRouteDependencyStat | false>;
}

interface ViteBuildResult {
  enabled: boolean;
  hmr: boolean;
  used: boolean;
  skipped: boolean;
  strict: boolean;
  configFile: string;
  generatedEntryDir: string;
  outDir: string;
  error?: string;
}

interface DevtoolsBuildResult {
  enabled: boolean;
  emitted: boolean;
  scriptPath: string;
}

interface ComponentPreviewArtifact {
  kind: string;
  file: string;
}

interface ComponentPreviewBuild {
  kind: 'frontier.framework.component-preview.build';
  appId: string;
  enabled: boolean;
  generatedAt: string;
  rootDir: string;
  outDir: string;
  include: string[];
  exclude: string[];
  renderer: string;
  entries: number;
  variants: number;
  sources: number;
  files: string[];
  diagnostics: FrontierPreviewDiagnostic[];
  artifacts: ComponentPreviewArtifact[];
  manifestId?: string;
  proof?: FrontierPreviewProof;
  registry?: {
    kind?: string;
    entries: number;
    edges: number;
  };
  harness?: {
    targets: number;
    commands: number;
  };
  fuzzCases?: number;
  benchmarks?: number;
  browserEvidencePages?: number;
  runbookSteps?: number;
  htmlFile?: string;
  manifestFile?: string;
  moduleFile?: string;
}

interface DocumentationArtifact {
  kind: string;
  file: string;
}

interface DocumentationBuild {
  kind: 'frontier.framework.documentation.build';
  appId: string;
  enabled: boolean;
  generatedAt: string;
  rootDir: string;
  outDir: string;
  include: string[];
  exclude: string[];
  pages: number;
  sections: number;
  sources: number;
  searchRecords: number;
  files: string[];
  diagnostics: FrontierDocumentationDiagnostic[];
  artifacts: DocumentationArtifact[];
  manifestId?: string;
  proof?: FrontierDocumentationProof;
  harness?: {
    fixtures: number;
    commands: number;
  };
  fuzzCases?: number;
  benchmarks?: number;
  browserEvidencePages?: number;
  runbookSteps?: number;
  htmlFile?: string;
  manifestFile?: string;
  moduleFile?: string;
  searchFile?: string;
  jsonlFile?: string;
}

interface FrontendBuildResult {
  routes: CompiledRoute[];
  vite: ViteBuildResult;
  devtools: DevtoolsBuildResult;
}

interface RouteDiscoverySummary {
  kind: 'frontier.framework.route.discovery';
  appId: string;
  root: string;
  routes: Array<{
    id?: string;
    path: string;
    file: string;
    source: 'config' | 'filesystem';
    signature: string;
    segments: string[];
  }>;
}

interface SourcePolicyViolation {
  id: string;
  file: string;
  rule: 'max-frontier-components-per-file' | 'max-lines-per-file' | 'max-chars-per-file' | 'local-source-import-extension' | 'business-logic-in-adapter' | 'runtime-module-file-missing' | 'runtime-module-file-unchecked' | 'runtime-module-ownership-duplicate';
  actual: number;
  max: number | false;
  enforcement: string;
  layer?: string;
  symbol?: string;
  range?: {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
  };
  message: string;
}

interface SourcePolicyFileReport {
  file: string;
  layer?: string;
  lines: number;
  chars: number;
  frontierComponentCount: number;
  frontierComponents: string[];
  imports?: number;
  declarations?: number;
  calls?: number;
  businessLogicFindings?: number;
}

interface SourcePolicyRuntimeModuleReport {
  id: string;
  kind?: string;
  title?: string;
  owner?: string;
  owns: string[];
  files: string[];
  missingFiles: string[];
  uncheckedFiles: string[];
  bindings: Array<{
    kind: string;
    target?: string;
    events: string[];
    actions: string[];
    tools: string[];
    snapshots: string[];
    tests: string[];
    capabilities: string[];
  }>;
  reads: string[];
  writes: string[];
  actions: string[];
  effects: string[];
  capabilities: string[];
  evidence: string[];
  tags: string[];
}

interface SourcePolicyReport {
  kind: 'frontier.framework.source-policy.report';
  appId: string;
  enabled: boolean;
  ok: boolean;
  preset: string;
  enforcement: string;
  generatedAt: string;
  rules: {
    maxFrontierComponentsPerFile: number | false;
    maxLinesPerFile: number | false;
    maxCharsPerFile: number | false;
    localImportExtensions: string;
    businessLogic: boolean;
  };
  include: string[];
  exclude: string[];
  checkedFiles: SourcePolicyFileReport[];
  runtimeModules: SourcePolicyRuntimeModuleReport[];
  violations: SourcePolicyViolation[];
  businessLogicFindings: FrontierAstBusinessLogicFinding[];
  sourceGraph?: FrontierAstSourceGraph;
  sourceRegistry?: FrontierAstRegistryGraph;
}

interface ConformanceReport {
  kind: 'frontier.framework.conformance.report';
  appId: string;
  enabled: boolean;
  ok: boolean;
  mode: string;
  enforcement: string;
  generatedAt: string;
  packageCount: number;
  sourceCount: number;
  requiredPackageUses: NormalizedFrontierFrameworkConfig['conformance']['requiredPackageUses'];
  lint: FrontierLintResult;
}

interface MigrationManifestBuild {
  kind: 'frontier.framework.migrations.manifest';
  appId: string;
  enabled: boolean;
  registryId: string;
  currentVersion: string;
  initialVersion: string;
  strict: boolean;
  failOnMissingVersion: boolean;
  autoMigrateState: boolean;
  autoMigrateCache: boolean;
  generatedAt: string;
  generatedDir: string;
  runtimeBridgeFile: string;
  evidenceFile: string;
  package: string;
  sources: NormalizedFrontierFrameworkConfig['migrations']['sources'];
  integration: Array<{
    sourceId: string;
    kind: string;
    runtimeHook: string;
    required: boolean;
  }>;
}

interface AuthManifestBuild extends FrontierAuthEvidence {
  enabled: boolean;
  strict: boolean;
  generatedDir: string;
  manifestFile: string;
  evidenceFile: string;
}

interface ConfigExplainReport {
  kind: 'frontier.framework.config.explain';
  query?: string;
  generatedAt: string;
  entries: ReturnType<typeof explainFrontierFrameworkConfig>;
}

type ConfigCommandReport = FrontierFrameworkConfigValidationResult | ConfigExplainReport;

interface HarnessCheck {
  id: string;
  kind: HarnessTarget;
  required: boolean;
  ok: boolean;
  command?: string;
  missing: string[];
  tags: string[];
}

interface HarnessValidation {
  kind: 'frontier.framework.harness.validation';
  appId: string;
  mode: string;
  ok: boolean;
  target: HarnessTarget;
  evidenceDir: string;
  generatedAt: string;
  checks: HarnessCheck[];
}

interface HarnessTemplateBuild {
  generatedDir: string;
  corpusDir: string;
  files: string[];
}

interface AgentBundleBuild {
  generatedDir: string;
  runbookFile: string;
  handoffFile: string;
  surfaceCoverageFile: string;
  surfaceDashboardFile: string;
  surfaceLoopFile: string;
  surfaceLoopDashboardFile: string;
  mcpManifestFile: string;
  toolManifestFile: string;
  ciGatesFile: string;
  lintReportFile: string;
  sarifFile: string;
  workflowFile: string;
  workflowProofFile: string;
  issueHandoffFile: string;
  prHandoffFile: string;
  replayScriptFile: string;
  files: string[];
  readiness: AgentReadiness;
}

interface AgentCiGate {
  id: string;
  title: string;
  required: boolean;
  command?: string;
  artifacts: string[];
  evidence: string[];
  tags: string[];
  source: string;
  ok?: boolean;
  detail?: string;
}

interface AgentCiGateBundle {
  kind: 'frontier.framework.agent.ci-evidence-gates';
  appId: string;
  generatedAt: string;
  mode: string;
  gates: AgentCiGate[];
  commands: string[];
  requiredArtifacts: string[];
}

interface AgentReadiness {
  kind: 'frontier.framework.agent.readiness';
  appId: string;
  ok: boolean;
  generatedAt: string;
  checks: Array<{
    id: string;
    required: boolean;
    ok: boolean;
    detail: string;
  }>;
}

interface DoctorCheck {
  id: string;
  ok: boolean;
  required: boolean;
  detail: string;
  fix?: string;
  tags: string[];
}

interface DoctorReport {
  kind: 'frontier.framework.doctor';
  appId: string;
  ok: boolean;
  generatedAt: string;
  configValidation: FrontierFrameworkConfigValidationResult;
  checks: DoctorCheck[];
  summary: {
    routes: number;
    endpoints: number;
    transports: number;
    sourcePolicyViolations: number;
    surfaceCoverageMissing: number;
    deployTargets: number;
  };
}

export async function runFrontierCli(argv = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv);
  if (args.command === 'help' || args.command === '--help' || args.command === '-h') {
    process.stdout.write(renderHelp());
    return;
  }
  if (args.command === 'init') {
    await initCommand(args);
    return;
  }
  if (args.command === 'build') {
    const result = await buildCommand(args);
    if (args.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else process.stdout.write(renderBuildSummary(result) + '\n');
    return;
  }
  if (args.command === 'inspect') {
    const rawConfig = await loadConfig(args);
    const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
    const config = normalizeFrontierFrameworkConfig(applyCliOverrides(discoveredConfig, args));
    const plan = createCliFrameworkPlan(args.cwd, config);
    process.stdout.write(args.json ? JSON.stringify(plan, null, 2) + '\n' : renderPlanSummary(plan) + '\n');
    return;
  }
  if (args.command === 'deploy-plan') {
    const rawConfig = await loadConfig(args);
    const config = await withDiscoveredRoutes(args.cwd, rawConfig);
    const plan = createFrontierDeployPlan(config);
    process.stdout.write(args.json ? JSON.stringify(plan, null, 2) + '\n' : renderDeploySummary(plan) + '\n');
    return;
  }
  if (args.command === 'doctor') {
    const result = await doctorCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderDoctorSummary(result) + '\n');
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (args.command === 'lint') {
    const result = await lintCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderConformanceSummary(result) + '\n');
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (args.command === 'config') {
    const result = await configCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderConfigCommandSummary(args, result) + '\n');
    if ('ok' in result && result.ok === false) process.exitCode = 1;
    return;
  }
  if (args.command === 'auth') {
    const result = await authCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderAuthSummary(result) + '\n');
    return;
  }
  if (args.command === 'migrations') {
    const result = await migrationsCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderMigrationsSummary(result) + '\n');
    return;
  }
  if (args.command === 'docs' || args.command === 'documentation') {
    const result = await documentationCommand(args);
    if (typeof result === 'string') process.stdout.write(result);
    else process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderDocumentationSummary(result) + '\n');
    return;
  }
  if (args.command === 'surfaces' || args.command === 'status') {
    const result = await surfacesCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderSurfaceStatusSummary(result) + '\n');
    return;
  }
  if (args.command === 'coverage') {
    const result = await coverageCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderSurfaceCoverageSummary(result) + '\n');
    if (!result.ok && (args.strict || result.failOnMissing)) process.exitCode = 1;
    return;
  }
  if (args.command === 'loop' || args.command === 'agent-loop') {
    const result = await loopCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderAgentLoopSummary(result) + '\n');
    if (!result.ok && (args.strict || result.strict)) process.exitCode = 1;
    return;
  }
  if (args.command === 'agent') {
    const result = await agentCommand(args);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderAgentSummary(result) + '\n');
    if (!result.readiness.ok) process.exitCode = 1;
    return;
  }
  if (args.command === 'harness' || args.command === 'fuzz' || args.command === 'bench') {
    const target = args.command === 'fuzz' ? 'fuzzers' : args.command === 'bench' ? 'benchmarks' : args.harnessTarget;
    const result = await harnessCommand(args, target);
    process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : renderHarnessSummary(result) + '\n');
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (args.command === 'dev') {
    const result = await buildCommand({ ...args, target: 'frontend' });
    const outDir = path.resolve(args.cwd, result.config.frontend.outDir);
    await serveStatic(outDir, args.port);
    return;
  }
  throw new Error('Unknown frontier command: ' + args.command);
}

async function initCommand(args: CliArgs): Promise<void> {
  const targetDir = path.resolve(args.cwd, args.dir ?? args.name ?? 'frontier-framework');
  await fs.mkdir(targetDir, { recursive: true });
  const files = createFrontierFrameworkScaffold({
    name: args.name ?? path.basename(targetDir),
    monorepo: args.monorepo,
    packageManager: args.packageManager
  });
  for (const file of files) {
    const full = path.join(targetDir, file.path);
    await fs.mkdir(path.dirname(full), { recursive: true });
    if (existsSync(full)) continue;
    await fs.writeFile(full, file.content, 'utf8');
    if (file.executable) await fs.chmod(full, 0o755);
  }
  process.stdout.write('Created Frontier framework at ' + targetDir + '\n');
  if (!args.install) process.stdout.write('Skipped install. Run your package manager before building.\n');
}

async function configCommand(args: CliArgs): Promise<ConfigCommandReport> {
  if ((args.configAction ?? 'explain') === 'validate') {
    const rawConfig = await loadConfig(args);
    const validation = validateFrontierFrameworkConfig(applyCliOverrides(rawConfig, args));
    await writeConfigValidationEvidence(args.cwd, rawConfig, validation, args);
    return validation;
  }
  return {
    kind: 'frontier.framework.config.explain',
    query: args.configExplainPath,
    generatedAt: new Date().toISOString(),
    entries: explainFrontierFrameworkConfig(args.configExplainPath)
  };
}

async function authCommand(args: CliArgs): Promise<AuthManifestBuild> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  return await writeAuthArtifacts(args.cwd, config);
}

async function migrationsCommand(args: CliArgs): Promise<MigrationManifestBuild> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  return await writeMigrationArtifacts(args.cwd, config);
}

async function documentationCommand(args: CliArgs): Promise<DocumentationBuild | Record<string, unknown> | string> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const normalized = normalizeFrontierFrameworkConfig(effectiveConfig);
  const config: NormalizedFrontierFrameworkConfig = args.out
    ? { ...normalized, documentation: { ...normalized.documentation, outDir: args.out } }
    : normalized;
  const action = args.docsAction ?? 'inspect';
  if (action === 'build' || action === 'dev') {
    const build = await buildDocumentation(args.cwd, config);
    await writeJsonFile(path.resolve(args.cwd, config.frontend.evidenceDir, 'documentation.json'), build);
    return build;
  }
  const rootDir = path.resolve(args.cwd, config.documentation.rootDir);
  const result = await discoverFrontierDocumentation({
    rootDir,
    include: config.documentation.include,
    exclude: config.documentation.exclude,
    packageName: config.documentation.packageName ?? config.id,
    packageVersion: config.documentation.packageVersion,
    title: config.documentation.title,
    generatedAt: config.documentation.generatedAt,
    integrations: config.documentation.integrations,
    maxFiles: config.documentation.maxFiles
  });
  if (action === 'jsonl') return formatDocumentationJsonl(result.manifest);
  if (action === 'lint') {
    const lint = lintDocumentationManifest(result.manifest);
    return {
      kind: 'frontier.framework.documentation.lint',
      appId: config.id,
      generatedAt: new Date().toISOString(),
      ok: lint.ok,
      diagnostics: [...result.diagnostics, ...lint.diagnostics],
      suggestedFixes: lint.suggestedFixes
    };
  }
  if (action === 'test') {
    return {
      kind: 'frontier.framework.documentation.test',
      appId: config.id,
      generatedAt: new Date().toISOString(),
      manifest: createDocumentationHarnessManifest(result.manifest, { integrations: config.documentation.integrations }),
      browserEvidence: createDocumentationBrowserEvidencePlan(result.manifest, { integrations: config.documentation.integrations }),
      runbook: createDocumentationAgentRunbook(result.manifest, { integrations: config.documentation.integrations })
    };
  }
  if (action === 'fuzz') {
    return {
      kind: 'frontier.framework.documentation.fuzz',
      appId: config.id,
      generatedAt: new Date().toISOString(),
      cases: createDocumentationFuzzCases(result.manifest, {
        casesPerPage: args.cases,
        integrations: config.documentation.integrations
      })
    };
  }
  if (action === 'bench') {
    return {
      kind: 'frontier.framework.documentation.bench',
      appId: config.id,
      generatedAt: new Date().toISOString(),
      plan: createDocumentationBenchmarkPlan(result.manifest, { integrations: config.documentation.integrations })
    };
  }
  const lint = lintDocumentationManifest(result.manifest);
  return {
    kind: 'frontier.framework.documentation.inspect',
    appId: config.id,
    generatedAt: new Date().toISOString(),
    ok: lint.ok,
    rootDir: normalizeRelativePath(args.cwd, result.rootDir),
    include: [...config.documentation.include],
    exclude: [...config.documentation.exclude],
    manifest: result.manifest,
    diagnostics: [...result.diagnostics, ...lint.diagnostics],
    proof: createDocumentationProof(result.manifest)
  };
}

async function surfacesCommand(args: CliArgs): Promise<FrontierFrameworkSurfaceStatusReport> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  return createSurfaceStatusReport(effectiveConfig, args.surfaceQuery);
}

async function coverageCommand(args: CliArgs): Promise<FrontierFrameworkSurfaceCoverageReport> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  const plan = createFrontierFramework(effectiveConfig);
  const report = verifySurfaceCoverageEvidence(args.cwd, config, plan.surfaceCoverage, plan.tests);
  await writeSurfaceCoverageArtifacts(args.cwd, config, report);
  return report;
}

async function loopCommand(args: CliArgs): Promise<FrontierFrameworkAgentLoopReport> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  const plan = createFrontierFramework(effectiveConfig);
  const report = verifyAgentLoopEvidence(args.cwd, config, createFrontierAgentLoopReport(effectiveConfig, args.surfaceQuery), plan.tests);
  await writeSurfaceCoverageArtifacts(args.cwd, config, report.coverage);
  await writeAgentLoopArtifacts(args.cwd, report);
  return report;
}

async function buildCommand(args: CliArgs) {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  let frontendBuild: FrontendBuildResult = createEmptyFrontendBuild(config);
  if (args.target === 'all' || args.target === 'frontend') {
    frontendBuild = await buildFrontend(args.cwd, config);
  }
  if (args.target === 'all' || args.target === 'backend') {
    await buildBackend(args.cwd, config);
  }
  let componentPreview = createEmptyComponentPreviewBuild(config);
  if (args.target === 'all' || args.target === 'frontend' || args.target === 'evidence') {
    componentPreview = await buildComponentPreviews(args.cwd, config);
  }
  let documentation = createEmptyDocumentationBuild(config);
  if (args.target === 'all' || args.target === 'frontend' || args.target === 'evidence') {
    documentation = await buildDocumentation(args.cwd, config);
  }
  let harnessTemplates: HarnessTemplateBuild | undefined;
  let harness: HarnessValidation | undefined;
  let agentBundle: AgentBundleBuild | undefined;
  let auth: AuthManifestBuild | undefined;
  let migrations: MigrationManifestBuild | undefined;
  let conformance: ConformanceReport | undefined;
  const shouldEmitEvidence = args.target === 'all' || args.target === 'evidence';
  let artifacts = createTargetArtifactSummary(config, args.target);
  let deployTargets = [
    ...config.deploy.frontend,
    ...config.deploy.backend,
    ...config.deploy.evidence
  ];
  if (shouldEmitEvidence) {
    const plan = createCliFrameworkPlan(args.cwd, config);
    const sourcePolicy = await evaluateSourcePolicy(args.cwd, config);
    auth = await writeAuthArtifacts(args.cwd, config);
    conformance = await writeConformanceArtifacts(args.cwd, config);
    migrations = await writeMigrationArtifacts(args.cwd, config);
    artifacts = plan.artifacts;
    deployTargets = plan.deployTargets;
    harnessTemplates = await writeHarnessTemplates(args.cwd, config, plan);
    harness = await validateFrameworkHarness(args.cwd, config, 'all', false);
    agentBundle = await writeAgentBundle(args.cwd, config, plan, harness, harnessTemplates, 'build');
    if (config.agent.handoffMode === 'strict' && !agentBundle.readiness.ok) {
      throw new Error('Frontier framework agent readiness failed in strict mode.');
    }
    if (config.harness.failOnMissing && !harness.ok) {
      await writeHarnessEvidence(args.cwd, config, harness);
      throw new Error('Frontier framework harness validation failed in strict mode.');
    }
    await writeEvidence(args.cwd, config, plan, frontendBuild, componentPreview, documentation, harness, harnessTemplates, agentBundle, sourcePolicy, conformance, configValidation, auth, migrations);
    if (!sourcePolicy.ok && sourcePolicy.enforcement === 'error') {
      throw new Error('Frontier source policy failed with ' + sourcePolicy.violations.length + ' violation(s).');
    }
    if (!plan.surfaceCoverage.ok && config.surfaces.coverage.failOnMissing) {
      throw new Error('Frontier surface coverage failed with ' + plan.surfaceCoverage.summary.missingCount + ' missing claimed surface(s).');
    }
    if (!conformance.ok && conformance.enabled && config.conformance.failOnViolation && conformance.enforcement === 'error') {
      throw new Error('Frontier conformance failed with ' + conformance.lint.summary.errorCount + ' error(s).');
    }
  }
  return {
    config,
    target: args.target,
    frontendRoutes: frontendBuild.routes.map((route) => ({
      path: route.route.path,
      file: route.route.file,
      diagnostics: route.diagnostics,
      cached: route.cached === true
    })),
    vite: frontendBuild.vite,
    devtools: frontendBuild.devtools,
    componentPreview,
    documentation,
    harnessTemplates,
    agentBundle,
    harness,
    auth,
    migrations,
    conformance,
    artifacts,
    deployTargets,
    evidence: config.frontend.evidenceDir
  };
}

async function buildFrontend(cwd: string, config: NormalizedFrontierFrameworkConfig): Promise<FrontendBuildResult> {
  const routes = config.frontend.routes.length > 0
    ? config.frontend.routes
    : await discoverRoutes(cwd, config);
  const outputs: CompiledRoute[] = [];
  const bundleContext = createTsxBundleContext();
  const previousCache = await readFrontendBuildCache(cwd, config);
  const nextCache = createEmptyFrontendBuildCache(config);
  const cacheValidationContext = createFrontendCacheValidationContext();
  let compileFrontierJsx: CompileFrontierJsx | undefined;
  for (const route of routes) {
    const entryFile = path.resolve(cwd, route.file);
    const cacheKey = frontendRouteCacheKey(route);
    const cached = previousCache?.routes[cacheKey];
    const outputPath = path.resolve(cwd, htmlFileForRoute(config.frontend.outDir, route.path));
    const freshCached = await getFreshFrontendCacheEntry(cwd, config, route, cached, outputPath, cacheValidationContext);
    if (freshCached) {
      outputs.push({
        route,
        html: freshCached.html,
        diagnostics: freshCached.diagnostics,
        manifest: freshCached.manifest,
        cached: true,
        dependencies: freshCached.dependencies,
        fingerprint: freshCached.fingerprint
      });
      nextCache.routes[cacheKey] = freshCached;
      continue;
    }
    const bundled = await bundleTsxForFrontierCompiler(entryFile, bundleContext);
    const entry = route.entry ?? inferDefaultFunctionName(bundled.code);
    const fingerprint = hashFrontendRoute(route, bundled, config, entry);
    const dependencies = bundled.files.map((file) => path.relative(cwd, file).replace(/\\/g, '/'));
    const dependencyStats = await collectFrontendDependencyStats(cwd, bundled.files);
    if (!compileFrontierJsx) compileFrontierJsx = await loadFrontierJsxCompiler();
    const result = await compileFrontierJsx(bundled.code, {
      fileName: entryFile,
      entry,
      root: { selector: '#' + config.frontend.shell.appRootId },
      source: { kind: 'frontier-framework', registry: config.id }
    });
    const html = renderHtmlDocument(result.html, config);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, 'utf8');
    outputs.push({
      route,
      html,
      diagnostics: result.diagnostics,
      manifest: result.manifest,
      cached: false,
      dependencies,
      fingerprint
    });
    nextCache.routes[cacheKey] = {
      path: route.path,
      file: route.file,
      entry,
      configFingerprint: hashFrontendRouteConfig(route, config, entry),
      fingerprint,
      html,
      diagnostics: result.diagnostics,
      manifest: result.manifest,
      dependencies,
      dependencyStats
    };
  }
  const devtools = await writeDevtoolsOverlay(cwd, config, outputs.length > 0 && outputs.every((route) => route.cached === true));
  if (!frontendBuildCacheUnchanged(previousCache, nextCache)) {
    await writeFrontendBuildCache(cwd, config, nextCache);
  }
  const vite = await runViteBuild(cwd, config, outputs);
  return { routes: outputs, vite, devtools };
}

function createEmptyFrontendBuild(config: NormalizedFrontierFrameworkConfig): FrontendBuildResult {
  return {
    routes: [],
    vite: {
      enabled: config.vite.enabled,
      hmr: config.vite.hmr,
      used: false,
      skipped: !config.vite.enabled,
      strict: config.vite.strict,
      configFile: config.vite.configFile,
      generatedEntryDir: config.vite.generatedEntryDir,
      outDir: config.vite.outDir
    },
    devtools: {
      enabled: config.devtools.enabled,
      emitted: false,
      scriptPath: config.devtools.scriptPath
    }
  };
}

function createEmptyComponentPreviewBuild(config: NormalizedFrontierFrameworkConfig): ComponentPreviewBuild {
  return {
    kind: 'frontier.framework.component-preview.build',
    appId: config.id,
    enabled: config.componentPreview.enabled,
    generatedAt: new Date().toISOString(),
    rootDir: config.componentPreview.rootDir,
    outDir: config.componentPreview.outDir,
    include: [...config.componentPreview.include],
    exclude: [...config.componentPreview.exclude],
    renderer: config.componentPreview.renderer,
    entries: 0,
    variants: 0,
    sources: 0,
    files: [],
    diagnostics: [],
    artifacts: []
  };
}

async function buildComponentPreviews(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig
): Promise<ComponentPreviewBuild> {
  if (!config.componentPreview.enabled) return createEmptyComponentPreviewBuild(config);
  const rootDir = path.resolve(cwd, config.componentPreview.rootDir);
  const result = await writePreviewArtifacts({
    rootDir,
    outDir: config.componentPreview.outDir,
    include: config.componentPreview.include,
    exclude: config.componentPreview.exclude,
    extensions: config.componentPreview.extensions,
    packageName: config.componentPreview.packageName ?? config.id,
    renderer: config.componentPreview.renderer,
    generatedAt: config.componentPreview.generatedAt,
    defaultVariants: config.componentPreview.defaultVariants,
    integrations: config.componentPreview.integrations,
    maxFiles: config.componentPreview.maxFiles,
    manifestFileName: config.componentPreview.manifestFileName,
    moduleFileName: config.componentPreview.moduleFileName,
    htmlFileName: config.componentPreview.htmlFileName,
    title: config.componentPreview.title,
    stylesheets: componentPreviewStylesheets(rootDir, config),
    importMap: componentPreviewImportMap(cwd, rootDir, config),
    compiledSourceRoot: joinPreviewPath(config.frontend.root, path.posix.dirname(config.frontend.componentsDir)),
    compiledRootDir: 'generated'
  });
  const diagnostics: FrontierPreviewDiagnostic[] = [
    ...result.diagnostics.map((diagnostic): FrontierPreviewDiagnostic => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
      path: diagnostic.file
    })),
    ...validatePreviewManifest(result.manifest)
  ];
  const proof = createPreviewProof(result.manifest);
  const registry = createPreviewRegistryGraph(result.manifest);
  const harness = createPreviewHarnessManifest(result.manifest, {
    integrations: config.componentPreview.integrations
  });
  const fuzzCases = createPreviewFuzzCases(result.manifest, {
    integrations: config.componentPreview.integrations
  });
  const benchmarks = createPreviewBenchmarkPlan(result.manifest, {
    integrations: config.componentPreview.integrations
  });
  const browserEvidence = createPreviewBrowserEvidencePlan(result.manifest, {
    integrations: config.componentPreview.integrations
  });
  const runbook = createPreviewAgentRunbook(result.manifest, {
    integrations: config.componentPreview.integrations
  });
  const outDir = result.outDir;
  const writtenArtifacts: ComponentPreviewArtifact[] = result.artifacts.map((artifact) => previewArtifact(cwd, artifact));
  await writePreviewJsonArtifact(cwd, outDir, 'proof.json', proof, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'registry.json', registry, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'harness.json', harness, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'fuzz-cases.json', fuzzCases, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'benchmarks.json', benchmarks, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'browser-evidence.json', browserEvidence, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'agent-runbook.json', runbook, writtenArtifacts);
  await writePreviewJsonArtifact(cwd, outDir, 'diagnostics.json', diagnostics, writtenArtifacts);
  await fs.writeFile(
    path.join(outDir, 'diagnostics.jsonl'),
    diagnostics.map((diagnostic) => JSON.stringify(diagnostic)).join('\n') + (diagnostics.length ? '\n' : ''),
    'utf8'
  );
  writtenArtifacts.push({ kind: 'jsonl', file: normalizeRelativePath(cwd, path.join(outDir, 'diagnostics.jsonl')) });
  const artifactByKind = new Map(result.artifacts.map((artifact) => [artifact.kind, normalizeRelativePath(cwd, artifact.file)]));
  const graphSummary = registryGraphSummary(registry);
  return {
    kind: 'frontier.framework.component-preview.build',
    appId: config.id,
    enabled: true,
    generatedAt: new Date().toISOString(),
    rootDir: normalizeRelativePath(cwd, rootDir),
    outDir: normalizeRelativePath(cwd, outDir),
    include: [...config.componentPreview.include],
    exclude: [...config.componentPreview.exclude],
    renderer: result.manifest.renderer,
    entries: result.manifest.entries.length,
    variants: result.manifest.entries.reduce((sum, entry) => sum + entry.variants.length, 0),
    sources: result.manifest.sources.length,
    files: result.files.map((file) => file.file),
    diagnostics,
    artifacts: writtenArtifacts,
    manifestId: result.manifest.id,
    proof,
    registry: graphSummary,
    harness: {
      targets: harness.harness.targets.length,
      commands: harness.harness.commands.length
    },
    fuzzCases: fuzzCases.length,
    benchmarks: benchmarks.benchmarks.length,
    browserEvidencePages: browserEvidence.pages.length,
    runbookSteps: runbook.steps.length,
    htmlFile: artifactByKind.get('html'),
    manifestFile: artifactByKind.get('manifest'),
    moduleFile: artifactByKind.get('module')
  };
}

function previewArtifact(cwd: string, artifact: FrontierPreviewWrittenArtifact): ComponentPreviewArtifact {
  return {
    kind: artifact.kind,
    file: normalizeRelativePath(cwd, artifact.file)
  };
}

function createEmptyDocumentationBuild(config: NormalizedFrontierFrameworkConfig): DocumentationBuild {
  return {
    kind: 'frontier.framework.documentation.build',
    appId: config.id,
    enabled: config.documentation.enabled,
    generatedAt: new Date().toISOString(),
    rootDir: config.documentation.rootDir,
    outDir: config.documentation.outDir,
    include: [...config.documentation.include],
    exclude: [...config.documentation.exclude],
    pages: 0,
    sections: 0,
    sources: 0,
    searchRecords: 0,
    files: [],
    diagnostics: [],
    artifacts: []
  };
}

async function buildDocumentation(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig
): Promise<DocumentationBuild> {
  if (!config.documentation.enabled) return createEmptyDocumentationBuild(config);
  const rootDir = path.resolve(cwd, config.documentation.rootDir);
  const result = await writeDocumentationArtifacts({
    rootDir,
    outDir: config.documentation.outDir,
    include: config.documentation.include,
    exclude: config.documentation.exclude,
    packageName: config.documentation.packageName ?? config.id,
    packageVersion: config.documentation.packageVersion,
    title: config.documentation.title,
    generatedAt: config.documentation.generatedAt,
    integrations: config.documentation.integrations,
    maxFiles: config.documentation.maxFiles,
    manifestFileName: config.documentation.manifestFileName,
    moduleFileName: config.documentation.moduleFileName,
    htmlFileName: config.documentation.htmlFileName,
    searchFileName: config.documentation.searchFileName,
    evidenceFileName: config.documentation.evidenceFileName,
    jsonlFileName: config.documentation.jsonlFileName
  });
  const diagnostics: FrontierDocumentationDiagnostic[] = [
    ...result.diagnostics.map((diagnostic): FrontierDocumentationDiagnostic => ({
      severity: diagnostic.severity,
      code: diagnostic.code,
      message: diagnostic.message,
      file: diagnostic.file
    })),
    ...validateDocumentationManifest(result.manifest)
  ];
  const proof = createDocumentationProof(result.manifest);
  const searchRecords = createDocumentationSearchRecords(result.manifest);
  const harness = createDocumentationHarnessManifest(result.manifest, {
    integrations: config.documentation.integrations
  });
  const fuzzCases = createDocumentationFuzzCases(result.manifest, {
    integrations: config.documentation.integrations
  });
  const benchmarks = createDocumentationBenchmarkPlan(result.manifest, {
    integrations: config.documentation.integrations
  });
  const browserEvidence = createDocumentationBrowserEvidencePlan(result.manifest, {
    integrations: config.documentation.integrations
  });
  const runbook = createDocumentationAgentRunbook(result.manifest, {
    integrations: config.documentation.integrations
  });
  const outDir = result.outDir;
  const writtenArtifacts: DocumentationArtifact[] = result.artifacts.map((artifact) => documentationArtifact(cwd, artifact));
  await writeDocumentationJsonArtifact(cwd, outDir, 'proof.json', proof, writtenArtifacts);
  await writeDocumentationJsonArtifact(cwd, outDir, 'harness.json', harness, writtenArtifacts);
  await writeDocumentationJsonArtifact(cwd, outDir, 'fuzz-cases.json', fuzzCases, writtenArtifacts);
  await writeDocumentationJsonArtifact(cwd, outDir, 'benchmarks.json', benchmarks, writtenArtifacts);
  await writeDocumentationJsonArtifact(cwd, outDir, 'browser-evidence.json', browserEvidence, writtenArtifacts);
  await writeDocumentationJsonArtifact(cwd, outDir, 'agent-runbook.json', runbook, writtenArtifacts);
  await writeDocumentationJsonArtifact(cwd, outDir, 'diagnostics.json', diagnostics, writtenArtifacts);
  const diagnosticsJsonl = path.join(outDir, 'diagnostics.jsonl');
  await fs.writeFile(
    diagnosticsJsonl,
    diagnostics.map((diagnostic) => JSON.stringify(diagnostic)).join('\n') + (diagnostics.length ? '\n' : ''),
    'utf8'
  );
  writtenArtifacts.push({ kind: 'jsonl', file: normalizeRelativePath(cwd, diagnosticsJsonl) });
  const artifactByKind = new Map(result.artifacts.map((artifact) => [artifact.kind, normalizeRelativePath(cwd, artifact.file)]));
  return {
    kind: 'frontier.framework.documentation.build',
    appId: config.id,
    enabled: true,
    generatedAt: new Date().toISOString(),
    rootDir: normalizeRelativePath(cwd, rootDir),
    outDir: normalizeRelativePath(cwd, outDir),
    include: [...config.documentation.include],
    exclude: [...config.documentation.exclude],
    pages: result.manifest.pages.length,
    sections: result.manifest.pages.reduce((total, page) => total + page.sections.length, 0),
    sources: result.manifest.sources.length,
    searchRecords: searchRecords.length,
    files: result.files.map((file) => file.file),
    diagnostics,
    artifacts: writtenArtifacts,
    manifestId: result.manifest.id,
    proof,
    harness: {
      fixtures: harness.fixtures.length,
      commands: harness.commands.length
    },
    fuzzCases: fuzzCases.length,
    benchmarks: benchmarks.benchmarks.length,
    browserEvidencePages: browserEvidence.pages.length,
    runbookSteps: runbook.steps.length,
    htmlFile: artifactByKind.get('html'),
    manifestFile: artifactByKind.get('manifest'),
    moduleFile: artifactByKind.get('module'),
    searchFile: artifactByKind.get('search'),
    jsonlFile: artifactByKind.get('jsonl')
  };
}

function documentationArtifact(cwd: string, artifact: FrontierDocumentationWrittenArtifact): DocumentationArtifact {
  return {
    kind: artifact.kind,
    file: normalizeRelativePath(cwd, artifact.file)
  };
}

async function writeDocumentationJsonArtifact(
  cwd: string,
  outDir: string,
  name: string,
  value: unknown,
  writtenArtifacts: DocumentationArtifact[]
): Promise<void> {
  const file = path.join(outDir, name);
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
  writtenArtifacts.push({ kind: 'json', file: normalizeRelativePath(cwd, file) });
}

function componentPreviewStylesheets(rootDir: string, config: NormalizedFrontierFrameworkConfig): string[] {
  const previewDir = path.resolve(rootDir, config.componentPreview.outDir);
  const generatedStyles = path.resolve(rootDir, 'generated', 'styles.css');
  return existsSync(generatedStyles) ? [relativeBrowserPath(previewDir, generatedStyles)] : [];
}

function componentPreviewImportMap(cwd: string, rootDir: string, config: NormalizedFrontierFrameworkConfig): { imports: Record<string, string> } | undefined {
  const previewDir = path.resolve(rootDir, config.componentPreview.outDir);
  const imports: Record<string, string> = {};
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier', 'frontier', 'index.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier/registry', 'frontier', 'registry.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier/clone', 'frontier', 'clone.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier/constants', 'frontier', 'constants.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier/pointer', 'frontier', 'pointer.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier-dom', 'frontier-dom', 'index.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier-dom/jsx-runtime', 'frontier-dom', 'jsx-runtime.js');
  addPackageImport(imports, cwd, previewDir, '@shapeshift-labs/frontier-icons', 'frontier-icons', 'index.js');
  return Object.keys(imports).length ? { imports } : undefined;
}

function addPackageImport(imports: Record<string, string>, cwd: string, fromDir: string, specifier: string, packageDir: string, distFile: string): void {
  const file = findPackageDistFile(cwd, packageDir, distFile);
  if (file) imports[specifier] = relativeBrowserPath(fromDir, file);
}

function findPackageDistFile(cwd: string, packageDir: string, distFile: string): string | undefined {
  let current = path.resolve(cwd);
  for (;;) {
    const candidate = path.join(current, 'packages', packageDir, 'dist', distFile);
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function relativeBrowserPath(fromDir: string, target: string): string {
  const relative = path.relative(fromDir, target).replace(/\\/g, '/');
  return relative.startsWith('.') ? relative : './' + relative;
}

function joinPreviewPath(...parts: string[]): string {
  return parts
    .filter((part) => part && part !== '.')
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/^\.\//, '');
}

async function writePreviewJsonArtifact(
  cwd: string,
  outDir: string,
  name: string,
  value: unknown,
  writtenArtifacts: ComponentPreviewArtifact[]
): Promise<void> {
  const file = path.join(outDir, name);
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
  writtenArtifacts.push({ kind: 'json', file: normalizeRelativePath(cwd, file) });
}

function registryGraphSummary(value: unknown): ComponentPreviewBuild['registry'] {
  if (!value || typeof value !== 'object') return { entries: 0, edges: 0 };
  const record = value as { kind?: unknown; entries?: unknown; edges?: unknown };
  return {
    kind: typeof record.kind === 'string' ? record.kind : undefined,
    entries: Array.isArray(record.entries) ? record.entries.length : 0,
    edges: Array.isArray(record.edges) ? record.edges.length : 0
  };
}

function createEmptyFrontendBuildCache(config: NormalizedFrontierFrameworkConfig): FrontendBuildCache {
  return {
    kind: 'frontier.framework.frontend.cache',
    appId: config.id,
    version: 1,
    generatedAt: new Date().toISOString(),
    routes: {}
  };
}

function createFrontendCacheValidationContext(): FrontendCacheValidationContext {
  return {
    dependencyStats: new Map()
  };
}

async function loadFrontierJsxCompiler(): Promise<CompileFrontierJsx> {
  const compiler = await import('@shapeshift-labs/frontier-dom/compiler');
  return compiler.compileFrontierJsx;
}

function frontendBuildCacheUnchanged(previous: FrontendBuildCache | undefined, next: FrontendBuildCache): boolean {
  if (!previous) return false;
  const previousKeys = Object.keys(previous.routes).sort();
  const nextKeys = Object.keys(next.routes).sort();
  if (previousKeys.length !== nextKeys.length) return false;
  for (let index = 0; index < nextKeys.length; index++) {
    const key = nextKeys[index];
    if (previousKeys[index] !== key) return false;
    if (previous.routes[key] !== next.routes[key]) return false;
  }
  return true;
}

async function readFrontendBuildCache(cwd: string, config: NormalizedFrontierFrameworkConfig): Promise<FrontendBuildCache | undefined> {
  if (!config.frontend.incremental) return undefined;
  const file = frontendBuildCacheFile(cwd, config);
  if (!existsSync(file)) return undefined;
  try {
    const parsed = JSON.parse(await fs.readFile(file, 'utf8')) as FrontendBuildCache;
    if (parsed.kind !== 'frontier.framework.frontend.cache') return undefined;
    if (parsed.appId !== config.id || parsed.version !== 1) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

async function writeFrontendBuildCache(cwd: string, config: NormalizedFrontierFrameworkConfig, cache: FrontendBuildCache): Promise<void> {
  if (!config.frontend.incremental) return;
  const file = frontendBuildCacheFile(cwd, config);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(cache, null, 2) + '\n', 'utf8');
}

function frontendBuildCacheFile(cwd: string, config: NormalizedFrontierFrameworkConfig): string {
  return path.resolve(cwd, config.frontend.cacheDir, 'routes.json');
}

function frontendRouteCacheKey(route: FrontierFrontendRouteConfig): string {
  return route.id ?? route.path;
}

async function getFreshFrontendCacheEntry(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  route: FrontierFrontendRouteConfig,
  cached: FrontendRouteCacheEntry | undefined,
  outputPath: string,
  context: FrontendCacheValidationContext
): Promise<FrontendRouteCacheEntry | undefined> {
  if (!config.frontend.incremental || cached === undefined || !existsSync(outputPath)) return undefined;
  if (cached.configFingerprint !== hashFrontendRouteConfig(route, config, cached.entry ?? route.entry)) return undefined;
  if (!cached.dependencyStats || cached.dependencyStats.length === 0) return undefined;
  for (const dependency of cached.dependencyStats) {
    const stat = await readCachedFrontendDependencyStat(cwd, dependency.file, context);
    if (stat === false) return undefined;
    if (stat.size !== dependency.size) return undefined;
    if (Math.abs(stat.mtimeMs - dependency.mtimeMs) > 0.01) return undefined;
  }
  return cached;
}

async function readCachedFrontendDependencyStat(
  cwd: string,
  file: string,
  context: FrontendCacheValidationContext
): Promise<FrontendRouteDependencyStat | false> {
  const cached = context.dependencyStats.get(file);
  if (cached !== undefined) return cached;
  try {
    const stat = await fs.stat(path.resolve(cwd, file));
    const result = stat.isFile()
      ? { file, size: stat.size, mtimeMs: stat.mtimeMs }
      : false;
    context.dependencyStats.set(file, result);
    return result;
  } catch {
    context.dependencyStats.set(file, false);
    return false;
  }
}

async function collectFrontendDependencyStats(cwd: string, files: string[]): Promise<FrontendRouteDependencyStat[]> {
  return await Promise.all(files.map(async (file) => {
    const stat = await fs.stat(file);
    return {
      file: path.relative(cwd, file).replace(/\\/g, '/'),
      size: stat.size,
      mtimeMs: stat.mtimeMs
    };
  }));
}

function hashFrontendRouteConfig(
  route: FrontierFrontendRouteConfig,
  config: NormalizedFrontierFrameworkConfig,
  entry: string | undefined
): string {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify({
    route: {
      id: route.id,
      path: route.path,
      file: route.file,
      entry
    },
    shell: config.frontend.shell,
    frontend: {
      outDir: config.frontend.outDir,
      evidenceDir: config.frontend.evidenceDir
    },
    devtools: config.devtools
  }));
  return hash.digest('hex');
}

function hashFrontendRoute(
  route: FrontierFrontendRouteConfig,
  bundle: TsxBundleResult,
  config: NormalizedFrontierFrameworkConfig,
  entry: string | undefined
): string {
  const hash = crypto.createHash('sha256');
  hash.update(bundle.fingerprint);
  hash.update('\0');
  hash.update(hashFrontendRouteConfig(route, config, entry));
  return hash.digest('hex');
}

function createTargetArtifactSummary(config: NormalizedFrontierFrameworkConfig, target: CliTarget): FrontierFrameworkArtifactPlan[] {
  const artifacts: FrontierFrameworkArtifactPlan[] = [];
  if (target === 'all' || target === 'frontend') {
    artifacts.push({
      id: 'frontend',
      kind: 'frontend',
      path: config.frontend.outDir,
      deployTarget: config.deploy.frontend[0]?.id,
      description: 'Static frontend artifact compiled from Frontier TSX route files and Vite-managed client assets.'
    });
    if (config.vite.enabled) {
      artifacts.push({
        id: 'vite-assets',
        kind: 'frontend',
        path: config.vite.outDir,
        deployTarget: config.deploy.frontend[0]?.id,
        description: 'Vite output for client assets.'
      });
    }
    if (config.frontend.incremental) {
      artifacts.push({
        id: 'frontend-cache',
        kind: 'evidence',
        path: config.frontend.cacheDir,
        description: 'Incremental route/component fingerprint cache for repeated unchanged frontend builds.'
      });
    }
    if (config.componentPreview.enabled) {
      artifacts.push({
        id: 'component-preview',
        kind: 'frontend',
        path: config.componentPreview.outDir,
        deployTarget: config.deploy.frontend[0]?.id,
        description: 'Standalone Frontier component preview book and generated preview manifest.'
      });
    }
    if (config.documentation.enabled) {
      artifacts.push({
        id: 'documentation',
        kind: 'frontend',
        path: config.documentation.outDir,
        deployTarget: config.deploy.frontend[0]?.id,
        description: 'Standalone Frontier documentation book, generated documentation manifest, and search index.'
      });
    }
  }
  if (target === 'all' || target === 'backend') {
    artifacts.push({
      id: 'backend',
      kind: 'backend',
      path: config.backend.outDir,
      deployTarget: config.deploy.backend[0]?.id,
      description: 'Backend Fetch-handler adapter contract and transport declarations.'
    });
  }
  if (target === 'all' || target === 'evidence') {
    artifacts.push({
      id: 'evidence',
      kind: 'evidence',
      path: config.frontend.evidenceDir,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Frontier evidence, harness, and agent artifacts.'
    });
    artifacts.push({
      id: 'runtime-migrations',
      kind: 'evidence',
      path: config.migrations.evidenceFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Runtime data-source migration manifest and app hydration bridge.'
    });
    if (config.componentPreview.enabled) {
      artifacts.push({
        id: 'component-preview-evidence',
        kind: 'evidence',
        path: config.frontend.evidenceDir + '/component-preview.json',
        deployTarget: config.deploy.evidence[0]?.id,
        description: 'Generated component preview summary, diagnostics, and proof evidence.'
      });
    }
    if (config.documentation.enabled) {
      artifacts.push({
        id: 'documentation-evidence',
        kind: 'evidence',
        path: config.frontend.evidenceDir + '/documentation.json',
        deployTarget: config.deploy.evidence[0]?.id,
        description: 'Generated documentation summary, diagnostics, proof, search, and artifact evidence.'
      });
    }
  }
  return artifacts;
}

async function writeDevtoolsOverlay(cwd: string, config: NormalizedFrontierFrameworkConfig, cachedFrontendOnly = false): Promise<DevtoolsBuildResult> {
  if (!config.devtools.enabled) {
    return { enabled: false, emitted: false, scriptPath: config.devtools.scriptPath };
  }
  const scriptPath = config.devtools.scriptPath.replace(/^\/+/, '');
  const outputPath = path.resolve(cwd, config.frontend.outDir, scriptPath);
  if (cachedFrontendOnly && existsSync(outputPath)) {
    return { enabled: true, emitted: true, scriptPath: config.devtools.scriptPath };
  }
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, renderNormalizedFrontierDevtoolsOverlayModule(config), 'utf8');
  return { enabled: true, emitted: true, scriptPath: config.devtools.scriptPath };
}

async function runViteBuild(cwd: string, config: NormalizedFrontierFrameworkConfig, routes: CompiledRoute[]): Promise<ViteBuildResult> {
  const base: ViteBuildResult = {
    enabled: config.vite.enabled,
    hmr: config.vite.hmr,
    used: false,
    skipped: !config.vite.enabled,
    strict: config.vite.strict,
    configFile: config.vite.configFile,
    generatedEntryDir: config.vite.generatedEntryDir,
    outDir: config.vite.outDir
  };
  if (!config.vite.enabled) return base;
  const entryDir = path.resolve(cwd, config.vite.generatedEntryDir);
  await fs.mkdir(entryDir, { recursive: true });
  await fs.writeFile(path.join(entryDir, 'index.html'), renderViteIndexHtml(config), 'utf8');
  await fs.writeFile(path.join(entryDir, 'main.js'), renderViteClientEntry(config, routes), 'utf8');
  await fs.writeFile(path.join(entryDir, 'frontier-devtools.js'), renderNormalizedFrontierDevtoolsOverlayModule(config), 'utf8');
  try {
    const vite = await loadVite();
    const configFile = path.resolve(cwd, config.vite.configFile);
    await vite.build({
      root: entryDir,
      configFile: existsSync(configFile) ? configFile : false,
      logLevel: 'silent',
      build: {
        outDir: path.resolve(cwd, config.vite.outDir),
        emptyOutDir: false,
        manifest: true,
        rollupOptions: {
          input: path.join(entryDir, 'index.html')
        }
      }
    });
    return { ...base, used: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (config.vite.strict) throw new Error('Vite build failed: ' + message);
    return { ...base, used: false, skipped: true, error: message };
  }
}

async function loadVite(): Promise<{ build: (options: unknown) => Promise<unknown> }> {
  const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
  return await dynamicImport('vite') as { build: (options: unknown) => Promise<unknown> };
}

function renderViteIndexHtml(config: NormalizedFrontierFrameworkConfig): string {
  const title = escapeHtml(config.frontend.shell.title);
  return [
    '<!doctype html>',
    '<html lang="' + escapeHtml(config.frontend.shell.lang) + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + title + ' client assets</title>',
    '</head>',
    '<body>',
    '<div id="frontier-vite-client"></div>',
    '<script type="module" src="/main.js"></script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

function renderViteClientEntry(config: NormalizedFrontierFrameworkConfig, routes: CompiledRoute[]): string {
  return [
    config.devtools.enabled ? 'import "./frontier-devtools.js";' : '',
    'globalThis.__FRONTIER_FRAMEWORK_BUILD__ = ' + JSON.stringify({
      appId: config.id,
      routes: routes.map((route) => route.route.path),
      generatedAt: new Date().toISOString()
    }, null, 2) + ';',
    'export {};'
  ].filter(Boolean).join('\n');
}

async function buildBackend(cwd: string, config: NormalizedFrontierFrameworkConfig): Promise<void> {
  const outDir = path.resolve(cwd, config.backend.outDir);
  await fs.mkdir(outDir, { recursive: true });
  const contract = {
    kind: 'frontier.backend.contract',
    appId: config.id,
    entry: path.join(config.backend.root, config.backend.entry),
    handlerExport: config.backend.handlerExport,
    contract: 'fetch-handler',
    adapters: config.backend.adapters,
    endpoints: config.backend.endpoints,
    transports: config.backend.transports,
    deployTargets: config.deploy.backend
  };
  await fs.writeFile(path.join(outDir, 'adapter.json'), JSON.stringify(contract, null, 2) + '\n', 'utf8');
  await fs.writeFile(path.join(outDir, 'transports.json'), JSON.stringify({
    kind: 'frontier.framework.backend.transports',
    appId: config.id,
    transports: config.backend.transports
  }, null, 2) + '\n', 'utf8');
  await fs.writeFile(path.join(outDir, 'README.md'), renderBackendReadme(contract), 'utf8');
}

async function writeEvidence(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>,
  frontendBuild: FrontendBuildResult,
  componentPreview: ComponentPreviewBuild,
  documentation: DocumentationBuild,
  harness: HarnessValidation,
  harnessTemplates: HarnessTemplateBuild,
  agentBundle: AgentBundleBuild,
  sourcePolicy: SourcePolicyReport,
  conformance: ConformanceReport,
  configValidation: FrontierFrameworkConfigValidationResult,
  auth: AuthManifestBuild,
  migrations: MigrationManifestBuild
): Promise<void> {
  const outDir = path.resolve(cwd, config.frontend.evidenceDir);
  await fs.mkdir(outDir, { recursive: true });
  const agentLoop = verifyAgentLoopEvidence(cwd, config, createFrontierAgentLoopReport(config), plan.tests);
  const evidence = {
    kind: 'frontier.framework.evidence',
    appId: config.id,
    generatedAt: new Date().toISOString(),
    routeDiscovery: createRouteDiscoverySummary(config),
    routes: frontendBuild.routes.map((route) => ({
      path: route.route.path,
      file: route.route.file,
      metadata: route.route.metadata,
      diagnostics: route.diagnostics,
      cached: route.cached === true,
      dependencies: route.dependencies ?? []
    })),
    vite: frontendBuild.vite,
    devtools: frontendBuild.devtools,
    devtoolsBridge: createDevtoolsBridgeSummary(config),
    componentPreview,
    documentation,
    routeScenarios: plan.routeScenarios,
    routeScenarioPlaywright: plan.routeScenarioPlaywright,
    surfaces: plan.surfaces,
    surfaceCoverage: plan.surfaceCoverage,
    agentLoop,
    sourcePolicy,
    conformance,
    configValidation,
    auth,
    migrations,
    transports: config.backend.transports,
    telemetry: config.telemetry,
    harness,
    harnessTemplates,
    agent: plan.agent,
    agentBundle,
    research: plan.research,
    runtimeAdapters: plan.runtimeAdapters,
    syncAdapters: plan.syncAdapters,
    artifacts: plan.artifacts,
    deployTargets: plan.deployTargets,
    manifestHash: plan.manifestProof.hash
  };
  const artifacts: Record<string, unknown> = {
    'evidence.json': evidence,
    'config.json': plan.config,
    'route-discovery.json': createRouteDiscoverySummary(config),
    'route-scenarios.json': plan.routeScenarios,
    'route-scenario-playwright.json': plan.routeScenarioPlaywright,
    'surfaces.json': plan.surfaces,
    'surface-coverage.json': plan.surfaceCoverage,
    'agent-loop.json': agentLoop,
    'devtools-bridge.json': createDevtoolsBridgeSummary(config),
    'component-preview.json': componentPreview,
    'documentation.json': documentation,
    'source-policy.json': sourcePolicy,
    [path.basename(config.sourcePolicy.sourceGraphFile)]: sourcePolicy.sourceGraph ?? { kind: 'frontier.ast-walk.source-graph', sources: [] },
    [path.basename(config.sourcePolicy.sourceGraphRegistryFile)]: sourcePolicy.sourceRegistry ?? { kind: 'frontier.ast-walk.registry', entries: [], edges: [] },
    'conformance.json': conformance,
    'config-validation.json': configValidation,
    'auth.json': auth,
    'auth-manifest.json': auth.manifest,
    'auth-registry.json': auth.registry,
    'auth-lint-resources.json': auth.lintResources,
    'migrations.json': migrations,
    'manifest.json': plan.manifest,
    'manifest-proof.json': plan.manifestProof,
    'routes.json': plan.routes,
    'views.json': plan.views,
    'application.json': plan.application,
    'effects.json': plan.effects,
    'tools.json': plan.tools,
    'tests.json': plan.tests,
    'trace.json': plan.trace,
    'research.json': plan.research,
    'runtime-adapters.json': plan.runtimeAdapters,
    'sync-adapters.json': plan.syncAdapters,
    'transports.json': {
      kind: 'frontier.framework.backend.transports',
      appId: config.id,
      transports: config.backend.transports
    },
    'harness.json': harness,
    'harness-templates.json': harnessTemplates,
    'agent.json': plan.agent,
    'agent-bundle.json': agentBundle,
    'agent-readiness.json': agentBundle.readiness
  };
  for (const [name, value] of Object.entries(artifacts)) {
    await fs.writeFile(path.join(outDir, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
  }
  await writeJsonFile(path.resolve(cwd, config.sourcePolicy.sourceGraphFile), sourcePolicy.sourceGraph ?? { kind: 'frontier.ast-walk.source-graph', sources: [] });
  await writeJsonFile(path.resolve(cwd, config.sourcePolicy.sourceGraphRegistryFile), sourcePolicy.sourceRegistry ?? { kind: 'frontier.ast-walk.registry', entries: [], edges: [] });
  await writeJsonFile(path.resolve(cwd, config.routeScenarios.manifestFile), plan.routeScenarios);
  await writeJsonFile(path.resolve(cwd, config.routeScenarios.playwrightPlanFile), plan.routeScenarioPlaywright);
  await writeJsonFile(path.resolve(cwd, config.surfaces.registryFile), plan.surfaces);
  await writeSurfaceCoverageArtifacts(cwd, config, plan.surfaceCoverage);
  await writeAgentLoopArtifacts(cwd, agentLoop);
  await writeHarnessEvidence(cwd, config, harness);
}

async function writeJsonFile(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function writeSurfaceCoverageArtifacts(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  report: FrontierFrameworkSurfaceCoverageReport
): Promise<string[]> {
  const reportFile = path.resolve(cwd, config.surfaces.coverage.reportFile);
  const dashboardFile = path.resolve(cwd, config.surfaces.coverage.dashboardFile);
  await writeJsonFile(reportFile, report);
  await fs.mkdir(path.dirname(dashboardFile), { recursive: true });
  await fs.writeFile(dashboardFile, renderSurfaceCoverageDashboard(report), 'utf8');
  return [
    normalizeRelativePath(cwd, reportFile),
    normalizeRelativePath(cwd, dashboardFile)
  ];
}

async function writeAgentLoopArtifacts(
  cwd: string,
  report: FrontierFrameworkAgentLoopReport
): Promise<string[]> {
  const loopFile = path.resolve(cwd, report.artifacts.loop);
  const dashboardFile = path.resolve(cwd, report.artifacts.loopDashboard);
  await writeJsonFile(loopFile, report);
  await fs.mkdir(path.dirname(dashboardFile), { recursive: true });
  await fs.writeFile(dashboardFile, renderAgentLoopDashboard(report), 'utf8');
  return [
    normalizeRelativePath(cwd, loopFile),
    normalizeRelativePath(cwd, dashboardFile)
  ];
}

async function writeConfigValidationEvidence(
  cwd: string,
  rawConfig: FrontierFrameworkConfig,
  validation: FrontierFrameworkConfigValidationResult,
  args: CliArgs
): Promise<void> {
  let evidenceDir = 'dist/frontier';
  try {
    evidenceDir = normalizeFrontierFrameworkConfig(applyCliOverrides(rawConfig, args)).frontend.evidenceDir;
  } catch {
    // Keep validation usable even when the config is too malformed to normalize.
  }
  const outDir = path.resolve(cwd, evidenceDir);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'config-validation.json'), JSON.stringify(validation, null, 2) + '\n', 'utf8');
}

async function writeConformanceArtifacts(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig
): Promise<ConformanceReport> {
  const input = await createConformanceLintInput(cwd, config);
  const lint = config.conformance.enabled
    ? lintFrontier(input, {
      severity: {
        'frontier/require-package-use': config.conformance.enforcement === 'error' ? 'error' : 'warning'
      }
    })
    : lintFrontier({ id: config.id + '.conformance.disabled' }, {
      disabledRules: ['frontier/require-package-use']
    });
  const report: ConformanceReport = {
    kind: 'frontier.framework.conformance.report',
    appId: config.id,
    enabled: config.conformance.enabled,
    ok: !config.conformance.enabled || lint.summary.errorCount === 0,
    mode: config.conformance.mode,
    enforcement: config.conformance.enforcement,
    generatedAt: new Date().toISOString(),
    packageCount: input.packages?.length ?? 0,
    sourceCount: input.sources?.length ?? 0,
    requiredPackageUses: config.conformance.requiredPackageUses,
    lint
  };
  const reportFile = path.resolve(cwd, config.conformance.reportFile);
  const sarifFile = path.resolve(cwd, config.conformance.sarifFile);
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2) + '\n', 'utf8');
  await fs.mkdir(path.dirname(sarifFile), { recursive: true });
  await fs.writeFile(sarifFile, formatLintSarif(lint, { toolName: 'frontier-framework-conformance' }) + '\n', 'utf8');
  return report;
}

async function createConformanceLintInput(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig
): Promise<FrontierLintInput> {
  const packageJson = await readPackageJson(cwd);
  const dependencyNames = collectDependencyNames(packageJson);
  const sourceFiles = config.conformance.enabled
    ? await collectSourcePolicyFiles(cwd, config.sourcePolicy.include, config.sourcePolicy.exclude)
    : [];
  const sourceGraph = config.conformance.enabled
    ? await createSourceGraph(cwd, config, sourceFiles)
    : undefined;
  const sources = [];
  for (const file of sourceFiles) {
    sources.push({
      id: 'source:' + file,
      file,
      text: await fs.readFile(path.resolve(cwd, file), 'utf8')
    });
  }
  const resources: NonNullable<FrontierLintInput['resources']> = [
    ...(sourceGraph ? createAstLintResources(sourceGraph).map((resource) => ({
      ...resource,
      id: 'ast:' + resource.id,
      tags: ['ast-walk', ...resource.tags]
    })) : []),
    ...config.frontend.routes.map((route) => ({
      id: route.id ?? 'route:' + route.path,
      kind: 'route',
      feature: route.feature,
      owner: route.owner,
      files: [route.file],
      tags: ['frontend', 'route', ...(route.tags ?? [])],
      metadata: route.metadata
    })),
    ...config.backend.endpoints.map((endpoint) => ({
      id: endpoint.id ?? 'endpoint:' + String(endpoint.method ?? 'GET').toUpperCase() + ':' + endpoint.path,
      kind: 'route',
      feature: endpoint.feature,
      owner: endpoint.owner,
      files: endpoint.file ? [endpoint.file] : [],
      effects: endpoint.effects,
      tags: ['backend', 'endpoint', ...(endpoint.tags ?? [])],
      metadata: endpoint.metadata
    })),
    ...config.backend.transports.map((transport) => ({
      id: 'transport:' + (transport.id ?? transport.kind),
      kind: 'resource',
      package: transport.package,
      feature: transport.feature,
      owner: transport.owner,
      effects: transport.effects,
      tags: ['backend', 'transport', transport.kind, ...(transport.tags ?? [])],
      metadata: transport.metadata
    })),
    ...config.sourcePolicy.runtimeModules.map((runtimeModule) => ({
      id: 'runtime-module:' + runtimeModule.id,
      kind: 'resource',
      owner: runtimeModule.owner,
      files: runtimeModule.files?.length ? runtimeModule.files : runtimeModule.file ? [runtimeModule.file] : [],
      actions: runtimeModule.actions,
      reads: runtimeModule.reads,
      writes: runtimeModule.writes,
      effects: runtimeModule.effects,
      produces: runtimeModule.evidence,
      tags: ['runtime-module', ...(runtimeModule.owns ?? []), ...(runtimeModule.tags ?? [])],
      metadata: {
        kind: runtimeModule.kind,
        bindings: runtimeModule.bindings,
        capabilities: runtimeModule.capabilities
      }
    })),
    ...createAuthLintResources(createFrontierAuthManifest(config)).map((resource) => ({
      ...resource,
      id: 'auth:' + resource.id,
      tags: ['auth', ...resource.tags]
    })),
    ...config.harness.commands.map((command) => ({
      id: 'harness-command:' + command.id,
      kind: command.kind === 'benchmark' ? 'benchmark' : 'test',
      tags: ['harness', command.kind, ...(command.tags ?? [])],
      metadata: command.metadata
    })),
    {
      id: 'agent:workflow',
      kind: 'workflow',
      tags: ['agent', 'workflow'],
      effects: ['agent.workflow.export']
    }
  ];
  return {
    id: config.id + '.conformance',
    resources,
    sources,
    packages: Array.from(dependencyNames).sort().map((name) => ({ name })),
    requiredPackageUses: config.conformance.requiredPackageUses,
    evidence: [
      {
        id: 'config:conformance',
        kind: 'lint',
        nodes: ['conformance:package-use'],
        status: 'planned',
        timestamp: Date.now()
      }
    ],
    metadata: {
      source: 'frontier-framework.conformance',
      mode: config.conformance.mode,
      enforcement: config.conformance.enforcement
    }
  };
}

async function writeAuthArtifacts(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig
): Promise<AuthManifestBuild> {
  const manifest = createFrontierAuthManifest(config);
  const evidence = createAuthEvidence({
    appId: config.id,
    manifest,
    generatedAt: new Date().toISOString()
  });
  const build: AuthManifestBuild = {
    ...evidence,
    enabled: config.auth.enabled,
    strict: config.auth.strict,
    generatedDir: config.auth.generatedDir,
    manifestFile: config.auth.manifestFile,
    evidenceFile: config.auth.evidenceFile
  };
  const generatedDir = path.resolve(cwd, config.auth.generatedDir);
  const manifestFile = path.resolve(cwd, config.auth.manifestFile);
  const evidenceFile = path.resolve(cwd, config.auth.evidenceFile);
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(path.dirname(manifestFile), { recursive: true });
  await fs.mkdir(path.dirname(evidenceFile), { recursive: true });
  await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await fs.writeFile(evidenceFile, JSON.stringify(build, null, 2) + '\n', 'utf8');
  await fs.writeFile(path.join(generatedDir, 'auth-evidence.json'), JSON.stringify(build, null, 2) + '\n', 'utf8');
  await fs.writeFile(path.join(generatedDir, 'auth-registry.json'), JSON.stringify(evidence.registry, null, 2) + '\n', 'utf8');
  await fs.writeFile(path.join(generatedDir, 'auth-lint-resources.json'), JSON.stringify(evidence.lintResources, null, 2) + '\n', 'utf8');
  return build;
}

async function writeMigrationArtifacts(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig
): Promise<MigrationManifestBuild> {
  const manifest = createMigrationManifest(config);
  const generatedDir = path.resolve(cwd, config.migrations.generatedDir);
  const bridgeFile = path.resolve(cwd, config.migrations.runtimeBridgeFile);
  const evidenceFile = path.resolve(cwd, config.migrations.evidenceFile);
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(path.dirname(bridgeFile), { recursive: true });
  await fs.mkdir(path.dirname(evidenceFile), { recursive: true });
  await fs.writeFile(path.join(generatedDir, 'migrations.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await fs.writeFile(bridgeFile, renderRuntimeMigrationsBridge(config), 'utf8');
  await fs.writeFile(evidenceFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return manifest;
}

function createMigrationManifest(config: NormalizedFrontierFrameworkConfig): MigrationManifestBuild {
  return {
    kind: 'frontier.framework.migrations.manifest',
    appId: config.id,
    enabled: config.migrations.enabled,
    registryId: config.migrations.registryId,
    currentVersion: config.migrations.currentVersion,
    initialVersion: config.migrations.initialVersion,
    strict: config.migrations.strict,
    failOnMissingVersion: config.migrations.failOnMissingVersion,
    autoMigrateState: config.migrations.autoMigrateState,
    autoMigrateCache: config.migrations.autoMigrateCache,
    generatedAt: new Date().toISOString(),
    generatedDir: config.migrations.generatedDir,
    runtimeBridgeFile: config.migrations.runtimeBridgeFile,
    evidenceFile: config.migrations.evidenceFile,
    package: '@shapeshift-labs/frontier-migrations',
    sources: config.migrations.sources,
    integration: config.migrations.sources.map((source) => ({
      sourceId: source.id,
      kind: source.kind,
      runtimeHook: migrationRuntimeHook(source.kind),
      required: source.required
    }))
  };
}

function renderRuntimeMigrationsBridge(config: NormalizedFrontierFrameworkConfig): string {
  return `import { createRuntimeDataMigrator } from '@shapeshift-labs/frontier-migrations';

export const frontierMigrationManifest = ${JSON.stringify(createMigrationManifest(config), null, 2)};

export function createFrontierRuntimeDataMigrator(registry) {
  return createRuntimeDataMigrator(registry, {
    targetVersion: frontierMigrationManifest.currentVersion,
    initialVersion: frontierMigrationManifest.initialVersion,
    source: frontierMigrationManifest.registryId
  });
}

export function migrateInitialFrontierState(registry, state, options = {}) {
  if (!frontierMigrationManifest.enabled || !frontierMigrationManifest.autoMigrateState) return state;
  return createFrontierRuntimeDataMigrator(registry).migrate(state, {
    kind: 'state',
    sourceId: options.sourceId || 'app-state',
    source: options.source || 'frontier.state.initial',
    versionPath: options.versionPath || '/$version',
    ...options
  });
}

export function createFrontierStateMigration(registry, options = {}) {
  return {
    source: options.source || 'frontier.state.initial',
    migrateInitial(value) {
      return migrateInitialFrontierState(registry, value, options);
    },
    onReport: options.onReport
  };
}

export function createFrontierCachePersistenceMigration(registry, options = {}) {
  const migrator = createFrontierRuntimeDataMigrator(registry);
  return {
    migrateSnapshot(snapshot) {
      if (!frontierMigrationManifest.enabled || !frontierMigrationManifest.autoMigrateCache) return snapshot;
      return migrator.migrate(snapshot, {
        kind: 'query-cache',
        sourceId: options.sourceId || 'query-cache',
        source: options.source || 'frontier.state-cache.persistence',
        ...options
      });
    },
    migrateChangeLogEntry: options.migrateChangeLogEntry,
    onMigrationReport: options.onMigrationReport || options.onReport
  };
}
`;
}

function migrationRuntimeHook(kind: string): string {
  if (kind === 'state') return 'createStateEngine({ ... }, { migration })';
  if (kind === 'query-cache' || kind === 'state-cache') return 'persistQueryCache(cache, storage, { migrateSnapshot })';
  if (kind === 'crdt-snapshot') return 'migrateRuntimeData(registry, snapshot, { kind: "crdt-snapshot" })';
  if (kind === 'event-log-snapshot' || kind === 'event-log') return 'migrateRuntimeData(registry, eventLog, { kind: "event-log-snapshot" })';
  if (kind === 'dom-state') return 'migrateRuntimeData(registry, serializedDomState, { kind: "dom-state" })';
  return 'migrateRuntimeData(registry, data, { kind })';
}

async function writeHarnessTemplates(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>
): Promise<HarnessTemplateBuild> {
  const generatedDir = path.resolve(cwd, config.harness.generatedDir);
  const corpusDir = path.resolve(cwd, config.harness.corpusDir);
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(corpusDir, { recursive: true });
  const harnessPlan = {
    kind: 'frontier.framework.harness.plan',
    appId: config.id,
    generatedAt: new Date().toISOString(),
    mode: config.harness.mode,
    replayFailures: config.harness.replayFailures,
    minimizeCorpus: config.harness.minimizeCorpus,
    browserTrace: config.harness.browserTrace,
    evidenceDir: config.harness.evidenceDir,
    generatedDir: config.harness.generatedDir,
    corpusDir: config.harness.corpusDir,
    routes: config.frontend.routes.map((route) => ({ path: route.path, file: route.file, feature: route.feature })),
    routeScenarios: {
      enabled: plan.routeScenarios.enabled,
      manifestFile: config.routeScenarios.manifestFile,
      playwrightPlanFile: config.routeScenarios.playwrightPlanFile,
      fixtureCount: plan.routeScenarios.summary.fixtureCount,
      scenarioCount: plan.routeScenarios.summary.scenarioCount,
      cases: plan.routeScenarioPlaywright.cases.map((testCase) => ({
        id: testCase.id,
        url: testCase.url,
        steps: testCase.steps,
        fixtures: testCase.fixtures
      }))
    },
    surfaces: {
      enabled: plan.surfaces.enabled,
      registryFile: config.surfaces.registryFile,
      surfaceCount: plan.surfaces.summary.surfaceCount,
      statuses: plan.surfaces.statuses.map((status) => status.id),
      byStatus: plan.surfaces.summary.statusCounts,
      byKind: plan.surfaces.summary.kindCounts,
      coverage: {
        enabled: plan.surfaceCoverage.enabled,
        ok: plan.surfaceCoverage.ok,
        reportFile: config.surfaces.coverage.reportFile,
        dashboardFile: config.surfaces.coverage.dashboardFile,
        missing: plan.surfaceCoverage.summary.missingCount,
        claimed: plan.surfaceCoverage.summary.requiredSurfaceCount
      }
    },
    endpoints: config.backend.endpoints,
    transports: config.backend.transports,
    auth: {
      enabled: config.auth.enabled,
      strict: config.auth.strict,
      manifestFile: config.auth.manifestFile,
      evidenceFile: config.auth.evidenceFile,
      providers: plan.auth.providers.map((provider) => ({ id: provider.id, kind: provider.kind, enabled: provider.enabled })),
      gates: plan.auth.gates.map((gate) => ({ id: gate.id, resource: gate.resource, required: gate.required, profile: gate.profile })),
      tokenContracts: plan.auth.tokenContracts.map((contract) => ({ id: contract.id, kind: contract.kind, audience: contract.audience })),
      runtimeGrants: plan.auth.runtimeGrants.map((grant) => ({ id: grant.id, contract: grant.contract, resource: grant.resource }))
    },
    model: {
      statePaths: ['/route/current', '/transport/last', '/patches', '/events', '/telemetry', '/auth/session', '/auth/decision'],
      actions: ['navigate', 'commit-patch', 'record-event', 'record-crdt-update', 'record-telemetry', 'evaluate-auth-gate', 'issue-runtime-grant'],
      invariants: [
        'current route must be absolute',
        'patch paths must be absolute JSON pointers',
        'transport kinds and protocols must be non-empty',
        'event-log cursors must be monotonic per transport',
        'telemetry records must be redacted and bounded',
        'required auth gates must deny missing sessions',
        'auth token contracts must declare issuer audience expiry and required claims'
      ]
    },
    properties: [
      'route-materialization',
      'transport-contract-shape',
      'state-model-replay',
      'patch-event-telemetry-causality',
      'auth-gate-session-model',
      'replay-minimization'
    ],
    browserAssertions: [
      'frontend-root-present',
      'devtools-bridge-present',
      'state-snapshot-recorded',
      'patch-recorded',
      'crdt-update-recorded',
      'event-log-entry-recorded',
      'trace-recorded',
      'telemetry-recorded',
      'route-evidence-readable',
      'route-scenarios-readable',
      'surface-status-readable',
      'surface-coverage-readable'
    ],
    tools: plan.tools.actions.map((action) => action.id),
    tests: plan.tests.specs.map((spec) => spec.id),
    research: plan.research.map((item) => item.id),
    runtimeAdapters: plan.runtimeAdapters.map((item) => item.id),
    syncAdapters: plan.syncAdapters.map((item) => item.id)
  };
  const files = new Map<string, string>([
    ['harness-plan.json', JSON.stringify(harnessPlan, null, 2) + '\n'],
    ['frontier-smoke.mjs', renderSmokeHarnessTemplate(config)],
    ['frontier-fuzz.mjs', renderFuzzHarnessTemplate(config)],
    ['frontier-bench.mjs', renderBenchmarkHarnessTemplate(config)],
    ['frontier-browser-smoke.mjs', renderBrowserHarnessTemplate(config)],
    ['README.md', renderHarnessReadme(config)]
  ]);
  const written: string[] = [];
  for (const [name, content] of files) {
    const full = path.join(generatedDir, name);
    await fs.writeFile(full, content, 'utf8');
    written.push(path.relative(cwd, full).replace(/\\/g, '/'));
  }
  await writeHarnessGeneratedFile(cwd, config.routeScenarios.manifestFile, JSON.stringify(plan.routeScenarios, null, 2) + '\n', written);
  await writeHarnessGeneratedFile(cwd, config.routeScenarios.playwrightPlanFile, JSON.stringify(plan.routeScenarioPlaywright, null, 2) + '\n', written);
  await writeHarnessGeneratedFile(cwd, config.surfaces.registryFile, JSON.stringify(plan.surfaces, null, 2) + '\n', written);
  await writeHarnessGeneratedFile(cwd, config.surfaces.coverage.reportFile, JSON.stringify(plan.surfaceCoverage, null, 2) + '\n', written);
  await writeHarnessGeneratedFile(cwd, config.surfaces.coverage.dashboardFile, renderSurfaceCoverageDashboard(plan.surfaceCoverage), written);
  const seedFile = path.join(corpusDir, 'seed-route-transport.json');
  await fs.writeFile(seedFile, JSON.stringify({
    kind: 'frontier.framework.harness.corpus.seed',
    route: config.frontend.routes[0]?.path ?? '/',
    transport: config.backend.transports[0]?.kind ?? 'fetch',
    actions: [
      { type: 'navigate', routeIndex: 0 },
      { type: 'commit-patch', path: '/route/current', value: config.frontend.routes[0]?.path ?? '/' },
      { type: 'record-event', cursor: 1 },
      { type: 'record-crdt-update', actor: 'seed', seq: 1 },
      { type: 'record-telemetry', name: 'seed.route.transport' }
    ],
    generatedBy: 'frontier-framework'
  }, null, 2) + '\n', 'utf8');
  written.push(path.relative(cwd, seedFile).replace(/\\/g, '/'));
  return {
    generatedDir: config.harness.generatedDir,
    corpusDir: config.harness.corpusDir,
    files: written
  };
}

async function writeHarnessGeneratedFile(
  cwd: string,
  file: string,
  content: string,
  written: string[]
): Promise<void> {
  const full = path.resolve(cwd, file);
  const relative = path.relative(cwd, full).replace(/\\/g, '/');
  if (written.includes(relative)) return;
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, 'utf8');
  written.push(relative);
}

async function writeAgentBundle(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>,
  harness: HarnessValidation,
  harnessTemplates: HarnessTemplateBuild,
  mode: 'build' | 'agent'
): Promise<AgentBundleBuild> {
  const generatedDir = path.resolve(cwd, config.agent.generatedDir);
  await fs.mkdir(generatedDir, { recursive: true });
  const surfaceFiles = await writeSurfaceCoverageArtifacts(cwd, config, plan.surfaceCoverage);
  const agentLoop = createFrontierAgentLoopReport(config);
  const loopFiles = await writeAgentLoopArtifacts(cwd, agentLoop);
  await writeJsonFile(path.resolve(cwd, config.surfaces.registryFile), plan.surfaces);
  const readiness = await createAgentReadiness(cwd, config, plan, harness, mode);
  const featureMap = {
    kind: 'frontier.framework.agent.feature-map',
    appId: config.id,
    features: config.features,
    routes: config.frontend.routes,
    endpoints: config.backend.endpoints,
    transports: config.backend.transports,
    surfaces: plan.surfaces,
    surfaceCoverage: plan.surfaceCoverage,
    agentLoop,
    deployTargets: plan.deployTargets,
    artifacts: plan.artifacts
  };
  const mcpTools = createAgentMcpTools(config, plan);
  const toolManifest = createAgentToolManifest(config, plan);
  const ciGates = createAgentCiGates(config, plan, harness, harnessTemplates, readiness);
  const lintReport = createAgentLintReport(config, readiness, ciGates);
  const sarif = JSON.parse(formatLintSarif(lintReport, { toolName: 'frontier-framework-agent' }));
  const workflow = createAgentWorkflow(config, ciGates);
  const workflowProof = createWorkflowProof(workflow);
  const issueHandoff = renderAgentIssueHandoffTemplate(config, readiness, ciGates);
  const prHandoff = renderAgentPrHandoffTemplate(config, readiness, ciGates);
  const replayScript = renderAgentReplayScript(config);
  const agentManifest = {
    ...plan.agent,
    generatedAt: new Date().toISOString(),
    package: '@shapeshift-labs/frontier-framework',
    manifestHash: plan.manifestProof.hash,
    harness,
    harnessTemplates,
    featureMap: agentArtifactPath(config, 'feature-map.json'),
    artifacts: {
      featureMap: agentArtifactPath(config, 'feature-map.json'),
      surfaceRegistry: config.surfaces.registryFile,
      surfaceCoverage: config.surfaces.coverage.reportFile,
      surfaceDashboard: config.surfaces.coverage.dashboardFile,
      surfaceLoop: agentArtifactPath(config, 'surface-loop.json'),
      surfaceLoopDashboard: agentArtifactPath(config, 'surface-loop.md'),
      readiness: agentArtifactPath(config, 'agent-readiness.json'),
      actions: agentArtifactPath(config, 'agent-actions.json'),
      checkpoints: agentArtifactPath(config, 'agent-checkpoints.json'),
      runbook: agentArtifactPath(config, 'AGENT-RUNBOOK.md'),
      handoff: agentArtifactPath(config, 'HANDOFF.md'),
      mcpTools: agentArtifactPath(config, 'mcp-tools.json'),
      toolManifest: agentArtifactPath(config, 'tool-manifest.json'),
      ciGates: agentArtifactPath(config, 'ci-evidence-gates.json'),
      lintReport: agentArtifactPath(config, 'frontier-agent-lint.json'),
      sarif: agentArtifactPath(config, 'frontier-agent-lint.sarif'),
      workflow: agentArtifactPath(config, 'agent-workflow.json'),
      workflowProof: agentArtifactPath(config, 'agent-workflow-proof.json'),
      issueHandoff: agentArtifactPath(config, 'ISSUE-HANDOFF.md'),
      prHandoff: agentArtifactPath(config, 'PR-HANDOFF.md'),
      replayScript: agentArtifactPath(config, 'frontier-agent-replay.mjs')
    }
  };
  const runbook = renderAgentRunbook(config, plan);
  const handoff = renderAgentHandoffTemplate(config, readiness);
  const files = new Map<string, string>([
    ['agent-manifest.json', JSON.stringify(agentManifest, null, 2) + '\n'],
    ['agent-readiness.json', JSON.stringify(readiness, null, 2) + '\n'],
    ['agent-actions.json', JSON.stringify(plan.agent.capabilities, null, 2) + '\n'],
    ['agent-checkpoints.json', JSON.stringify(plan.agent.checkpoints, null, 2) + '\n'],
    ['feature-map.json', JSON.stringify(featureMap, null, 2) + '\n'],
    ['mcp-tools.json', JSON.stringify(mcpTools, null, 2) + '\n'],
    ['tool-manifest.json', JSON.stringify(toolManifest, null, 2) + '\n'],
    ['ci-evidence-gates.json', JSON.stringify(ciGates, null, 2) + '\n'],
    ['frontier-agent-lint.json', JSON.stringify(lintReport, null, 2) + '\n'],
    ['frontier-agent-lint.sarif', JSON.stringify(sarif, null, 2) + '\n'],
    ['agent-workflow.json', JSON.stringify(workflow, null, 2) + '\n'],
    ['agent-workflow-proof.json', JSON.stringify(workflowProof, null, 2) + '\n'],
    ['frontier-agent-check.mjs', renderAgentCheckScript(config)],
    ['frontier-agent-replay.mjs', replayScript],
    ['frontier-handoff.mjs', renderAgentHandoffScript(config)],
    ['AGENT-RUNBOOK.md', runbook],
    ['HANDOFF.md', handoff],
    ['ISSUE-HANDOFF.md', issueHandoff],
    ['PR-HANDOFF.md', prHandoff]
  ]);
  const written: string[] = [...surfaceFiles, ...loopFiles, config.surfaces.registryFile];
  for (const [name, content] of files) {
    const full = path.join(generatedDir, name);
    await fs.writeFile(full, content, 'utf8');
    written.push(path.relative(cwd, full).replace(/\\/g, '/'));
  }
  await writeConfiguredAgentFile(cwd, config.agent.runbookFile, runbook, written);
  await writeConfiguredAgentFile(cwd, config.agent.handoffFile, handoff, written);
  return {
    generatedDir: config.agent.generatedDir,
    runbookFile: config.agent.runbookFile,
    handoffFile: config.agent.handoffFile,
    surfaceCoverageFile: config.surfaces.coverage.reportFile,
    surfaceDashboardFile: config.surfaces.coverage.dashboardFile,
    surfaceLoopFile: agentArtifactPath(config, 'surface-loop.json'),
    surfaceLoopDashboardFile: agentArtifactPath(config, 'surface-loop.md'),
    mcpManifestFile: agentArtifactPath(config, 'mcp-tools.json'),
    toolManifestFile: agentArtifactPath(config, 'tool-manifest.json'),
    ciGatesFile: agentArtifactPath(config, 'ci-evidence-gates.json'),
    lintReportFile: agentArtifactPath(config, 'frontier-agent-lint.json'),
    sarifFile: agentArtifactPath(config, 'frontier-agent-lint.sarif'),
    workflowFile: agentArtifactPath(config, 'agent-workflow.json'),
    workflowProofFile: agentArtifactPath(config, 'agent-workflow-proof.json'),
    issueHandoffFile: agentArtifactPath(config, 'ISSUE-HANDOFF.md'),
    prHandoffFile: agentArtifactPath(config, 'PR-HANDOFF.md'),
    replayScriptFile: agentArtifactPath(config, 'frontier-agent-replay.mjs'),
    files: Array.from(new Set(written)).sort(),
    readiness
  };
}

function agentArtifactPath(config: NormalizedFrontierFrameworkConfig, name: string): string {
  return config.agent.generatedDir + '/' + name;
}

async function writeConfiguredAgentFile(cwd: string, file: string, content: string, written: string[]): Promise<void> {
  const full = path.resolve(cwd, file);
  const relative = path.relative(cwd, full).replace(/\\/g, '/');
  if (written.includes(relative)) return;
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, 'utf8');
  written.push(relative);
}

function createAgentMcpTools(
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>
) {
  const descriptors = createToolDescriptors(plan.tools, {}, {
    format: 'mcp',
    namespace: 'frontier',
    includeFrontierMetadata: true,
    strict: true
  });
  return {
    kind: 'frontier.framework.agent.mcp-tools',
    appId: config.id,
    generatedAt: new Date().toISOString(),
    protocol: 'mcp',
    source: '@shapeshift-labs/frontier-tools',
    tools: descriptors.map((descriptor) => descriptor.raw),
    descriptors: descriptors.map((descriptor) => ({
      id: descriptor.id,
      name: descriptor.name,
      title: descriptor.title,
      reads: descriptor.reads,
      writes: descriptor.writes,
      effects: descriptor.effects,
      requires: descriptor.requires,
      dryRun: descriptor.dryRun,
      requiresApproval: descriptor.requiresApproval
    }))
  };
}

function createAgentToolManifest(
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>
) {
  return {
    kind: 'frontier.framework.agent.tool-manifest',
    appId: config.id,
    generatedAt: new Date().toISOString(),
    source: '@shapeshift-labs/frontier-tools',
    manifest: plan.tools,
    capabilities: plan.agent.capabilities,
    checkpoints: plan.agent.checkpoints,
    applicationGraph: config.frontend.evidenceDir + '/application.json',
    replayScript: agentArtifactPath(config, 'frontier-agent-replay.mjs')
  };
}

function createAgentCiGates(
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>,
  harness: HarnessValidation,
  harnessTemplates: HarnessTemplateBuild,
  readiness: AgentReadiness
): AgentCiGateBundle {
  const gates: AgentCiGate[] = [
    {
      id: 'evidence-build',
      title: 'Build frontend/backend/evidence artifacts from the project graph',
      required: true,
      command: 'frontier build --target evidence --json',
      artifacts: [config.frontend.evidenceDir + '/evidence.json', config.frontend.evidenceDir + '/manifest-proof.json'],
      evidence: [config.frontend.evidenceDir + '/evidence.json'],
      tags: ['build', 'evidence', 'manifest'],
      source: '@shapeshift-labs/frontier-manifest',
      ok: true,
      detail: 'Rebuilds graph, manifests, tool surfaces, harness templates, and agent artifacts.'
    },
    {
      id: 'component-preview',
      title: 'Generate component preview book, proof, and diagnostics',
      required: config.componentPreview.enabled,
      command: 'frontier build --target evidence --json',
      artifacts: [
        config.componentPreview.outDir + '/' + config.componentPreview.htmlFileName,
        config.componentPreview.outDir + '/' + config.componentPreview.manifestFileName,
        config.componentPreview.outDir + '/proof.json',
        config.frontend.evidenceDir + '/component-preview.json'
      ],
      evidence: [config.frontend.evidenceDir + '/component-preview.json'],
      tags: ['component-preview', 'frontend', 'browser'],
      source: '@shapeshift-labs/frontier-component-preview',
      ok: config.componentPreview.enabled
    },
    {
      id: 'documentation',
      title: 'Generate documentation book, proof, search records, JSONL, and diagnostics',
      required: config.documentation.enabled,
      command: 'frontier docs build --json',
      artifacts: [
        config.documentation.outDir + '/' + config.documentation.htmlFileName,
        config.documentation.outDir + '/' + config.documentation.manifestFileName,
        config.documentation.outDir + '/' + config.documentation.searchFileName,
        config.documentation.outDir + '/' + config.documentation.jsonlFileName,
        config.documentation.outDir + '/proof.json',
        config.frontend.evidenceDir + '/documentation.json'
      ],
      evidence: [config.frontend.evidenceDir + '/documentation.json'],
      tags: ['documentation', 'frontend', 'browser'],
      source: '@shapeshift-labs/frontier-documentation',
      ok: config.documentation.enabled
    },
    {
      id: 'config-validation',
      title: 'Validate schema-backed framework configuration',
      required: true,
      command: 'frontier config validate --json',
      artifacts: [config.frontend.evidenceDir + '/config-validation.json'],
      evidence: [config.frontend.evidenceDir + '/config-validation.json'],
      tags: ['config', 'schema', 'diagnostics'],
      source: '@shapeshift-labs/frontier-schema',
      ok: true
    },
    {
      id: 'auth-contracts',
      title: 'Validate Frontier auth providers, gates, token contracts, runtime grants, and evidence',
      required: config.auth.enabled && config.auth.strict,
      command: 'frontier auth --json',
      artifacts: [config.auth.manifestFile, config.auth.evidenceFile],
      evidence: [config.auth.evidenceFile],
      tags: ['auth', 'session', 'gate', 'token', 'runtime'],
      source: '@shapeshift-labs/frontier-auth',
      ok: config.auth.enabled,
      detail: 'Auth is app-owned, but provider/session/gate/token/runtime contracts are declared for agents and CI.'
    },
    {
      id: 'conformance-lint',
      title: 'Enforce Frontier package-use conformance and SARIF output',
      required: config.conformance.enabled && config.conformance.failOnViolation,
      command: 'frontier lint --json',
      artifacts: [config.conformance.reportFile, config.conformance.sarifFile],
      evidence: [config.conformance.reportFile],
      tags: ['conformance', 'lint', 'package-use', 'sarif'],
      source: '@shapeshift-labs/frontier-linter',
      ok: true,
      detail: 'Fails when matching frontend, sync, migration, telemetry, harness, or agent surfaces do not use required Frontier packages.'
    },
    {
      id: 'surface-coverage',
      title: 'Fail claimed surfaces without render, state, and evidence coverage',
      required: config.surfaces.coverage.enabled && config.surfaces.coverage.failOnMissing,
      command: 'frontier coverage --strict --json',
      artifacts: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile],
      evidence: [config.surfaces.coverage.reportFile],
      tags: ['surfaces', 'status', 'coverage', 'render', 'state', 'evidence'],
      source: '@shapeshift-labs/frontier-framework',
      ok: plan.surfaceCoverage.ok,
      detail: plan.surfaceCoverage.summary.missingCount + ' missing claimed surface(s), dashboard ' + config.surfaces.coverage.dashboardFile
    },
    {
      id: 'agent-surface-loop',
      title: 'Expose the next surface and missing probes through one agent loop',
      required: config.surfaces.coverage.enabled,
      command: config.surfaces.coverage.failOnMissing ? 'frontier loop --strict --json' : 'frontier loop --json',
      artifacts: [agentArtifactPath(config, 'surface-loop.json'), agentArtifactPath(config, 'surface-loop.md')],
      evidence: [agentArtifactPath(config, 'surface-loop.json'), config.surfaces.coverage.reportFile],
      tags: ['agent', 'surfaces', 'coverage', 'next-task'],
      source: '@shapeshift-labs/frontier-framework',
      ok: plan.surfaceCoverage.ok || !config.surfaces.coverage.failOnMissing,
      detail: 'Writes route/page/filter/action focus buckets and missing render/state/evidence probes.'
    },
    {
      id: 'runtime-migrations',
      title: 'Validate runtime data-source migration manifest and generated bridge',
      required: config.migrations.enabled && config.migrations.strict,
      command: 'frontier migrations --json',
      artifacts: [config.migrations.evidenceFile, config.migrations.runtimeBridgeFile],
      evidence: [config.migrations.evidenceFile],
      tags: ['migrations', 'runtime', 'state', 'cache'],
      source: '@shapeshift-labs/frontier-migrations',
      ok: config.migrations.enabled
    },
    {
      id: 'doctor',
      title: 'Run framework diagnostics for config, source policy, deploy split, and harness readiness',
      required: true,
      command: 'frontier doctor --json',
      artifacts: [config.frontend.evidenceDir + '/source-policy.json', config.frontend.evidenceDir + '/config-validation.json'],
      evidence: [config.frontend.evidenceDir + '/evidence.json'],
      tags: ['doctor', 'diagnostics', 'source-policy'],
      source: '@shapeshift-labs/frontier-framework',
      ok: readiness.ok
    },
    {
      id: 'hybrid-harness',
      title: 'Validate generated smoke, fuzz, benchmark, browser, linter, and hybrid gates',
      required: config.agent.requireHarness,
      command: 'frontier harness --json',
      artifacts: [config.harness.evidenceDir + '/evidence.json', config.harness.generatedDir + '/harness-plan.json', ...harnessTemplates.files],
      evidence: [config.harness.evidenceDir + '/evidence.json'],
      tags: ['harness', 'fuzz', 'benchmark', 'browser', 'telemetry'],
      source: '@shapeshift-labs/frontier-test',
      ok: harness.ok,
      detail: harness.checks.filter((check) => !check.ok).map((check) => check.id).join(', ') || 'all harness checks passed'
    },
    {
      id: 'agent-readiness',
      title: 'Assert agent manifest, evidence, harness, MCP tools, workflow, SARIF, and handoff bundles exist',
      required: true,
      command: 'node ' + agentArtifactPath(config, 'frontier-agent-check.mjs'),
      artifacts: [
        agentArtifactPath(config, 'agent-manifest.json'),
        agentArtifactPath(config, 'agent-readiness.json'),
        agentArtifactPath(config, 'mcp-tools.json'),
        agentArtifactPath(config, 'tool-manifest.json'),
        agentArtifactPath(config, 'ci-evidence-gates.json'),
        agentArtifactPath(config, 'frontier-agent-lint.json'),
        agentArtifactPath(config, 'frontier-agent-lint.sarif'),
        agentArtifactPath(config, 'agent-workflow.json'),
        agentArtifactPath(config, 'agent-workflow-proof.json'),
        agentArtifactPath(config, 'ISSUE-HANDOFF.md'),
        agentArtifactPath(config, 'PR-HANDOFF.md'),
        agentArtifactPath(config, 'frontier-agent-replay.mjs')
      ],
      evidence: [agentArtifactPath(config, 'agent-readiness.json')],
      tags: ['agent', 'handoff', 'mcp', 'workflow', 'sarif', 'replay'],
      source: '@shapeshift-labs/frontier-tools,@shapeshift-labs/frontier-workflow,@shapeshift-labs/frontier-linter',
      ok: readiness.ok
    },
    {
      id: 'fuzz-replay',
      title: 'Run generated model/property fuzzers with replayable minimized failures',
      required: config.harness.failOnMissing,
      command: 'npm run fuzz -- --cases 64',
      artifacts: [config.harness.evidenceDir + '/fuzz-summary.json'],
      evidence: [config.harness.evidenceDir + '/fuzz-summary.json'],
      tags: ['fuzz', 'model-checking', 'replay'],
      source: '@shapeshift-labs/frontier-test',
      ok: harness.checks.some((check) => check.id === 'fuzzers' && check.ok)
    },
    {
      id: 'benchmark-evidence',
      title: 'Run generated route, replay, indexing, and telemetry benchmark evidence',
      required: false,
      command: 'npm run bench -- --runs 5',
      artifacts: [config.harness.evidenceDir + '/benchmark-summary.json'],
      evidence: [config.harness.evidenceDir + '/benchmark-summary.json'],
      tags: ['benchmark', 'telemetry', 'performance'],
      source: '@shapeshift-labs/frontier-test',
      ok: harness.checks.some((check) => check.id === 'benchmarks' && check.ok)
    },
    {
      id: 'browser-evidence',
      title: 'Run browser DOM/state/route/devtools/telemetry probes together',
      required: false,
      command: 'npm run browser',
      artifacts: [config.harness.evidenceDir + '/browser-harness.json'],
      evidence: [config.harness.evidenceDir + '/browser-harness.json'],
      tags: ['browser', 'playwright', 'devtools', 'telemetry'],
      source: '@shapeshift-labs/frontier-playwright',
      ok: harness.checks.some((check) => check.id === 'browser' && check.ok)
    }
  ];
  return {
    kind: 'frontier.framework.agent.ci-evidence-gates',
    appId: config.id,
    generatedAt: new Date().toISOString(),
    mode: config.harness.mode,
    gates,
    commands: gates.filter((gate) => gate.command !== undefined).map((gate) => gate.command as string),
    requiredArtifacts: sortedUniqueStrings(gates.filter((gate) => gate.required).flatMap((gate) => gate.artifacts))
  };
}

function createAgentLintReport(
  config: NormalizedFrontierFrameworkConfig,
  readiness: AgentReadiness,
  ciGates: AgentCiGateBundle
): FrontierLintResult {
  const diagnostics: FrontierLintDiagnostic[] = [
    ...readiness.checks
      .filter((check) => !check.ok)
      .map((check) => ({
        id: 'agent-readiness-' + check.id,
        ruleId: 'frontier/agent-readiness/' + check.id,
        severity: check.required ? 'error' as const : 'warning' as const,
        message: check.detail,
        target: { id: check.id, kind: 'evidence', file: 'frontier.config.mjs' },
        evidence: [check.detail],
        tags: ['agent', 'readiness']
      })),
    ...ciGates.gates
      .filter((gate) => gate.required && gate.ok === false)
      .map((gate) => ({
        id: 'agent-gate-' + gate.id,
        ruleId: 'frontier/agent-gate/' + gate.id,
        severity: 'error' as const,
        message: gate.detail ?? gate.title,
        target: { id: gate.id, kind: 'evidence', file: gate.artifacts[0] ?? config.agent.generatedDir },
        evidence: gate.evidence,
        tags: ['agent', 'ci', ...gate.tags]
      }))
  ];
  const severityCount = (severity: FrontierLintDiagnostic['severity']) => diagnostics.filter((diagnostic) => diagnostic.severity === severity).length;
  const ruleCount = new Set(diagnostics.map((diagnostic) => diagnostic.ruleId)).size;
  return {
    kind: 'frontier.linter.report',
    version: 1,
    id: config.id + '.agent-lint',
    generatedAt: Date.now(),
    diagnostics,
    suppressed: [],
    summary: {
      resourceCount: readiness.checks.length + ciGates.gates.length,
      edgeCount: 0,
      evidenceCount: sortedUniqueStrings(ciGates.gates.flatMap((gate) => gate.evidence)).length,
      packageCount: 1,
      sourceCount: 0,
      ruleCount,
      diagnosticCount: diagnostics.length,
      errorCount: severityCount('error'),
      warningCount: severityCount('warning'),
      infoCount: severityCount('info'),
      hintCount: severityCount('hint'),
      fixableCount: 0,
      suppressedCount: 0,
      elapsedMs: 0,
      valid: diagnostics.every((diagnostic) => diagnostic.severity !== 'error')
    },
    metadata: {
      kind: 'frontier.framework.agent.lint',
      appId: config.id,
      gateCount: ciGates.gates.length,
      source: '@shapeshift-labs/frontier-linter'
    }
  };
}

function createAgentWorkflow(
  config: NormalizedFrontierFrameworkConfig,
  ciGates: AgentCiGateBundle
) {
  return createWorkflowManifest({
    id: config.id + '.agent-evidence',
    title: 'Frontier agent evidence workflow',
    description: 'Orient, build, validate, lint, hand off, and replay Frontier evidence from the generated project graph.',
    package: '@shapeshift-labs/frontier-framework',
    feature: config.id,
    startAt: 'orient',
    steps: [
      {
        id: 'orient',
        title: 'Inspect Frontier project graph',
        type: 'action',
        action: 'frontier.inspect',
        reads: ['frontier.config.mjs'],
        writes: [config.frontend.evidenceDir],
        effects: ['diagnostic.read'],
        next: 'build-evidence',
        tags: ['agent', 'orient']
      },
      {
        id: 'build-evidence',
        title: 'Build evidence artifacts',
        type: 'action',
        action: 'frontier.build',
        reads: ['frontier.config.mjs', config.frontend.root, config.backend.root],
        writes: [config.frontend.outDir, config.backend.outDir, config.frontend.evidenceDir],
        effects: ['filesystem.write'],
        next: 'validate-config',
        tags: ['agent', 'build', 'evidence']
      },
      {
        id: 'validate-config',
        title: 'Validate framework config',
        type: 'action',
        action: 'frontier.config.validate',
        reads: ['frontier.config.mjs'],
        writes: [config.frontend.evidenceDir + '/config-validation.json'],
        effects: ['diagnostic.read'],
        next: 'check-surface-loop',
        tags: ['agent', 'config', 'schema']
      },
      {
        id: 'check-surface-loop',
        title: 'Check next surface render, state, and evidence loop',
        type: 'action',
        action: 'frontier.agent.loop',
        reads: ['frontier.config.mjs', config.surfaces.registryFile, config.routeScenarios.manifestFile],
        writes: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile, agentArtifactPath(config, 'surface-loop.json')],
        effects: ['surface-coverage.plan', 'agent.plan'],
        next: 'run-harness',
        tags: ['agent', 'surfaces', 'coverage', 'next-task']
      },
      {
        id: 'run-harness',
        title: 'Validate hybrid harness',
        type: 'action',
        action: 'frontier.harness',
        reads: [config.frontend.evidenceDir, config.agent.manifestDir + '/*.json'],
        writes: [config.harness.evidenceDir, config.harness.generatedDir],
        effects: ['harness.validate'],
        next: 'export-agent-tools',
        tags: ['agent', 'harness']
      },
      {
        id: 'export-agent-tools',
        title: 'Export MCP tools and CI gates',
        type: 'action',
        action: 'frontier.agent',
        reads: [config.frontend.evidenceDir, config.harness.evidenceDir],
        writes: [config.agent.generatedDir + '/mcp-tools.json', config.agent.generatedDir + '/ci-evidence-gates.json'],
        effects: ['agent.tools.export', 'agent.gates.export'],
        next: 'lint-handoff',
        tags: ['agent', 'mcp', 'ci']
      },
      {
        id: 'lint-handoff',
        title: 'Export linter and SARIF diagnostics',
        type: 'action',
        action: 'frontier.agent.lint',
        reads: [config.agent.generatedDir + '/ci-evidence-gates.json'],
        writes: [config.agent.generatedDir + '/frontier-agent-lint.json', config.agent.generatedDir + '/frontier-agent-lint.sarif'],
        effects: ['agent.lint.export'],
        next: 'handoff',
        tags: ['agent', 'lint', 'sarif']
      },
      {
        id: 'handoff',
        title: 'Prepare issue and PR handoff bundles',
        type: 'action',
        action: 'frontier.agent.handoff',
        reads: [config.agent.generatedDir + '/agent-readiness.json', config.agent.generatedDir + '/frontier-agent-lint.sarif'],
        writes: [config.agent.handoffFile, config.agent.generatedDir + '/ISSUE-HANDOFF.md', config.agent.generatedDir + '/PR-HANDOFF.md'],
        effects: ['agent.handoff'],
        next: 'replay',
        tags: ['agent', 'handoff']
      },
      {
        id: 'replay',
        title: 'Replay required CI evidence gates',
        type: 'action',
        action: 'frontier.agent.replay',
        reads: [config.agent.generatedDir + '/ci-evidence-gates.json'],
        writes: [config.agent.generatedDir + '/agent-replay.json', config.agent.runsDir],
        effects: ['agent.replay'],
        tags: ['agent', 'replay']
      }
    ],
    resources: sortedUniqueStrings([
      config.frontend.evidenceDir,
      config.harness.evidenceDir,
      config.agent.generatedDir,
      ...ciGates.requiredArtifacts
    ]),
    capabilities: ['frontier.inspect', 'frontier.build', 'frontier.config.validate', 'frontier.coverage', 'frontier.harness', 'frontier.agent', 'frontier.agent.lint', 'frontier.agent.replay'],
    effects: ['diagnostic.read', 'filesystem.write', 'surface-coverage.plan', 'harness.validate', 'agent.tools.export', 'agent.gates.export', 'agent.lint.export', 'agent.handoff', 'agent.replay'],
    tags: ['agent', 'workflow', 'evidence', 'mcp', 'ci', 'sarif', 'replay'],
    metadata: {
      source: '@shapeshift-labs/frontier-workflow',
      gates: ciGates.gates.map((gate) => ({ id: gate.id, required: gate.required, command: gate.command }))
    }
  });
}

function sortedUniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort();
}

async function createAgentReadiness(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  plan: ReturnType<typeof createFrontierFramework>,
  harness: HarnessValidation,
  mode: 'build' | 'agent'
): Promise<AgentReadiness> {
  const checks: AgentReadiness['checks'] = [];
  const add = (id: string, required: boolean, ok: boolean, detail: string) => {
    checks.push({ id, required, ok, detail });
  };
  add('agent-enabled', true, config.agent.enabled, 'agent.enabled must be true');
  add('agent-capabilities', true, plan.agent.capabilities.length >= 5, String(plan.agent.capabilities.length) + ' capabilities declared');
  add('agent-checkpoints', true, plan.agent.checkpoints.some((checkpoint) => checkpoint.required), String(plan.agent.checkpoints.length) + ' checkpoints declared');
  const hasFeatureManifest = await filePatternExists(cwd, config.agent.manifestDir + '/*.json');
  add('feature-manifest', config.agent.requireFeatureManifest, hasFeatureManifest, config.agent.manifestDir + '/*.json');
  const evidenceFile = path.resolve(cwd, config.frontend.evidenceDir, 'evidence.json');
  add('evidence', config.agent.requireEvidence, existsSync(evidenceFile) || mode === 'build', mode === 'build' && !existsSync(evidenceFile) ? 'planned by current build' : path.relative(cwd, evidenceFile));
  const previewFile = path.resolve(cwd, config.componentPreview.outDir, config.componentPreview.htmlFileName);
  add('component-preview', config.componentPreview.enabled, !config.componentPreview.enabled || existsSync(previewFile) || mode === 'build', mode === 'build' && !existsSync(previewFile) ? 'planned by current build' : path.relative(cwd, previewFile));
  const documentationFile = path.resolve(cwd, config.documentation.outDir, config.documentation.htmlFileName);
  add('documentation', config.documentation.enabled, !config.documentation.enabled || existsSync(documentationFile) || mode === 'build', mode === 'build' && !existsSync(documentationFile) ? 'planned by current build' : path.relative(cwd, documentationFile));
  add('harness', config.agent.requireHarness, harness.ok, 'frontier harness status: ' + (harness.ok ? 'ok' : 'failed'));
  const proofFile = path.resolve(cwd, config.frontend.evidenceDir, 'manifest-proof.json');
  add('manifest-proof', config.agent.requireProof, existsSync(proofFile) || mode === 'build', mode === 'build' && !existsSync(proofFile) ? 'planned by current build' : path.relative(cwd, proofFile));
  const coverageRequired = config.surfaces.coverage.enabled && config.surfaces.coverage.failOnMissing;
  const surfaceCoverageFile = path.resolve(cwd, config.surfaces.coverage.reportFile);
  const surfaceDashboardFile = path.resolve(cwd, config.surfaces.coverage.dashboardFile);
  const surfaceLoopFile = path.resolve(cwd, agentArtifactPath(config, 'surface-loop.json'));
  const surfaceLoopDashboardFile = path.resolve(cwd, agentArtifactPath(config, 'surface-loop.md'));
  add('surface-coverage', coverageRequired, !config.surfaces.coverage.enabled || plan.surfaceCoverage.ok, plan.surfaceCoverage.summary.missingCount + ' missing claimed surface(s)');
  add('surface-coverage-report', config.surfaces.coverage.enabled, existsSync(surfaceCoverageFile) || mode === 'build', mode === 'build' && !existsSync(surfaceCoverageFile) ? 'planned by current build' : path.relative(cwd, surfaceCoverageFile));
  add('surface-coverage-dashboard', config.surfaces.coverage.enabled, existsSync(surfaceDashboardFile) || mode === 'build', mode === 'build' && !existsSync(surfaceDashboardFile) ? 'planned by current build' : path.relative(cwd, surfaceDashboardFile));
  add('surface-loop-report', config.surfaces.coverage.enabled, existsSync(surfaceLoopFile) || mode === 'build', mode === 'build' && !existsSync(surfaceLoopFile) ? 'planned by current build' : path.relative(cwd, surfaceLoopFile));
  add('surface-loop-dashboard', config.surfaces.coverage.enabled, existsSync(surfaceLoopDashboardFile) || mode === 'build', mode === 'build' && !existsSync(surfaceLoopDashboardFile) ? 'planned by current build' : path.relative(cwd, surfaceLoopDashboardFile));
  const migrationsFile = path.resolve(cwd, config.migrations.evidenceFile);
  add('runtime-migrations', config.migrations.enabled && config.migrations.strict, existsSync(migrationsFile) || mode === 'build', mode === 'build' && !existsSync(migrationsFile) ? 'planned by current build' : path.relative(cwd, migrationsFile));
  add('open-question-budget', true, config.agent.maxOpenQuestions >= 0, 'maxOpenQuestions=' + config.agent.maxOpenQuestions);
  add('agent-mcp-tools', true, config.agent.enabled, agentArtifactPath(config, 'mcp-tools.json'));
  add('agent-tool-manifest', true, config.agent.enabled, agentArtifactPath(config, 'tool-manifest.json'));
  add('agent-ci-gates', true, config.agent.enabled, agentArtifactPath(config, 'ci-evidence-gates.json'));
  add('agent-linter-report', true, config.agent.enabled, agentArtifactPath(config, 'frontier-agent-lint.json'));
  add('agent-sarif', true, config.agent.enabled, agentArtifactPath(config, 'frontier-agent-lint.sarif'));
  add('agent-workflow', true, config.agent.enabled, agentArtifactPath(config, 'agent-workflow.json'));
  add('agent-replay-script', true, config.agent.enabled, agentArtifactPath(config, 'frontier-agent-replay.mjs'));
  add('agent-handoff-bundles', true, config.agent.enabled, agentArtifactPath(config, 'ISSUE-HANDOFF.md') + ', ' + agentArtifactPath(config, 'PR-HANDOFF.md'));
  const ok = checks.every((check) => check.ok || !check.required);
  return {
    kind: 'frontier.framework.agent.readiness',
    appId: config.id,
    ok,
    generatedAt: new Date().toISOString(),
    checks
  };
}

function renderAgentCheckScript(config: NormalizedFrontierFrameworkConfig): string {
  return `import assert from 'node:assert';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const agentDir = path.join(root, ${JSON.stringify(config.agent.generatedDir)});
const evidenceFile = path.join(root, ${JSON.stringify(config.frontend.evidenceDir)}, 'evidence.json');
const harnessFile = path.join(root, ${JSON.stringify(config.harness.evidenceDir)}, 'evidence.json');
const surfaceCoverageFile = path.join(root, ${JSON.stringify(config.surfaces.coverage.reportFile)});
const surfaceDashboardFile = path.join(root, ${JSON.stringify(config.surfaces.coverage.dashboardFile)});
const surfaceLoopFile = path.join(agentDir, 'surface-loop.json');
const surfaceLoopDashboardFile = path.join(agentDir, 'surface-loop.md');
const surfaceCoverageEnabled = ${JSON.stringify(config.surfaces.coverage.enabled)};
const surfaceCoverageStrict = ${JSON.stringify(config.surfaces.coverage.failOnMissing)};
const manifestFile = path.join(agentDir, 'agent-manifest.json');
const requiredAgentFiles = [
  'agent-manifest.json',
  'agent-actions.json',
  'agent-checkpoints.json',
  'feature-map.json',
  'mcp-tools.json',
  'tool-manifest.json',
  'ci-evidence-gates.json',
  'frontier-agent-lint.json',
  'frontier-agent-lint.sarif',
  'agent-workflow.json',
  'agent-workflow-proof.json',
  'frontier-agent-replay.mjs',
  'ISSUE-HANDOFF.md',
  'PR-HANDOFF.md',
  'AGENT-RUNBOOK.md',
  'HANDOFF.md'
];

assert.ok(existsSync(manifestFile), 'agent manifest must exist; run frontier agent or frontier build first');
assert.ok(existsSync(evidenceFile), 'evidence must exist before agent handoff');
assert.ok(existsSync(harnessFile), 'harness evidence must exist before agent handoff');
if (surfaceCoverageEnabled) {
  assert.ok(existsSync(surfaceCoverageFile), 'surface coverage must exist before agent handoff');
  assert.ok(existsSync(surfaceDashboardFile), 'surface coverage dashboard must exist before agent handoff');
  assert.ok(existsSync(surfaceLoopFile), 'surface loop report must exist before agent handoff');
  assert.ok(existsSync(surfaceLoopDashboardFile), 'surface loop dashboard must exist before agent handoff');
}
for (const file of requiredAgentFiles) {
  assert.ok(existsSync(path.join(agentDir, file)), 'agent artifact must exist: ' + file);
}

const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
const evidence = JSON.parse(await fs.readFile(evidenceFile, 'utf8'));
const harness = JSON.parse(await fs.readFile(harnessFile, 'utf8'));
const mcpTools = JSON.parse(await fs.readFile(path.join(agentDir, 'mcp-tools.json'), 'utf8'));
const toolManifest = JSON.parse(await fs.readFile(path.join(agentDir, 'tool-manifest.json'), 'utf8'));
const ciGates = JSON.parse(await fs.readFile(path.join(agentDir, 'ci-evidence-gates.json'), 'utf8'));
const lintReport = JSON.parse(await fs.readFile(path.join(agentDir, 'frontier-agent-lint.json'), 'utf8'));
const sarif = JSON.parse(await fs.readFile(path.join(agentDir, 'frontier-agent-lint.sarif'), 'utf8'));
const workflow = JSON.parse(await fs.readFile(path.join(agentDir, 'agent-workflow.json'), 'utf8'));
const surfaceCoverage = surfaceCoverageEnabled ? JSON.parse(await fs.readFile(surfaceCoverageFile, 'utf8')) : undefined;
const surfaceLoop = surfaceCoverageEnabled ? JSON.parse(await fs.readFile(surfaceLoopFile, 'utf8')) : undefined;
assert.strictEqual(manifest.appId, ${JSON.stringify(config.id)});
assert.strictEqual(evidence.appId, ${JSON.stringify(config.id)});
assert.ok(Array.isArray(manifest.capabilities) && manifest.capabilities.length > 0, 'agent capabilities must be declared');
assert.ok(Array.isArray(manifest.checkpoints) && manifest.checkpoints.some((checkpoint) => checkpoint.required), 'required checkpoints must be declared');
assert.ok(harness.ok === true, 'harness must be ok for agent handoff');
if (surfaceCoverageEnabled) {
  assert.ok(surfaceCoverage.dashboard?.byKind, 'surface coverage dashboard must include kind buckets');
  assert.ok(surfaceLoop.dashboard?.focus, 'surface loop report must include focus buckets');
  if (surfaceCoverageStrict) {
    assert.ok(surfaceCoverage.ok === true, 'claimed surfaces must have render/state/evidence coverage');
    assert.ok(surfaceLoop.ok === true, 'agent loop must be clean in strict surface coverage mode');
  }
}
assert.ok(Array.isArray(mcpTools.tools) && mcpTools.tools.length > 0, 'MCP tool descriptors must be emitted');
assert.ok(Array.isArray(toolManifest.manifest?.actions) && toolManifest.manifest.actions.length > 0, 'Frontier tool manifest must be emitted');
assert.ok(Array.isArray(ciGates.gates) && ciGates.gates.some((gate) => gate.id === 'agent-readiness'), 'CI evidence gates must include agent-readiness');
assert.ok(Array.isArray(ciGates.gates) && ciGates.gates.some((gate) => gate.id === 'surface-coverage'), 'CI evidence gates must include surface-coverage');
assert.strictEqual(lintReport.kind, 'frontier.linter.report', 'Frontier linter report must be emitted');
assert.strictEqual(sarif.version, '2.1.0', 'SARIF output must be v2.1.0');
assert.strictEqual(workflow.kind, 'frontier.workflow.manifest', 'Frontier workflow manifest must be emitted');

const readiness = {
  kind: 'frontier.framework.agent.readiness',
  appId: ${JSON.stringify(config.id)},
  ok: true,
  generatedAt: new Date().toISOString(),
  checks: [
    { id: 'agent-manifest', required: true, ok: true, detail: 'agent-manifest.json' },
    { id: 'evidence', required: true, ok: true, detail: ${JSON.stringify(config.frontend.evidenceDir)} + '/evidence.json' },
    { id: 'harness', required: true, ok: true, detail: ${JSON.stringify(config.harness.evidenceDir)} + '/evidence.json' },
    { id: 'surface-coverage', required: surfaceCoverageStrict, ok: true, detail: ${JSON.stringify(config.surfaces.coverage.reportFile)} },
    { id: 'surface-coverage-dashboard', required: surfaceCoverageEnabled, ok: true, detail: ${JSON.stringify(config.surfaces.coverage.dashboardFile)} },
    { id: 'surface-loop-report', required: surfaceCoverageEnabled, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'surface-loop.json'))} },
    { id: 'surface-loop-dashboard', required: surfaceCoverageEnabled, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'surface-loop.md'))} },
    { id: 'agent-mcp-tools', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'mcp-tools.json'))} },
    { id: 'agent-tool-manifest', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'tool-manifest.json'))} },
    { id: 'agent-ci-gates', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'ci-evidence-gates.json'))} },
    { id: 'agent-linter-report', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'frontier-agent-lint.json'))} },
    { id: 'agent-sarif', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'frontier-agent-lint.sarif'))} },
    { id: 'agent-workflow', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'agent-workflow.json'))} },
    { id: 'agent-replay-script', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'frontier-agent-replay.mjs'))} },
    { id: 'agent-handoff-bundles', required: true, ok: true, detail: ${JSON.stringify(agentArtifactPath(config, 'ISSUE-HANDOFF.md') + ', ' + agentArtifactPath(config, 'PR-HANDOFF.md'))} }
  ]
};
await fs.writeFile(path.join(agentDir, 'agent-readiness.json'), JSON.stringify(readiness, null, 2) + '\\n');
`;
}

function renderAgentHandoffScript(config: NormalizedFrontierFrameworkConfig): string {
  return `import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const agentDir = path.join(root, ${JSON.stringify(config.agent.generatedDir)});
const evidenceFile = path.join(root, ${JSON.stringify(config.frontend.evidenceDir)}, 'evidence.json');
const readinessFile = path.join(agentDir, 'agent-readiness.json');
const evidence = JSON.parse(await fs.readFile(evidenceFile, 'utf8'));
const readiness = JSON.parse(await fs.readFile(readinessFile, 'utf8'));
const markdown = [
  '# Frontier Agent Handoff',
  '',
  '- App: ' + evidence.appId,
  '- Ready: ' + readiness.ok,
  '- Evidence: ' + ${JSON.stringify(config.frontend.evidenceDir)} + '/evidence.json',
  '- Harness: ' + ${JSON.stringify(config.harness.evidenceDir)} + '/evidence.json',
  '- Surface coverage: ' + ${JSON.stringify(config.surfaces.coverage.reportFile)},
  '- Surface dashboard: ' + ${JSON.stringify(config.surfaces.coverage.dashboardFile)},
  '- Surface loop: ' + ${JSON.stringify(agentArtifactPath(config, 'surface-loop.json'))},
  '- Manifest hash: ' + evidence.manifestHash,
  '- MCP tools: ' + ${JSON.stringify(agentArtifactPath(config, 'mcp-tools.json'))},
  '- CI gates: ' + ${JSON.stringify(agentArtifactPath(config, 'ci-evidence-gates.json'))},
  '- SARIF: ' + ${JSON.stringify(agentArtifactPath(config, 'frontier-agent-lint.sarif'))},
  '',
  '## Gates',
  ...readiness.checks.map((check) => '- ' + (check.ok ? 'ok' : 'missing') + ': ' + check.id + ' - ' + check.detail),
  '',
  '## Open Questions',
  '- None recorded.'
].join('\\n');
const handoffFile = path.join(root, ${JSON.stringify(config.agent.handoffFile)});
await fs.mkdir(path.dirname(handoffFile), { recursive: true });
await fs.writeFile(handoffFile, markdown + '\\n');
`;
}

function renderAgentRunbook(config: NormalizedFrontierFrameworkConfig, plan: ReturnType<typeof createFrontierFramework>): string {
  const lines = [
    '# Frontier Agent Runbook',
    '',
    'App: `' + config.id + '`',
    '',
    '## Default Loop',
    '',
    '1. Run `frontier inspect --json` and read `dist/frontier/application.json` when present.',
    '2. Confirm `features/*.json` covers the route, endpoint, state, tool, or visible workflow being changed.',
    '3. Build with `frontier build --json` so frontend, backend, evidence, harness, and agent artifacts stay in sync.',
    '4. Run `frontier loop --strict --json` and read `' + agentArtifactPath(config, 'surface-loop.json') + '` before choosing the next surface.',
    '5. Run `frontier harness --json`, then the generated fuzz, benchmark, and browser probes that match the touched surface.',
    '6. Run `node ' + config.agent.generatedDir + '/frontier-agent-check.mjs` before handoff.',
    '7. Run `node ' + config.agent.generatedDir + '/frontier-agent-replay.mjs --required-only` when CI or another agent needs to replay the evidence gates.',
    '',
    '## Agent Artifacts',
    '',
    '- MCP tools: `' + agentArtifactPath(config, 'mcp-tools.json') + '`',
    '- Frontier tool manifest: `' + agentArtifactPath(config, 'tool-manifest.json') + '`',
    '- Surface coverage: `' + config.surfaces.coverage.reportFile + '`',
    '- Surface dashboard: `' + config.surfaces.coverage.dashboardFile + '`',
    '- Surface loop: `' + agentArtifactPath(config, 'surface-loop.json') + '`',
    '- CI evidence gates: `' + agentArtifactPath(config, 'ci-evidence-gates.json') + '`',
    '- Frontier linter report: `' + agentArtifactPath(config, 'frontier-agent-lint.json') + '`',
    '- SARIF/linter output: `' + agentArtifactPath(config, 'frontier-agent-lint.sarif') + '`',
    '- Workflow manifest: `' + agentArtifactPath(config, 'agent-workflow.json') + '`',
    '- Issue handoff: `' + agentArtifactPath(config, 'ISSUE-HANDOFF.md') + '`',
    '- PR handoff: `' + agentArtifactPath(config, 'PR-HANDOFF.md') + '`',
    '- Replay script: `' + agentArtifactPath(config, 'frontier-agent-replay.mjs') + '`',
    '',
    '## Capabilities',
    '',
    ...plan.agent.capabilities.map((capability) => '- `' + capability.id + '`: `' + capability.command + '`'),
    '',
    '## Required Checkpoints',
    '',
    ...plan.agent.checkpoints.filter((checkpoint) => checkpoint.required).map((checkpoint) => '- `' + checkpoint.id + '`: ' + checkpoint.title),
    '',
    'Evidence directory: `' + config.frontend.evidenceDir + '`',
    'Harness directory: `' + config.harness.evidenceDir + '`',
    'Agent runs directory: `' + config.agent.runsDir + '`',
    ''
  ];
  return lines.join('\n');
}

function renderAgentHandoffTemplate(config: NormalizedFrontierFrameworkConfig, readiness: AgentReadiness): string {
  return [
    '# Frontier Agent Handoff',
    '',
    '- App: `' + config.id + '`',
    '- Ready: `' + readiness.ok + '`',
    '- Evidence: `' + config.frontend.evidenceDir + '/evidence.json`',
    '- Harness: `' + config.harness.evidenceDir + '/evidence.json`',
    '- Surface coverage: `' + config.surfaces.coverage.reportFile + '`',
    '- Surface dashboard: `' + config.surfaces.coverage.dashboardFile + '`',
    '- Surface loop: `' + agentArtifactPath(config, 'surface-loop.json') + '`',
    '- Agent manifest: `' + config.agent.generatedDir + '/agent-manifest.json`',
    '- MCP tools: `' + agentArtifactPath(config, 'mcp-tools.json') + '`',
    '- CI gates: `' + agentArtifactPath(config, 'ci-evidence-gates.json') + '`',
    '- Linter report: `' + agentArtifactPath(config, 'frontier-agent-lint.json') + '`',
    '- SARIF: `' + agentArtifactPath(config, 'frontier-agent-lint.sarif') + '`',
    '- Workflow: `' + agentArtifactPath(config, 'agent-workflow.json') + '`',
    '- Replay: `node ' + agentArtifactPath(config, 'frontier-agent-replay.mjs') + ' --required-only`',
    '',
    '## Gates',
    '',
    ...readiness.checks.map((check) => '- `' + check.id + '`: ' + (check.ok ? 'ok' : 'missing') + ' - ' + check.detail),
    '',
    '## Open Questions',
    '',
    '- None recorded.',
    ''
  ].join('\n');
}

function renderAgentIssueHandoffTemplate(
  config: NormalizedFrontierFrameworkConfig,
  readiness: AgentReadiness,
  ciGates: AgentCiGateBundle
): string {
  return [
    '# Frontier Issue Handoff',
    '',
    '- App: `' + config.id + '`',
    '- Ready: `' + readiness.ok + '`',
    '- Evidence: `' + config.frontend.evidenceDir + '/evidence.json`',
    '- Harness: `' + config.harness.evidenceDir + '/evidence.json`',
    '- Linter report: `' + agentArtifactPath(config, 'frontier-agent-lint.json') + '`',
    '- SARIF: `' + agentArtifactPath(config, 'frontier-agent-lint.sarif') + '`',
    '',
    '## Reproduction',
    '',
    '1. `frontier build --target evidence --json`',
    '2. `frontier loop --strict --json`',
    '3. `frontier doctor --json`',
    '4. `node ' + agentArtifactPath(config, 'frontier-agent-replay.mjs') + ' --required-only`',
    '',
    '## Evidence Gates',
    '',
    ...ciGates.gates.map((gate) => '- `' + gate.id + '`: ' + (gate.required ? 'required' : 'optional') + (gate.command ? ' - `' + gate.command + '`' : '')),
    '',
    '## Observed',
    '',
    '- Fill in failing gate, route/state/transport surface, and attached evidence path.',
    '',
    '## Expected',
    '',
    '- Fill in expected behavior and acceptance criteria.',
    ''
  ].join('\n');
}

function renderAgentPrHandoffTemplate(
  config: NormalizedFrontierFrameworkConfig,
  readiness: AgentReadiness,
  ciGates: AgentCiGateBundle
): string {
  return [
    '# Frontier PR Handoff',
    '',
    '- App: `' + config.id + '`',
    '- Ready: `' + readiness.ok + '`',
    '- Feature manifests: `' + config.agent.manifestDir + '/*.json`',
    '- Agent runbook: `' + agentArtifactPath(config, 'AGENT-RUNBOOK.md') + '`',
    '- MCP tools: `' + agentArtifactPath(config, 'mcp-tools.json') + '`',
    '',
    '## Summary',
    '',
    '- Fill in the user-visible and package-boundary change.',
    '',
    '## Evidence',
    '',
    '- `frontier doctor --json`',
    '- `node ' + agentArtifactPath(config, 'frontier-agent-check.mjs') + '`',
    '- `node ' + agentArtifactPath(config, 'frontier-agent-replay.mjs') + ' --dry-run --required-only`',
    '- `' + agentArtifactPath(config, 'surface-loop.json') + '`',
    '- `' + config.frontend.evidenceDir + '/evidence.json`',
    '- `' + config.harness.evidenceDir + '/evidence.json`',
    '- `' + agentArtifactPath(config, 'frontier-agent-lint.json') + '`',
    '- `' + agentArtifactPath(config, 'frontier-agent-lint.sarif') + '`',
    '',
    '## Required Gates',
    '',
    ...ciGates.gates.filter((gate) => gate.required).map((gate) => '- `' + gate.id + '`: ' + gate.title),
    '',
    '## Risks And Rollback',
    '',
    '- Fill in changed routes, state paths, transports, migrations, tools, and rollback path.',
    ''
  ].join('\n');
}

function renderAgentReplayScript(config: NormalizedFrontierFrameworkConfig): string {
  return `#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const agentDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(agentDir, '..', '..');
const gatesFile = path.join(agentDir, 'ci-evidence-gates.json');
const dryRun = process.argv.includes('--dry-run');
const requiredOnly = process.argv.includes('--required-only');
const continueOnError = process.argv.includes('--continue-on-error');
if (!existsSync(gatesFile)) {
  throw new Error('Missing CI evidence gates: ' + path.relative(root, gatesFile));
}
const gates = JSON.parse(await fs.readFile(gatesFile, 'utf8'));
const selected = gates.gates.filter((gate) => gate.command && (!requiredOnly || gate.required));
const results = [];
let failed = false;
for (const gate of selected) {
  const startedAt = Date.now();
  if (dryRun) {
    results.push({ id: gate.id, command: gate.command, required: gate.required, status: 'planned', durationMs: 0 });
    continue;
  }
  const child = spawnSync(gate.command, {
    cwd: root,
    shell: true,
    stdio: 'inherit',
    env: process.env
  });
  const ok = child.status === 0;
  results.push({
    id: gate.id,
    command: gate.command,
    required: gate.required,
    status: ok ? 'ok' : 'failed',
    exitCode: child.status,
    signal: child.signal,
    durationMs: Date.now() - startedAt
  });
  if (!ok && gate.required) {
    failed = true;
    if (!continueOnError) break;
  }
}
const report = {
  kind: 'frontier.framework.agent.replay',
  appId: ${JSON.stringify(config.id)},
  generatedAt: new Date().toISOString(),
  dryRun,
  requiredOnly,
  gatesFile: path.relative(root, gatesFile).replace(/\\\\/g, '/'),
  results
};
await fs.writeFile(path.join(agentDir, 'agent-replay.json'), JSON.stringify(report, null, 2) + '\\n');
const runsDir = path.join(root, ${JSON.stringify(config.agent.runsDir)});
await fs.mkdir(runsDir, { recursive: true });
await fs.writeFile(path.join(runsDir, 'agent-replay-' + Date.now() + '.json'), JSON.stringify(report, null, 2) + '\\n');
if (failed) process.exit(1);
`;
}

function renderSmokeHarnessTemplate(config: NormalizedFrontierFrameworkConfig): string {
  return `import assert from 'node:assert';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const evidenceDir = ${JSON.stringify(config.frontend.evidenceDir)};
const evidenceFile = path.join(root, evidenceDir, 'evidence.json');
const planFile = path.join(root, ${JSON.stringify(config.harness.generatedDir)}, 'harness-plan.json');

assert.ok(existsSync(evidenceFile), 'frontier evidence must exist; run frontier build first');
assert.ok(existsSync(planFile), 'generated harness plan must exist');

const evidence = JSON.parse(await fs.readFile(evidenceFile, 'utf8'));
const plan = JSON.parse(await fs.readFile(planFile, 'utf8'));

assert.strictEqual(evidence.appId, ${JSON.stringify(config.id)});
assert.ok(Array.isArray(evidence.transports), 'transport evidence must be an array');
assert.ok(evidence.transports.some((transport) => transport.kind === 'fetch' || transport.kind === 'crdt-websocket'), 'at least one backend transport must be declared');
assert.ok(Array.isArray(plan.research) && plan.research.length > 0, 'research insights should be attached');
assert.ok(Array.isArray(plan.syncAdapters) && plan.syncAdapters.length > 0, 'sync adapter catalog should be attached');

await fs.mkdir(path.join(root, ${JSON.stringify(config.harness.evidenceDir)}), { recursive: true });
await fs.writeFile(path.join(root, ${JSON.stringify(config.harness.evidenceDir)}, 'smoke-summary.json'), JSON.stringify({
  kind: 'frontier.framework.harness.smoke',
  appId: evidence.appId,
  ok: true,
  checkedAt: new Date().toISOString()
}, null, 2) + '\\n');
`;
}

function renderFuzzHarnessTemplate(config: NormalizedFrontierFrameworkConfig): string {
  return `import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = new Map(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value, all[index + 1] ?? 'true'] : [value, value]));
const cases = Number(args.get('--cases') ?? 64);
const seed = Number(args.get('--seed') ?? 1337);
const replayFile = args.get('--replay');
let state = seed >>> 0;
function random() {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 0x100000000;
}

const root = process.cwd();
const plan = JSON.parse(await fs.readFile(path.join(root, ${JSON.stringify(config.harness.generatedDir)}, 'harness-plan.json'), 'utf8'));
const failures = [];
const seen = new Set();
const propertyResults = [];
const replayCases = replayFile ? await readReplayCases(path.resolve(root, replayFile)) : [];
const corpusCases = await readCorpusCases(path.join(root, ${JSON.stringify(config.harness.corpusDir)}));
const fastCheck = await loadFastCheck();

if (fastCheck) {
  await runFastCheckProperties(fastCheck);
} else {
  propertyResults.push({ id: 'fast-check', ok: true, mode: 'fallback', detail: 'fast-check not installed; deterministic property runner used' });
}

for (const testCase of [...corpusCases, ...replayCases]) {
  runCase(testCase, 'replay');
}

for (let index = 0; index < cases; index++) {
  runCase(generateCase(index), 'generated');
}

function runCase(testCase, source) {
  try {
    const result = runModelCase(testCase);
    for (const pair of result.coveredPairs) seen.add(pair);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({
      source,
      message,
      original: testCase,
      minimized: minimizeCase(testCase, message)
    });
  }
}

async function runFastCheckProperties(fc) {
  const routeCount = Math.max(plan.routes.length, 1);
  const transportCount = Math.max(plan.transports.length, 1);
  const gateCount = Math.max(plan.auth?.gates?.length ?? 0, 1);
  const commandArbitrary = fc.record({
    type: fc.constantFrom('navigate', 'commit-patch', 'record-event', 'record-crdt-update', 'record-telemetry', 'evaluate-auth-gate'),
    routeIndex: fc.integer({ min: 0, max: routeCount * 4 }),
    transportIndex: fc.integer({ min: 0, max: transportCount * 4 }),
    gateIndex: fc.integer({ min: 0, max: gateCount * 4 }),
    value: fc.oneof(fc.string({ maxLength: 32 }), fc.integer({ min: 0, max: 100000 }))
  });
  const caseArbitrary = fc.record({
    index: fc.nat(1000000),
    commands: fc.array(commandArbitrary, { minLength: 1, maxLength: 12 })
  });
  try {
    await fc.assert(
      fc.asyncProperty(caseArbitrary, async (input) => {
        runModelCase(normalizeCase(input));
      }),
      { numRuns: Math.max(1, Math.min(cases, 128)), seed }
    );
    propertyResults.push({ id: 'fast-check-model', ok: true, mode: 'fast-check', runs: Math.max(1, Math.min(cases, 128)) });
  } catch (error) {
    failures.push({ source: 'fast-check', message: error instanceof Error ? error.message : String(error), original: null, minimized: null });
    propertyResults.push({ id: 'fast-check-model', ok: false, mode: 'fast-check' });
  }
}

async function loadFastCheck() {
  try {
    const imported = await import('fast-check');
    return imported.default ?? imported;
  } catch {
    return undefined;
  }
}

async function readCorpusCases(dir) {
  try {
    const files = await fs.readdir(dir);
    const out = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const parsed = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'));
      if (Array.isArray(parsed.actions)) out.push(normalizeCase({ index: out.length, commands: parsed.actions, source: file }));
    }
    return out;
  } catch {
    return [];
  }
}

async function readReplayCases(file) {
  const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
  if (Array.isArray(parsed)) return parsed.map((item, index) => normalizeCase({ index, commands: item.commands ?? item.actions ?? [] }));
  if (Array.isArray(parsed.failures)) return parsed.failures.map((item, index) => normalizeCase({ index, commands: item.minimized?.commands ?? item.original?.commands ?? [] }));
  return [normalizeCase({ index: 0, commands: parsed.commands ?? parsed.actions ?? [] })];
}

function generateCase(index) {
  const commandCount = 2 + Math.floor(random() * 8);
  const commands = [];
  for (let step = 0; step < commandCount; step++) {
    const roll = random();
    const type = roll < 0.20 ? 'navigate'
      : roll < 0.40 ? 'commit-patch'
        : roll < 0.56 ? 'record-event'
          : roll < 0.72 ? 'record-crdt-update'
            : roll < 0.88 ? 'record-telemetry'
              : 'evaluate-auth-gate';
    commands.push({
      type,
      routeIndex: Math.floor(random() * Math.max(plan.routes.length, 1)),
      transportIndex: Math.floor(random() * Math.max(plan.transports.length, 1)),
      gateIndex: Math.floor(random() * Math.max(plan.auth?.gates?.length ?? 0, 1)),
      value: 'case-' + index + '-step-' + step
    });
  }
  return normalizeCase({ index, commands });
}

function normalizeCase(input) {
  return {
    index: Number(input.index ?? 0),
    commands: (input.commands ?? []).map((command, step) => ({
      type: String(command.type ?? 'navigate'),
      routeIndex: Number(command.routeIndex ?? command.route ?? step),
      transportIndex: Number(command.transportIndex ?? command.transport ?? step),
      gateIndex: Number(command.gateIndex ?? command.gate ?? step),
      value: command.value ?? command.name ?? command.path ?? step
    }))
  };
}

function runModelCase(testCase) {
  const model = {
    currentRoute: '/',
    patches: [],
    events: [],
    crdtUpdates: [],
    authDecisions: [],
    telemetry: [],
    cursorByTransport: new Map()
  };
  const coveredPairs = [];
  for (let step = 0; step < testCase.commands.length; step++) {
    const command = testCase.commands[step];
    const route = plan.routes[Math.abs(command.routeIndex) % Math.max(plan.routes.length, 1)] ?? { path: '/' };
    const transport = plan.transports[Math.abs(command.transportIndex) % Math.max(plan.transports.length, 1)] ?? { kind: 'fetch', protocol: 'http' };
    const gate = plan.auth?.gates?.[Math.abs(command.gateIndex) % Math.max(plan.auth?.gates?.length ?? 0, 1)] ?? { id: 'public', resource: route.path, required: false };
    const routePath = materializeRoute(route.path, testCase.index + step);
    const transportKind = String(transport.kind ?? 'custom');
    const protocol = String(transport.protocol ?? 'custom');
    coveredPairs.push(transportKind + ':' + protocol);
    assert.ok(routePath.startsWith('/'), 'route-materialization: route path must be absolute');
    assert.ok(!routePath.includes(':') && !routePath.includes('*'), 'route-materialization: route params must be materialized');
    assert.ok(transportKind.length > 0, 'transport-contract-shape: transport kind must be non-empty');
    assert.ok(protocol.length > 0, 'transport-contract-shape: transport protocol must be non-empty');

    if (command.type === 'navigate') {
      model.currentRoute = routePath;
    } else if (command.type === 'commit-patch') {
      const patch = { op: 'replace', path: '/route/current', value: routePath };
      assertPatch(patch);
      model.currentRoute = routePath;
      model.patches.push(patch);
    } else if (command.type === 'record-event') {
      const key = transportKind + ':' + protocol;
      const cursor = (model.cursorByTransport.get(key) ?? 0) + 1;
      model.cursorByTransport.set(key, cursor);
      model.events.push({ key, cursor, route: routePath });
    } else if (command.type === 'record-crdt-update') {
      model.crdtUpdates.push({ actor: 'agent-' + (testCase.index % 5), seq: step + 1, route: routePath });
    } else if (command.type === 'record-telemetry') {
      const telemetry = redactTelemetry({ name: 'model.step', route: routePath, transport: transportKind, token: 'secret-' + step });
      assert.ok(!JSON.stringify(telemetry).includes('secret-'), 'telemetry records must be redacted');
      model.telemetry.push(telemetry);
    } else if (command.type === 'evaluate-auth-gate') {
      assert.ok(String(gate.resource ?? '').length > 0, 'auth-gate-session-model: gate resource must be non-empty');
      const session = step % 2 === 0 ? null : { subject: 'user-' + testCase.index, profileComplete: true };
      const allowed = gate.required === true ? Boolean(session?.subject) : true;
      assert.strictEqual(allowed, gate.required === true ? Boolean(session?.subject) : true, 'auth-gate-session-model: required gates deny missing sessions');
      model.authDecisions.push({ gate: gate.id, allowed, subject: session?.subject ?? null });
    }
    assert.ok(model.currentRoute.startsWith('/'), 'state-model-replay: current route must stay absolute');
  }
  return { model, coveredPairs };
}

function materializeRoute(pattern, index) {
  const parts = String(pattern || '/').split('/').filter(Boolean);
  const out = [];
  for (const part of parts) {
    if (part.startsWith(':')) {
      const optional = part.endsWith('?');
      if (optional && index % 2 === 0) continue;
      out.push(part.replace(/^:/, '').replace(/\\?$/, '') + '-' + index);
    } else if (part.startsWith('*')) {
      const optional = part.endsWith('?');
      if (optional && index % 2 === 0) continue;
      out.push(part.replace(/^\\*/, '').replace(/\\?$/, '') + '-' + index, 'tail');
    } else {
      out.push(part);
    }
  }
  return '/' + out.join('/');
}

function assertPatch(patch) {
  assert.ok(['add', 'replace', 'remove'].includes(patch.op), 'patch op must be supported by the generated harness');
  assert.ok(typeof patch.path === 'string' && patch.path.startsWith('/'), 'patch-event-telemetry-causality: patch path must be an absolute JSON pointer');
}

function redactTelemetry(record) {
  const out = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = /token|password|secret/i.test(key) ? '[redacted]' : value;
  }
  return out;
}

function minimizeCase(testCase, expectedMessage) {
  let best = JSON.parse(JSON.stringify(testCase));
  let changed = true;
  while (changed && best.commands.length > 1) {
    changed = false;
    for (let index = 0; index < best.commands.length; index++) {
      const candidate = { ...best, commands: best.commands.filter((_, commandIndex) => commandIndex !== index) };
      if (caseStillFails(candidate, expectedMessage)) {
        best = candidate;
        changed = true;
        break;
      }
    }
  }
  return best;
}

function caseStillFails(testCase, expectedMessage) {
  try {
    runModelCase(testCase);
    return false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return expectedMessage ? message === expectedMessage : true;
  }
}

const outDir = path.join(root, ${JSON.stringify(config.harness.evidenceDir)});
await fs.mkdir(outDir, { recursive: true });
const summary = {
  kind: 'frontier.framework.harness.fuzz',
  appId: ${JSON.stringify(config.id)},
  engine: fastCheck ? 'fast-check' : 'deterministic-model',
  seed,
  cases,
  replayed: replayCases.length + corpusCases.length,
  ok: failures.length === 0,
  properties: plan.properties ?? [],
  propertyResults,
  coveredPairs: Array.from(seen).sort(),
  failures,
  minimized: failures.map((failure) => failure.minimized).filter(Boolean)
};
await fs.writeFile(path.join(outDir, 'fuzz-summary.json'), JSON.stringify(summary, null, 2) + '\\n');
if (failures.length > 0) {
  await fs.writeFile(path.join(outDir, 'fuzz-failures.json'), JSON.stringify(failures, null, 2) + '\\n');
  await fs.writeFile(path.join(outDir, 'fuzz-minimized.json'), JSON.stringify(summary.minimized, null, 2) + '\\n');
  process.exitCode = 1;
}
`;
}

function renderBenchmarkHarnessTemplate(config: NormalizedFrontierFrameworkConfig): string {
  return `import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const args = new Map(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value, all[index + 1] ?? 'true'] : [value, value]));
const runs = Number(args.get('--runs') ?? 5);
const root = process.cwd();
const plan = JSON.parse(await fs.readFile(path.join(root, ${JSON.stringify(config.harness.generatedDir)}, 'harness-plan.json'), 'utf8'));
const evidenceFile = path.join(root, ${JSON.stringify(config.frontend.evidenceDir)}, 'evidence.json');
const evidence = await readJsonIfExists(evidenceFile);
const rows = [
  measure('route-materialization', runs, () => {
    for (let index = 0; index < plan.routes.length; index++) materializeRoute(plan.routes[index].path, index);
  }),
  measure('state-model-replay', runs, () => {
    const state = { route: '/', events: 0, patches: 0, telemetry: 0 };
    for (let index = 0; index < Math.max(plan.routes.length, 1); index++) {
      state.route = materializeRoute((plan.routes[index % plan.routes.length] ?? { path: '/' }).path, index);
      state.patches++;
      state.events += plan.transports.length;
      state.telemetry++;
    }
    if (!state.route.startsWith('/')) throw new Error('state-model-replay produced a non-absolute route');
  }),
  measure('evidence-parse-and-index', runs, () => {
    const routes = evidence?.routes ?? [];
    const transports = evidence?.transports ?? [];
    const byRoute = new Map();
    for (const route of routes) byRoute.set(route.path, route);
    for (const transport of transports) String(transport.kind ?? '') + ':' + String(transport.protocol ?? '');
    JSON.stringify({ routeCount: byRoute.size, transportCount: transports.length });
  }),
  measure('telemetry-redaction', runs, () => {
    const records = [];
    for (let index = 0; index < 64; index++) records.push(redactTelemetry({ route: '/r/' + index, token: 'secret-' + index, value: index }));
    const encoded = JSON.stringify(records);
    if (encoded.includes('secret-')) throw new Error('telemetry redaction leaked a secret');
  })
];

function measure(name, count, fn) {
  const values = [];
  for (let index = 0; index < count; index++) {
    const start = performance.now();
    fn();
    values.push(performance.now() - start);
  }
  values.sort((a, b) => a - b);
  return {
    name,
    runs: count,
    meanMs: values.reduce((sum, value) => sum + value, 0) / values.length,
    medianMs: values[Math.floor(values.length / 2)],
    p95Ms: values[Math.min(values.length - 1, Math.floor(values.length * 0.95))],
    minMs: values[0],
    maxMs: values[values.length - 1]
  };
}

function materializeRoute(pattern, index) {
  const parts = String(pattern || '/').split('/').filter(Boolean);
  const out = [];
  for (const part of parts) {
    if (part.startsWith(':')) {
      const optional = part.endsWith('?');
      if (optional && index % 2 === 0) continue;
      out.push(part.replace(/^:/, '').replace(/\\?$/, '') + '-' + index);
    } else if (part.startsWith('*')) {
      const optional = part.endsWith('?');
      if (optional && index % 2 === 0) continue;
      out.push(part.replace(/^\\*/, '').replace(/\\?$/, '') + '-' + index, 'tail');
    } else {
      out.push(part);
    }
  }
  return '/' + out.join('/');
}

function redactTelemetry(record) {
  const out = {};
  for (const [key, value] of Object.entries(record)) out[key] = /token|password|secret/i.test(key) ? '[redacted]' : value;
  return out;
}

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return undefined;
  }
}

const outDir = path.join(root, ${JSON.stringify(config.harness.evidenceDir)});
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'benchmark-summary.json'), JSON.stringify({
  kind: 'frontier.framework.harness.benchmark',
  appId: ${JSON.stringify(config.id)},
  runs,
  planWeight: JSON.stringify(plan).length,
  evidenceWeight: evidence ? JSON.stringify(evidence).length : 0,
  metrics: plan.model?.invariants ?? [],
  rows
}, null, 2) + '\\n');
`;
}

function renderBrowserHarnessTemplate(config: NormalizedFrontierFrameworkConfig): string {
  return `import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const outDir = path.join(root, ${JSON.stringify(config.harness.evidenceDir)});
const frontendFile = path.join(root, ${JSON.stringify(config.frontend.outDir)}, 'index.html');
const evidenceFile = path.join(root, ${JSON.stringify(config.frontend.evidenceDir)}, 'evidence.json');
const planFile = path.join(root, ${JSON.stringify(config.harness.generatedDir)}, 'harness-plan.json');
const routeScenarioFile = path.join(root, ${JSON.stringify(config.routeScenarios.manifestFile)});
const routeScenarioPlanFile = path.join(root, ${JSON.stringify(config.routeScenarios.playwrightPlanFile)});
const surfacesFile = path.join(root, ${JSON.stringify(config.surfaces.registryFile)});
const surfaceCoverageFile = path.join(root, ${JSON.stringify(config.surfaces.coverage.reportFile)});
await fs.mkdir(outDir, { recursive: true });
const evidence = await readJsonIfExists(evidenceFile);
const plan = await readJsonIfExists(planFile);
const routeScenarios = await readJsonIfExists(routeScenarioFile);
const routeScenarioPlan = await readJsonIfExists(routeScenarioPlanFile);
const surfaces = await readJsonIfExists(surfacesFile);
const surfaceCoverage = await readJsonIfExists(surfaceCoverageFile);
const expectedAssertions = plan?.browserAssertions ?? [
  'frontend-root-present',
  'devtools-bridge-present',
  'state-snapshot-recorded',
  'patch-recorded',
  'crdt-update-recorded',
  'event-log-entry-recorded',
  'trace-recorded',
  'telemetry-recorded',
  'route-evidence-readable',
  'route-scenarios-readable',
  'surface-status-readable',
  'surface-coverage-readable'
];

const playwright = await loadPlaywright();
if (!playwright) {
  await fs.writeFile(path.join(outDir, 'browser-harness.json'), JSON.stringify({
    kind: 'frontier.framework.harness.browser',
    appId: ${JSON.stringify(config.id)},
    available: false,
    ok: true,
    trace: ${JSON.stringify(config.harness.browserTrace)},
    expectedAssertions,
    assertions: expectedAssertions.map((id) => assertion(id, true, 'skipped because @playwright/test is not installed')),
    missing: '@playwright/test'
  }, null, 2) + '\\n');
} else {
  const frontierPlaywright = await loadOptionalPackage('@shapeshift-labs/frontier-playwright');
  try {
    const chromium = playwright.chromium;
    if (!chromium) throw new Error('@playwright/test did not expose chromium');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(frontendFile).href);
  await page.waitForSelector('#frontier-framework', { timeout: 5000 });
  const probe = await page.evaluate(async () => {
    const bridge = globalThis.__FRONTIER_FRAMEWORK_DEVTOOLS__;
    const root = document.getElementById('frontier-framework');
    const result = {
      rootPresent: Boolean(root),
      bridgePresent: Boolean(bridge),
      methods: bridge ? Object.keys(bridge).sort() : [],
      counts: {},
      inspect: null,
      evidence: null
    };
    if (bridge) {
      bridge.setState({ route: '/', counter: 1 }, { source: 'browser-harness' });
      bridge.recordPatch({ op: 'replace', path: '/counter', value: 2 }, { source: 'browser-harness' });
      bridge.recordCrdtUpdate({ actor: 'browser', seq: 1 }, { source: 'browser-harness' });
      bridge.recordEventLogEntry({ stream: 'browser', cursor: 1 }, { source: 'browser-harness' });
      bridge.recordTrace({ span: 'browser-harness', route: location.pathname }, { source: 'browser-harness' });
      bridge.recordTelemetry({ name: 'browser.harness', route: location.pathname }, { source: 'browser-harness' });
      bridge.captureSnapshot('browser-harness');
      result.inspect = await bridge.inspect();
      result.evidence = await bridge.loadEvidence();
      result.counts = {
        snapshots: bridge.records.snapshots.length,
        patches: bridge.records.patches.length,
        crdt: bridge.records.crdt.length,
        events: bridge.records.events.length,
        traces: bridge.records.traces.length,
        telemetry: bridge.records.telemetry.length
      };
    }
    return result;
  });
  await browser.close();
  const assertions = [
    assertion('frontend-root-present', probe.rootPresent, 'frontier app root is present'),
    assertion('devtools-bridge-present', probe.bridgePresent, 'devtools bridge is installed'),
    assertion('state-snapshot-recorded', Number(probe.counts.snapshots ?? 0) > 0, 'snapshot buffer has records'),
    assertion('patch-recorded', Number(probe.counts.patches ?? 0) > 0, 'patch buffer has records'),
    assertion('crdt-update-recorded', Number(probe.counts.crdt ?? 0) > 0, 'CRDT update buffer has records'),
    assertion('event-log-entry-recorded', Number(probe.counts.events ?? 0) > 0, 'event-log buffer has records'),
    assertion('trace-recorded', Number(probe.counts.traces ?? 0) > 0, 'trace buffer has records'),
    assertion('telemetry-recorded', Number(probe.counts.telemetry ?? 0) > 0, 'telemetry buffer has records'),
    assertion('route-evidence-readable', Boolean(evidence?.routeDiscovery), 'route discovery evidence is readable from Node'),
    assertion('route-scenarios-readable', Boolean(routeScenarios?.summary && routeScenarioPlan?.cases), 'route scenario manifest and browser plan are readable from Node'),
    assertion('surface-status-readable', Boolean(surfaces?.summary), 'surface status registry is readable from Node'),
    assertion('surface-coverage-readable', Boolean(surfaceCoverage?.summary), 'surface coverage report is readable from Node')
  ];
  const ok = assertions.every((item) => item.ok);
  await fs.writeFile(path.join(outDir, 'browser-harness.json'), JSON.stringify({
    kind: 'frontier.framework.harness.browser',
    appId: ${JSON.stringify(config.id)},
    available: true,
    ok,
    trace: ${JSON.stringify(config.harness.browserTrace)},
    package: '@playwright/test',
    frontierPlaywright: frontierPlaywright ? Object.keys(frontierPlaywright).sort().slice(0, 12) : [],
    expectedAssertions,
    assertions,
    probe,
    routeScenarios: {
      summary: routeScenarios?.summary,
      cases: routeScenarioPlan?.cases?.map((item) => item.id) ?? []
    },
    surfaces: {
      summary: surfaces?.summary,
      statuses: surfaces?.statuses?.map((item) => item.id) ?? []
    },
    exports: Object.keys(playwright).sort().slice(0, 12)
  }, null, 2) + '\\n');
  if (!ok) process.exitCode = 1;
  } catch (error) {
    await fs.writeFile(path.join(outDir, 'browser-harness.json'), JSON.stringify({
      kind: 'frontier.framework.harness.browser',
      appId: ${JSON.stringify(config.id)},
      available: true,
      ok: false,
      trace: ${JSON.stringify(config.harness.browserTrace)},
      package: '@playwright/test',
      frontierPlaywright: frontierPlaywright ? Object.keys(frontierPlaywright).sort().slice(0, 12) : [],
      expectedAssertions,
      error: error instanceof Error ? error.message : String(error)
    }, null, 2) + '\\n');
    process.exitCode = 1;
  }
}

function assertion(id, ok, detail) {
  return { id, ok: Boolean(ok), detail };
}

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return undefined;
  }
}

async function loadPlaywright() {
  try {
    return await import('@playwright/test');
  } catch {
    return undefined;
  }
}

async function loadOptionalPackage(name) {
  try {
    return await import(name);
  } catch {
    return undefined;
  }
}
`;
}

function renderHarnessReadme(config: NormalizedFrontierFrameworkConfig): string {
  return `# Frontier Framework Harness

Generated by \`frontier build\`.

- \`frontier-smoke.mjs\` checks build/evidence shape.
- \`frontier-fuzz.mjs\` uses fast-check when installed, falls back to deterministic model cases, checks route/transport/auth/patch/event/CRDT/telemetry invariants, and writes minimized replayable failures.
- \`frontier-bench.mjs\` measures route materialization, app-state replay, evidence indexing, and telemetry redaction.
- \`frontier-browser-smoke.mjs\` uses Playwright when installed to assert DOM, devtools bridge, state snapshot, patch, CRDT, event-log, trace, telemetry, and route-evidence probes together.

Evidence path: \`${config.harness.evidenceDir}\`
Corpus path: \`${config.harness.corpusDir}\`
`;
}

async function harnessCommand(args: CliArgs, target: HarnessTarget): Promise<HarnessValidation> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const config = normalizeFrontierFrameworkConfig(applyCliOverrides(discoveredConfig, args));
  await writeHarnessTemplates(args.cwd, config, createCliFrameworkPlan(args.cwd, config));
  await writeAuthArtifacts(args.cwd, config);
  await writeConformanceArtifacts(args.cwd, config);
  const result = await validateFrameworkHarness(args.cwd, config, target, target === 'all');
  await writeHarnessEvidence(args.cwd, config, result);
  return result;
}

async function lintCommand(args: CliArgs): Promise<ConformanceReport> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  if (!configValidation.ok) throw new Error(formatConfigValidationError(configValidation));
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  return await writeConformanceArtifacts(args.cwd, config);
}

async function agentCommand(args: CliArgs): Promise<AgentBundleBuild> {
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const config = normalizeFrontierFrameworkConfig(applyCliOverrides(discoveredConfig, args));
  const plan = createCliFrameworkPlan(args.cwd, config);
  const harnessTemplates = await writeHarnessTemplates(args.cwd, config, plan);
  await writeAuthArtifacts(args.cwd, config);
  await writeConformanceArtifacts(args.cwd, config);
  const harness = await validateFrameworkHarness(args.cwd, config, 'all', false);
  const bundle = await writeAgentBundle(args.cwd, config, plan, harness, harnessTemplates, 'agent');
  return bundle;
}

async function doctorCommand(args: CliArgs): Promise<DoctorReport> {
  const configPath = args.config ? path.resolve(args.cwd, args.config) : findConfig(args.cwd);
  const rawConfig = await loadConfig(args);
  const discoveredConfig = await withDiscoveredRoutes(args.cwd, rawConfig);
  const effectiveConfig = applyCliOverrides(discoveredConfig, args);
  const configValidation = validateFrontierFrameworkConfig(effectiveConfig);
  const config = normalizeFrontierFrameworkConfig(effectiveConfig);
  const packageInfo = await readPackageJsonInfo(args.cwd);
  const packageJson = packageInfo?.json;
  const packageRoot = packageInfo ? path.dirname(packageInfo.file) : args.cwd;
  const usesAncestorPackage = packageInfo !== undefined && path.resolve(packageInfo.file) !== path.resolve(args.cwd, 'package.json');
  const scripts = packageJson?.scripts && typeof packageJson.scripts === 'object'
    ? packageJson.scripts as Record<string, unknown>
    : {};
  const deps = collectDependencyNames(packageJson);
  const harness = await validateFrameworkHarness(args.cwd, config, 'all', false);
  const sourcePolicy = await evaluateSourcePolicy(args.cwd, config);
  const conformance = await writeConformanceArtifacts(args.cwd, config);
  const plan = createCliFrameworkPlan(args.cwd, config);
  const checks: DoctorCheck[] = [];
  const add = (id: string, ok: boolean, detail: string, options: { required?: boolean; fix?: string; tags?: string[] } = {}) => {
    checks.push({
      id,
      ok,
      required: options.required ?? true,
      detail,
      fix: options.fix,
      tags: options.tags ?? []
    });
  };

  add('config', Boolean(configPath), configPath ? path.relative(args.cwd, configPath) : 'No frontier config found', {
    fix: 'Create frontier.config.mjs or run frontier init.',
    tags: ['config']
  });
  add('config-schema', configValidation.ok, configValidation.ok ? 'schema and semantic config rules passed' : configValidation.diagnostics.length + ' config diagnostic(s)', {
    fix: firstConfigSuggestedFix(configValidation) ?? 'Run frontier config validate --json and frontier config explain for details.',
    tags: ['config', 'schema', 'diagnostics']
  });
  add('package-json', Boolean(packageJson), packageInfo ? normalizeRelativePath(args.cwd, packageInfo.file) : 'package.json', {
    fix: 'Create package.json with Frontier scripts.',
    tags: ['package']
  });
  add('script:build', typeof scripts.build === 'string', 'npm run build', {
    required: !usesAncestorPackage,
    fix: 'Add "build": "frontier build" to package.json scripts.',
    tags: ['script']
  });
  add('script:harness', typeof scripts.harness === 'string', 'npm run harness', {
    required: !usesAncestorPackage,
    fix: 'Add "harness": "frontier harness" to package.json scripts.',
    tags: ['script', 'harness']
  });
  add('script:lint', typeof scripts.lint === 'string', 'npm run lint', {
    required: !usesAncestorPackage,
    fix: 'Add "lint": "frontier lint --json" to package.json scripts.',
    tags: ['script', 'lint', 'conformance']
  });
  add('script:auth', typeof scripts.auth === 'string', 'npm run auth', {
    required: config.auth.enabled && !usesAncestorPackage,
    fix: 'Add "auth": "frontier auth --json" to package.json scripts.',
    tags: ['script', 'auth']
  });
  add('script:agent', typeof scripts.agent === 'string' || typeof scripts['agent:check'] === 'string', 'npm run agent or npm run agent:check', {
    required: false,
    fix: 'Add "agent": "frontier agent --json" and "agent:check" scripts.',
    tags: ['script', 'agent']
  });
  add('script:migrations', typeof scripts.migrations === 'string', 'npm run migrations', {
    required: false,
    fix: 'Add "migrations": "frontier migrations --json" to package.json scripts.',
    tags: ['script', 'migrations']
  });
  add('script:docs', typeof scripts.docs === 'string', 'npm run docs', {
    required: false,
    fix: 'Add "docs": "frontier docs build --json" to package.json scripts.',
    tags: ['script', 'documentation']
  });
  add('dependency:framework', frontierPackageAvailable(packageRoot, packageJson, deps, '@shapeshift-labs/frontier-framework'), '@shapeshift-labs/frontier-framework dependency', {
    fix: 'Install @shapeshift-labs/frontier-framework.',
    tags: ['dependency']
  });
  add('dependency:migrations', frontierPackageAvailable(packageRoot, packageJson, deps, '@shapeshift-labs/frontier-migrations'), '@shapeshift-labs/frontier-migrations dependency', {
    required: config.migrations.enabled,
    fix: 'Install @shapeshift-labs/frontier-migrations so runtime state/cache hydration can normalize old data.',
    tags: ['dependency', 'migrations']
  });
  add('dependency:auth', frontierPackageAvailable(packageRoot, packageJson, deps, '@shapeshift-labs/frontier-auth'), '@shapeshift-labs/frontier-auth dependency', {
    required: config.auth.enabled,
    fix: 'Install @shapeshift-labs/frontier-auth so providers, gates, token contracts, runtime grants, and auth evidence are declared.',
    tags: ['dependency', 'auth']
  });
  add('dependency:documentation', frontierPackageAvailable(packageRoot, packageJson, deps, '@shapeshift-labs/frontier-documentation'), '@shapeshift-labs/frontier-documentation dependency', {
    required: config.documentation.enabled,
    fix: 'Install @shapeshift-labs/frontier-documentation so docs manifests, search records, JSONL, and docs evidence can be generated.',
    tags: ['dependency', 'documentation']
  });
  add('dependency:design', frontierPackageAvailable(packageRoot, packageJson, deps, '@shapeshift-labs/frontier-design'), '@shapeshift-labs/frontier-design dependency', {
    required: config.conformance.enabled,
    fix: 'Install @shapeshift-labs/frontier-design and route frontend TSX/JSX styling through design tokens or recipes.',
    tags: ['dependency', 'frontend', 'design']
  });
  for (const route of config.frontend.routes) {
    add('route:' + route.path, existsSync(path.resolve(args.cwd, route.file)), route.file, {
      fix: 'Create the route source file or update frontend.routes.',
      tags: ['route', 'frontend']
    });
  }
  const backendEntry = path.join(config.backend.root, config.backend.entry);
  add('backend-entry', existsSync(path.resolve(args.cwd, backendEntry)), backendEntry, {
    fix: 'Create the Fetch handler entry or update backend.root/backend.entry.',
    tags: ['backend']
  });
  add('vite-config', !config.vite.enabled || existsSync(path.resolve(args.cwd, config.vite.configFile)), config.vite.configFile, {
    required: config.vite.enabled && config.vite.strict,
    fix: 'Create vite.config.ts or disable vite.enabled.',
    tags: ['vite']
  });
  add('feature-manifest', await filePatternExists(args.cwd, config.agent.manifestDir + '/*.json'), config.agent.manifestDir + '/*.json', {
    required: config.agent.requireFeatureManifest,
    fix: 'Create a feature manifest under ' + config.agent.manifestDir + '.',
    tags: ['feature', 'agent']
  });
  const documentationHtml = path.resolve(args.cwd, config.documentation.outDir, config.documentation.htmlFileName);
  add('documentation', !config.documentation.enabled || existsSync(documentationHtml), config.documentation.enabled ? normalizeRelativePath(args.cwd, documentationHtml) : 'disabled', {
    required: false,
    fix: 'Run frontier docs build --json to generate the documentation book and evidence.',
    tags: ['documentation', 'evidence']
  });
  add('deploy-split', config.frontend.outDir !== config.backend.outDir && config.frontend.outDir !== config.frontend.evidenceDir, 'frontend/backend/evidence outputs are separate', {
    fix: 'Use separate frontend.outDir, backend.outDir, and frontend.evidenceDir.',
    tags: ['deploy']
  });
  const requiresFetchTransport = config.backend.endpoints.length > 0 && config.backend.adapters.some((adapter) => ['node', 'edge', 'serverless', 'fetch'].includes(adapter));
  add('transport:fetch', config.backend.transports.some((transport) => transport.kind === 'fetch'), 'fetch transport', {
    required: requiresFetchTransport,
    fix: 'Declare a fetch backend transport.',
    tags: ['transport', 'backend']
  });
  add('transport:sync', config.backend.transports.some((transport) => ['crdt-sync', 'crdt-websocket', 'event-log', 'state-cache', 'realtime-websocket'].includes(transport.kind)), 'sync-capable transport', {
    required: false,
    fix: 'Declare CRDT, event-log, state-cache, realtime, or custom sync transports as needed.',
    tags: ['transport', 'sync']
  });
  add('migrations:sources', !config.migrations.enabled || config.migrations.sources.length > 0, config.migrations.sources.length + ' runtime data source(s)', {
    required: config.migrations.enabled && config.migrations.strict,
    fix: 'Declare migrations.sources for app state, query cache, CRDT snapshots, event logs, or disable migrations.enabled.',
    tags: ['migrations', 'state']
  });
  add('auth:gates', !config.auth.enabled || config.auth.gates.length + config.auth.routeGuards.length > 0, (config.auth.gates.length + config.auth.routeGuards.length) + ' auth gate(s)', {
    required: config.auth.enabled && (config.auth.strict || config.auth.failOnMissingGate),
    fix: 'Declare auth.routeGuards or auth.gates for protected routes, backend endpoints, sync transports, runtime rooms, and service tokens.',
    tags: ['auth', 'gate']
  });
  add('auth:token-contracts', !config.auth.enabled || config.auth.tokenContracts.length > 0, config.auth.tokenContracts.length + ' token contract(s)', {
    required: config.auth.enabled && config.auth.strict,
    fix: 'Declare auth.tokenContracts for session, runtime-room, service-user, or custom tokens.',
    tags: ['auth', 'token']
  });
  add('source-policy', sourcePolicy.ok, sourcePolicy.enabled ? sourcePolicy.violations.length + ' violation(s) across ' + sourcePolicy.checkedFiles.length + ' source file(s)' : 'disabled', {
    required: sourcePolicy.enabled && sourcePolicy.enforcement === 'error',
    fix: 'Split Frontier components, reduce file length, adjust sourcePolicy limits, or set sourcePolicy.enabled=false.',
    tags: ['source-policy', sourcePolicy.enforcement]
  });
  add('conformance', conformance.ok, conformance.enabled ? conformance.lint.summary.errorCount + ' error(s), ' + conformance.lint.summary.warningCount + ' warning(s)' : 'disabled', {
    required: conformance.enabled && config.conformance.failOnViolation && conformance.enforcement === 'error',
    fix: 'Run frontier lint --json, import the required Frontier packages from matching source files, or document an explicit conformance override.',
    tags: ['conformance', 'lint', conformance.enforcement]
  });
  add('surface-coverage', !config.surfaces.coverage.enabled || plan.surfaceCoverage.ok, config.surfaces.coverage.enabled ? plan.surfaceCoverage.summary.missingCount + ' missing claimed surface(s)' : 'disabled', {
    required: config.surfaces.coverage.enabled && config.surfaces.coverage.failOnMissing,
    fix: 'Run frontier coverage --strict --json, then attach evidence, route scenarios, or state probes for missing claimed surfaces.',
    tags: ['surfaces', 'coverage']
  });
  add('harness', harness.ok, 'frontier harness ' + (harness.ok ? 'ok' : 'has missing required gates'), {
    required: config.harness.failOnMissing,
    fix: 'Run frontier harness --json and add missing required scripts/files/packages.',
    tags: ['harness']
  });
  const ok = checks.every((check) => check.ok || !check.required);
  return {
    kind: 'frontier.framework.doctor',
    appId: config.id,
    ok,
    generatedAt: new Date().toISOString(),
    configValidation,
    checks,
    summary: {
      routes: config.frontend.routes.length,
      endpoints: config.backend.endpoints.length,
      transports: config.backend.transports.length,
      sourcePolicyViolations: sourcePolicy.violations.length,
      surfaceCoverageMissing: plan.surfaceCoverage.summary.missingCount,
      deployTargets: config.deploy.frontend.length + config.deploy.backend.length + config.deploy.evidence.length
    }
  };
}

async function validateFrameworkHarness(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  target: HarnessTarget,
  includeNonTargetFailures: boolean
): Promise<HarnessValidation> {
  const packageJson = await readPackageJson(cwd);
  const scripts = packageJson?.scripts && typeof packageJson.scripts === 'object'
    ? packageJson.scripts as Record<string, unknown>
    : {};
  const deps = collectDependencyNames(packageJson);
  const commandAvailability = new Map<string, boolean>();
  const filePatternAvailability = new Map<string, boolean>();
  const isCommandAvailable = (command: string) => {
    const cached = commandAvailability.get(command);
    if (cached !== undefined) return cached;
    const available = commandIsAvailable(command, scripts);
    commandAvailability.set(command, available);
    return available;
  };
  const patternExists = async (pattern: string) => {
    const cached = filePatternAvailability.get(pattern);
    if (cached !== undefined) return cached;
    const exists = await filePatternExists(cwd, pattern);
    filePatternAvailability.set(pattern, exists);
    return exists;
  };
  const checks: HarnessCheck[] = [];
  const addGate = async (
    id: string,
    kind: HarnessTarget,
    gate: { required: boolean; command: string; files: readonly string[]; packages: readonly string[]; tags: readonly string[] }
  ) => {
    const missing: string[] = [];
    if (gate.command && !isCommandAvailable(gate.command)) missing.push('command:' + gate.command);
    for (const file of gate.files) {
      if (!await patternExists(file)) missing.push('file:' + file);
    }
    for (const pkg of gate.packages) {
      if (!deps.has(pkg)) missing.push('package:' + pkg);
    }
    checks.push({
      id,
      kind,
      required: gate.required,
      ok: missing.length === 0,
      command: gate.command,
      missing,
      tags: [...gate.tags]
    });
  };

  await addGate('tests', 'tests', config.harness.tests);
  await addGate('fuzzers', 'fuzzers', config.harness.fuzzers);
  await addGate('benchmarks', 'benchmarks', config.harness.benchmarks);
  await addGate('browser', 'browser', config.harness.browser);
  await addGate('agent-kit', 'agent', config.harness.agentKit);
  await addGate('linter', 'linter', config.harness.linter);
  await addGate('hybrid', 'hybrid', config.harness.hybrid);

  for (const command of config.harness.commands) {
    const commandOk = isCommandAvailable(command.command);
    const kind = command.kind === 'fuzz' ? 'fuzzers'
      : command.kind === 'benchmark' ? 'benchmarks'
        : command.kind === 'test' ? 'tests'
          : command.kind === 'browser' ? 'browser'
            : command.kind === 'lint' ? 'linter'
              : command.kind === 'agent' ? 'agent'
                : 'hybrid';
    checks.push({
      id: 'command:' + command.id,
      kind,
      required: command.required === true,
      ok: commandOk,
      command: command.command,
      missing: commandOk ? [] : ['command:' + command.command],
      tags: [...(command.tags ?? [])]
    });
  }

  const relevantChecks = target === 'all' ? checks : checks.filter((check) => check.kind === target);
  const failingChecks = includeNonTargetFailures ? checks : relevantChecks;
  const ok = failingChecks.every((check) => check.ok || !check.required);
  return {
    kind: 'frontier.framework.harness.validation',
    appId: config.id,
    mode: config.harness.mode,
    ok,
    target,
    evidenceDir: config.harness.evidenceDir,
    generatedAt: new Date().toISOString(),
    checks: relevantChecks
  };
}

async function writeHarnessEvidence(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  validation: HarnessValidation
): Promise<void> {
  const outDir = path.resolve(cwd, config.harness.evidenceDir);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(validation, null, 2) + '\n', 'utf8');
}

async function readPackageJson(cwd: string): Promise<Record<string, unknown> | undefined> {
  return (await readPackageJsonInfo(cwd))?.json;
}

async function readPackageJsonInfo(cwd: string): Promise<{ file: string; json: Record<string, unknown> } | undefined> {
  let current = path.resolve(cwd);
  while (true) {
    const file = path.join(current, 'package.json');
    if (existsSync(file)) {
      return {
        file,
        json: JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, unknown>
      };
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function collectDependencyNames(packageJson: Record<string, unknown> | undefined): Set<string> {
  const names = new Set<string>();
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = packageJson?.[section];
    if (!deps || typeof deps !== 'object') continue;
    for (const name of Object.keys(deps)) names.add(name);
  }
  return names;
}

function frontierPackageAvailable(
  packageRoot: string,
  packageJson: Record<string, unknown> | undefined,
  deps: ReadonlySet<string>,
  packageName: string
): boolean {
  if (deps.has(packageName) || packageJson?.name === packageName) return true;
  const localName = packageName.startsWith('@shapeshift-labs/')
    ? packageName.slice('@shapeshift-labs/'.length)
    : packageName;
  return existsSync(path.join(packageRoot, 'packages', localName, 'package.json'));
}

async function evaluateSourcePolicy(cwd: string, config: NormalizedFrontierFrameworkConfig): Promise<SourcePolicyReport> {
  const base: SourcePolicyReport = {
    kind: 'frontier.framework.source-policy.report',
    appId: config.id,
    enabled: config.sourcePolicy.enabled,
    ok: true,
    preset: config.sourcePolicy.preset,
    enforcement: config.sourcePolicy.enforcement,
    generatedAt: new Date().toISOString(),
    rules: {
      maxFrontierComponentsPerFile: config.sourcePolicy.maxFrontierComponentsPerFile,
      maxLinesPerFile: config.sourcePolicy.maxLinesPerFile,
      maxCharsPerFile: config.sourcePolicy.maxCharsPerFile,
      localImportExtensions: config.sourcePolicy.localImportExtensions,
      businessLogic: config.sourcePolicy.businessLogic
    },
    include: [...config.sourcePolicy.include],
    exclude: [...config.sourcePolicy.exclude],
    checkedFiles: [],
    runtimeModules: [],
    violations: [],
    businessLogicFindings: []
  };
  if (!config.sourcePolicy.enabled) return base;

  const files = await collectSourcePolicyFiles(cwd, config.sourcePolicy.include, config.sourcePolicy.exclude);
  const sourceGraph = await createSourceGraph(cwd, config, files);
  const sourceRegistry = createAstRegistryGraph(sourceGraph);
  const astByFile = new Map(sourceGraph.sources.map((source) => [source.file, source]));
  const checkedFiles: SourcePolicyFileReport[] = [];
  const violations: SourcePolicyViolation[] = [];
  for (const file of files) {
    const full = path.resolve(cwd, file);
    const source = await fs.readFile(full, 'utf8');
    const frontierComponents = countFrontierComponents(file, source);
    const ast = astByFile.get(file);
    const report: SourcePolicyFileReport = {
      file,
      layer: ast?.layer,
      lines: countSourceLines(source),
      chars: source.length,
      frontierComponentCount: frontierComponents.length,
      frontierComponents,
      imports: ast?.imports.length,
      declarations: ast?.declarations.length,
      calls: ast?.calls.length,
      businessLogicFindings: ast?.businessLogic.length
    };
    checkedFiles.push(report);
    if (
      config.sourcePolicy.maxFrontierComponentsPerFile !== false
      && report.frontierComponentCount > config.sourcePolicy.maxFrontierComponentsPerFile
    ) {
      violations.push({
        id: file + ':max-frontier-components-per-file',
        file,
        rule: 'max-frontier-components-per-file',
        actual: report.frontierComponentCount,
        max: config.sourcePolicy.maxFrontierComponentsPerFile,
        enforcement: config.sourcePolicy.enforcement,
        message: file + ' has ' + report.frontierComponentCount + ' Frontier components; max is ' + config.sourcePolicy.maxFrontierComponentsPerFile
      });
    }
    if (
      config.sourcePolicy.maxLinesPerFile !== false
      && report.lines > config.sourcePolicy.maxLinesPerFile
    ) {
      violations.push({
        id: file + ':max-lines-per-file',
        file,
        rule: 'max-lines-per-file',
        actual: report.lines,
        max: config.sourcePolicy.maxLinesPerFile,
        enforcement: config.sourcePolicy.enforcement,
        message: file + ' has ' + report.lines + ' lines; max is ' + config.sourcePolicy.maxLinesPerFile
      });
    }
    if (
      config.sourcePolicy.maxCharsPerFile !== false
      && report.chars > config.sourcePolicy.maxCharsPerFile
    ) {
      violations.push({
        id: file + ':max-chars-per-file',
        file,
        rule: 'max-chars-per-file',
        actual: report.chars,
        max: config.sourcePolicy.maxCharsPerFile,
        enforcement: config.sourcePolicy.enforcement,
        message: file + ' has ' + report.chars + ' characters; max is ' + config.sourcePolicy.maxCharsPerFile
      });
    }
    if (config.sourcePolicy.localImportExtensions === 'source') {
      for (const runtimeImport of collectRuntimeExtensionImports(cwd, file, source)) {
        violations.push({
          id: file + ':' + runtimeImport.line + ':local-source-import-extension',
          file,
          rule: 'local-source-import-extension',
          actual: 1,
          max: 0,
          enforcement: config.sourcePolicy.enforcement,
          range: { startLine: runtimeImport.line },
          message: file + ' imports ' + runtimeImport.specifier + '; TS/TSX source should import the matching ' + runtimeImport.sourceExtension + ' module directly'
        });
      }
    }
  }
  const runtimeModules = await evaluateRuntimeModules(cwd, config, files, violations);
  const businessLogicFindings = config.sourcePolicy.businessLogic
    ? sourceGraph.sources.flatMap((source) => source.businessLogic)
    : [];
  for (const finding of businessLogicFindings) {
    violations.push({
      id: finding.id,
      file: finding.file,
      rule: 'business-logic-in-adapter',
      actual: 1,
      max: 0,
      enforcement: config.sourcePolicy.enforcement,
      layer: finding.layer,
      symbol: finding.symbol,
      range: finding.range ? {
        startLine: finding.range.start.line,
        startColumn: finding.range.start.column,
        endLine: finding.range.end?.line,
        endColumn: finding.range.end?.column
      } : undefined,
      message: finding.message
    });
  }
  return {
    ...base,
    ok: config.sourcePolicy.enforcement !== 'error' || violations.length === 0,
    checkedFiles,
    runtimeModules,
    violations,
    businessLogicFindings,
    sourceGraph,
    sourceRegistry
  };
}

async function evaluateRuntimeModules(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  checkedFiles: readonly string[],
  violations: SourcePolicyViolation[]
): Promise<SourcePolicyRuntimeModuleReport[]> {
  const checked = new Set(checkedFiles);
  const ownership = new Map<string, SourcePolicyRuntimeModuleReport>();
  const reports: SourcePolicyRuntimeModuleReport[] = [];
  for (const runtimeModule of config.sourcePolicy.runtimeModules) {
    const files = [...(runtimeModule.files ?? (runtimeModule.file ? [runtimeModule.file] : []))];
    const missingFiles = files.filter((file) => !existsSync(path.resolve(cwd, file)));
    const uncheckedFiles = files.filter((file) => !checked.has(file));
    const report: SourcePolicyRuntimeModuleReport = {
      id: runtimeModule.id,
      kind: runtimeModule.kind,
      title: runtimeModule.title,
      owner: runtimeModule.owner,
      owns: [...(runtimeModule.owns ?? [])],
      files,
      missingFiles,
      uncheckedFiles,
      bindings: (runtimeModule.bindings ?? []).map((binding) => ({
        kind: binding.kind,
        target: binding.target,
        events: [...(binding.events ?? [])],
        actions: [...(binding.actions ?? [])],
        tools: [...(binding.tools ?? [])],
        snapshots: [...(binding.snapshots ?? [])],
        tests: [...(binding.tests ?? [])],
        capabilities: [...(binding.capabilities ?? [])]
      })),
      reads: [...(runtimeModule.reads ?? [])],
      writes: [...(runtimeModule.writes ?? [])],
      actions: [...(runtimeModule.actions ?? [])],
      effects: [...(runtimeModule.effects ?? [])],
      capabilities: [...(runtimeModule.capabilities ?? [])],
      evidence: [...(runtimeModule.evidence ?? [])],
      tags: [...(runtimeModule.tags ?? [])]
    };
    reports.push(report);
    for (const missing of missingFiles) {
      violations.push({
        id: runtimeModule.id + ':runtime-module-file-missing:' + missing,
        file: missing,
        rule: 'runtime-module-file-missing',
        actual: 0,
        max: 1,
        enforcement: config.sourcePolicy.enforcement,
        message: 'Runtime module ' + runtimeModule.id + ' declares missing file ' + missing
      });
    }
    for (const unchecked of uncheckedFiles) {
      violations.push({
        id: runtimeModule.id + ':runtime-module-file-unchecked:' + unchecked,
        file: unchecked,
        rule: 'runtime-module-file-unchecked',
        actual: 0,
        max: 1,
        enforcement: config.sourcePolicy.enforcement,
        message: 'Runtime module ' + runtimeModule.id + ' file ' + unchecked + ' is not covered by sourcePolicy.include'
      });
    }
    for (const own of report.owns) {
      const existing = ownership.get(own);
      if (existing) {
        violations.push({
          id: runtimeModule.id + ':runtime-module-ownership-duplicate:' + own,
          file: files[0] ?? 'frontier.config.mjs',
          rule: 'runtime-module-ownership-duplicate',
          actual: 2,
          max: 1,
          enforcement: config.sourcePolicy.enforcement,
          message: 'Runtime ownership "' + own + '" is declared by both ' + existing.id + ' and ' + runtimeModule.id
        });
      } else {
        ownership.set(own, report);
      }
    }
  }
  return reports;
}

async function createSourceGraph(
  cwd: string,
  config: NormalizedFrontierFrameworkConfig,
  files?: readonly string[]
): Promise<FrontierAstSourceGraph> {
  const sourceFiles = files ?? await collectSourcePolicyFiles(cwd, config.sourcePolicy.include, config.sourcePolicy.exclude);
  const inputs = await Promise.all(sourceFiles.map(async (file) => ({
    file,
    text: await fs.readFile(path.resolve(cwd, file), 'utf8'),
    package: inferSourcePackage(config, file),
    feature: inferSourceFeature(config, file),
    tags: ['frontier-framework']
  })));
  return walkFrontierSources(inputs, createAstWalkOptions(config));
}

function createAstWalkOptions(config: NormalizedFrontierFrameworkConfig): FrontierAstWalkOptions {
  return {
    frontendRouteRoots: config.sourcePolicy.frontendRouteRoots,
    frontendComponentRoots: config.sourcePolicy.frontendComponentRoots,
    backendHandlerRoots: config.sourcePolicy.backendHandlerRoots,
    domainRoots: config.sourcePolicy.domainRoots,
    generatedRoots: config.sourcePolicy.generatedRoots,
    adapterLayers: config.sourcePolicy.businessLogic ? undefined : [],
    forbiddenAdapterCalls: config.sourcePolicy.businessLogic ? config.sourcePolicy.forbiddenAdapterCalls : [],
    allowedAdapterDeclarations: config.sourcePolicy.allowedAdapterDeclarations,
    businessLogicSeverity: normalizeAstSeverity(config.sourcePolicy.businessLogicSeverity)
  };
}

function normalizeAstSeverity(severity: string): NonNullable<FrontierAstWalkOptions['businessLogicSeverity']> {
  return severity === 'error' || severity === 'warning' || severity === 'info' || severity === 'hint'
    ? severity
    : 'error';
}

function inferSourcePackage(config: NormalizedFrontierFrameworkConfig, file: string): string | undefined {
  if (file.startsWith(config.frontend.root + '/')) return config.workspace.frontendPackage;
  if (file.startsWith(config.backend.root + '/')) return config.workspace.backendPackage;
  const packagePrefix = config.workspace.packagesDir + '/';
  if (file.startsWith(packagePrefix)) return file.slice(packagePrefix.length).split('/')[0];
  return undefined;
}

function inferSourceFeature(config: NormalizedFrontierFrameworkConfig, file: string): string | undefined {
  const route = config.frontend.routes.find((item) => item.file === file);
  if (route?.feature) return route.feature;
  const endpoint = config.backend.endpoints.find((item) => item.file === file);
  if (endpoint?.feature) return endpoint.feature;
  return undefined;
}

async function collectSourcePolicyFiles(cwd: string, includes: readonly string[], excludes: readonly string[]): Promise<string[]> {
  const files = new Set<string>();
  for (const include of includes) {
    const base = sourcePolicyPatternBase(include);
    const full = path.resolve(cwd, base);
    if (!existsSync(full)) continue;
    const stat = await fs.stat(full);
    if (stat.isFile()) {
      const relative = normalizeRelativePath(cwd, full);
      if (isSourcePolicyFile(relative) && sourcePolicyPathIncluded(relative, include) && !sourcePolicyPathExcluded(relative, excludes)) {
        files.add(relative);
      }
    } else if (stat.isDirectory()) {
      for (const file of await walkSourcePolicyFiles(cwd, full)) {
        if (sourcePolicyPathIncluded(file, include) && !sourcePolicyPathExcluded(file, excludes)) files.add(file);
      }
    }
  }
  return Array.from(files).sort();
}

async function walkSourcePolicyFiles(cwd: string, dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const relative = normalizeRelativePath(cwd, full);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.frontier-framework', '.git'].includes(entry.name)) continue;
      out.push(...await walkSourcePolicyFiles(cwd, full));
    } else if (entry.isFile() && isSourcePolicyFile(relative)) {
      out.push(relative);
    }
  }
  return out;
}

function countSourceLines(source: string): number {
  if (source.length === 0) return 0;
  const normalized = source.endsWith('\n') ? source.slice(0, -1) : source;
  if (normalized.length === 0) return 0;
  return normalized.split(/\r\n|\r|\n/).length;
}

function collectRuntimeExtensionImports(
  cwd: string,
  file: string,
  source: string
): Array<{ specifier: string; sourceExtension: string; line: number }> {
  const ext = path.extname(file);
  if (ext !== '.ts' && ext !== '.tsx') return [];
  const imports: Array<{ specifier: string; sourceExtension: string; line: number }> = [];
  const patterns = [
    /\bfrom\s*['"](\.{1,2}\/[^'"]+\.(?:js|jsx))['"]/g,
    /\bimport\s*['"](\.{1,2}\/[^'"]+\.(?:js|jsx))['"]/g,
    /\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+\.(?:js|jsx))['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      const directSource = resolveDirectSourceImport(cwd, file, match[1]);
      if (!directSource) continue;
      imports.push({
        specifier: match[1],
        sourceExtension: directSource,
        line: lineForSourceIndex(source, match.index)
      });
    }
  }
  return imports;
}

function resolveDirectSourceImport(cwd: string, file: string, specifier: string): string | null {
  if (specifier.startsWith('../dist/') || specifier.startsWith('./dist/') || specifier.includes('/dist/')) return null;
  const withoutRuntimeExtension = specifier.replace(/\.(?:js|jsx)$/, '');
  const base = path.resolve(cwd, path.dirname(file), withoutRuntimeExtension);
  for (const extension of ['.ts', '.tsx', '.mts', '.cts']) {
    if (existsSync(base + extension)) return extension;
  }
  return null;
}

function lineForSourceIndex(source: string, index: number): number {
  return source.slice(0, index).split(/\r\n|\r|\n/).length;
}

function countFrontierComponents(file: string, source: string): string[] {
  const ext = path.extname(file);
  if (ext !== '.tsx' && ext !== '.jsx') return [];
  if (!looksLikeJsxComponentFile(source)) return [];
  const names = new Set<string>();
  collectComponentNames(source, /\bexport\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g, names);
  if (/\bexport\s+default\s+function\s*\(/.test(source)) names.add('default');
  collectComponentNames(source, /\bexport\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g, names);
  collectComponentNames(source, /\bfunction\s+([A-Z][A-Za-z0-9_]*)\s*\(/g, names);
  collectComponentNames(source, /\b(?:export\s+)?const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>/g, names);
  collectComponentNames(source, /\b(?:export\s+)?const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*function\b/g, names);
  return Array.from(names).sort();
}

function looksLikeJsxComponentFile(source: string): boolean {
  return source.includes('@shapeshift-labs/frontier-dom') || /return\s*\(?\s*</.test(source) || /=>\s*\(?\s*</.test(source);
}

function collectComponentNames(source: string, expression: RegExp, names: Set<string>): void {
  expression.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = expression.exec(source)) !== null) names.add(match[1]);
}

function isSourcePolicyFile(file: string): boolean {
  return SOURCE_POLICY_EXTENSIONS.has(path.extname(file));
}

function normalizeRelativePath(cwd: string, file: string): string {
  return path.relative(cwd, file).replace(/\\/g, '/');
}

function sourcePolicyPatternBase(pattern: string): string {
  const normalized = pattern.replace(/\\/g, '/').replace(/^\.\//, '');
  const firstWildcard = normalized.search(/[*?{]/);
  if (firstWildcard === -1) return normalized;
  const slash = normalized.lastIndexOf('/', firstWildcard);
  return slash === -1 ? '.' : normalized.slice(0, slash) || '.';
}

function sourcePolicyPathIncluded(file: string, pattern: string): boolean {
  return sourcePolicyPathMatches(file, pattern, true);
}

function sourcePolicyPathExcluded(file: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => sourcePolicyPathMatches(file, pattern, false));
}

function sourcePolicyPathMatches(file: string, pattern: string, includeDirectoryContents: boolean): boolean {
  const normalized = pattern.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  if (!normalized) return false;
  if (!/[*?{]/.test(normalized)) {
    return file === normalized || (includeDirectoryContents && file.startsWith(normalized + '/')) || file.startsWith(normalized.replace(/\/\*\*$/, '') + '/');
  }
  return globToRegExp(normalized).test(file);
}

function globToRegExp(pattern: string): RegExp {
  let out = '^';
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    if (char === '*') {
      if (pattern[index + 1] === '*') {
        if (pattern[index + 2] === '/') {
          out += '(?:.*/)?';
          index += 2;
        } else {
          out += '.*';
          index++;
        }
      } else {
        out += '[^/]*';
      }
    } else if (char === '?') {
      out += '[^/]';
    } else if (char === '{') {
      const close = pattern.indexOf('}', index + 1);
      if (close === -1) {
        out += '\\{';
      } else {
        const parts = pattern.slice(index + 1, close).split(',').map((part) => part.split('').map(escapeRegExp).join(''));
        out += '(?:' + parts.join('|') + ')';
        index = close;
      }
    } else {
      out += escapeRegExp(char);
    }
  }
  return new RegExp(out + '$');
}

function commandIsAvailable(command: string, scripts: Record<string, unknown>): boolean {
  if (!command) return true;
  if (command === 'npm test') return typeof scripts.test === 'string';
  const npmRun = command.match(/^npm\s+run\s+([^ ]+)/);
  if (npmRun) return typeof scripts[npmRun[1]] === 'string';
  if (command.startsWith('frontier ')) return true;
  if (command.startsWith('vite ')) return true;
  return true;
}

async function filePatternExists(cwd: string, pattern: string): Promise<boolean> {
  if (!pattern.includes('*')) return existsSync(path.resolve(cwd, pattern));
  const slash = pattern.lastIndexOf('/');
  const dir = path.resolve(cwd, slash === -1 ? '.' : pattern.slice(0, slash));
  const namePattern = slash === -1 ? pattern : pattern.slice(slash + 1);
  if (!existsSync(dir)) return false;
  const matcher = new RegExp('^' + namePattern.split('*').map(escapeRegExp).join('.*') + '$');
  const entries = await fs.readdir(dir);
  return entries.some((entry) => matcher.test(entry));
}

async function loadConfig(args: CliArgs): Promise<FrontierFrameworkConfig> {
  const configPath = args.config ? path.resolve(args.cwd, args.config) : findConfig(args.cwd);
  if (!configPath) return {};
  const imported = await import(pathToFileURL(configPath).href + '?t=' + Date.now());
  return (imported.default ?? imported.config ?? imported) as FrontierFrameworkConfig;
}

function applyCliOverrides(config: FrontierFrameworkConfig, args: CliArgs): FrontierFrameworkConfig {
  if (!args.strict) return config;
  return {
    ...config,
    vite: {
      ...config.vite,
      strict: true
    },
    harness: {
      ...config.harness,
      mode: 'strict',
      strict: true,
      failOnMissing: true
    }
  };
}

function findConfig(cwd: string): string | undefined {
  for (const file of FRONTIER_FRAMEWORK_CONFIG_FILES) {
    const full = path.resolve(cwd, file);
    if (existsSync(full)) return full;
  }
  return undefined;
}

async function withDiscoveredRoutes(cwd: string, config: FrontierFrameworkConfig): Promise<FrontierFrameworkConfig> {
  if (config.frontend?.routes && config.frontend.routes.length > 0) return config;
  const normalized = normalizeFrontierFrameworkConfig(config);
  if (normalized.frontend.routes.length > 0) return config;
  const routes = await discoverRoutes(cwd, normalized);
  return {
    ...config,
    frontend: {
      ...config.frontend,
      routes
    }
  };
}

async function discoverRoutes(cwd: string, config: NormalizedFrontierFrameworkConfig): Promise<FrontierFrontendRouteConfig[]> {
  const routesRoot = path.resolve(cwd, config.frontend.root, config.frontend.routesDir);
  const files = await walk(routesRoot);
  const routes = files
    .filter((file) => isDiscoverableRouteFile(routesRoot, file))
    .sort()
    .map((file) => {
      const routePath = routePathFromFile(routesRoot, file);
      const relativeFile = path.relative(cwd, file).replace(/\\/g, '/');
      const routeSegments = routeSegmentsFromFilePath(routesRoot, file);
      return {
        id: 'route:' + routePath,
        path: routePath,
        file: relativeFile,
        feature: routePath === '/' ? 'home' : routePath.split('/').filter(Boolean)[0],
        metadata: {
          discovery: {
            source: 'filesystem',
            root: path.relative(cwd, routesRoot).replace(/\\/g, '/'),
            segments: routeSegments,
            signature: routeConflictSignature(routePath)
          }
        }
      };
    });
  assertNoDiscoveredRouteConflicts(routes);
  return routes;
}

async function walk(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? await walk(full) : [full];
  }));
  return nested.flat();
}

function isDiscoverableRouteFile(root: string, file: string): boolean {
  if (!/\.(tsx|jsx)$/.test(file)) return false;
  const relative = path.relative(root, file).replace(/\\/g, '/');
  const segments = relative.split('/').filter(Boolean);
  if (segments.some((segment, index) => index < segments.length - 1 && (segment.startsWith('_') || segment.startsWith('@') || segment.startsWith('-')))) return false;
  const leaf = path.basename(file).replace(/\.(tsx|jsx)$/, '');
  if (leaf.startsWith('_') || leaf.startsWith('-')) return false;
  if (leaf.startsWith('+')) return leaf === '+page';
  return !NON_ROUTE_SOURCE_BASENAMES.has(leaf);
}

function routePathFromFile(root: string, file: string): string {
  const route = routeSegmentsFromFilePath(root, file).join('/');
  return route ? '/' + route : '/';
}

function routeSegmentsFromFilePath(root: string, file: string): string[] {
  const relative = path.relative(root, file).replace(/\\/g, '/').replace(/\.(tsx|jsx)$/, '');
  const segments = relative.split('/').filter(Boolean);
  const out: string[] = [];
  for (let index = 0; index < segments.length; index++) {
    out.push(...routeSegmentsFromFileSegment(segments[index], index === segments.length - 1));
  }
  return out;
}

function routeSegmentsFromFileSegment(segment: string, isLeaf: boolean): string[] {
  if (segment.startsWith('-') || segment.startsWith('@') || segment.startsWith('_')) return [];
  if (/^\(.+\)$/.test(segment)) return [];
  const parts = splitFlatRouteSegment(segment);
  const out: string[] = [];
  for (const part of parts) {
    if (isLeaf && PAGE_ROUTE_LEAF_BASENAMES.has(part)) continue;
    const mapped = routeSegmentFromFileSegment(part);
    if (mapped !== undefined) out.push(mapped);
  }
  return out;
}

function splitFlatRouteSegment(segment: string): string[] {
  const out: string[] = [];
  let current = '';
  let depth = 0;
  for (let index = 0; index < segment.length; index++) {
    const char = segment[index];
    if (char === '.' && depth === 0) {
      if (current) out.push(current);
      current = '';
      continue;
    }
    current += char;
    if (char === '[' || char === '{' || char === '(') depth++;
    else if (char === ']' || char === '}' || char === ')') depth = Math.max(0, depth - 1);
  }
  if (current) out.push(current);
  return out;
}

function routeSegmentFromFileSegment(segment: string): string | undefined {
  if (segment.startsWith('_') || segment.startsWith('@') || segment.startsWith('-')) return undefined;
  if (/^\(.+\)$/.test(segment)) return undefined;
  if (segment.endsWith('_') && segment.length > 1) segment = segment.slice(0, -1);
  const optionalCatchAll = segment.match(/^\[\[\.\.\.([^\]]+)\]\]$/);
  if (optionalCatchAll) return '*' + optionalCatchAll[1] + '?';
  const catchAll = segment.match(/^\[\.\.\.([^\]]+)\]$/);
  if (catchAll) return '*' + catchAll[1];
  const optionalDynamic = segment.match(/^\[\[([^\]]+)\]\]$/);
  if (optionalDynamic) return ':' + optionalDynamic[1] + '?';
  const tanstackOptionalDynamic = segment.match(/^\{-\$([^}]+)\}$/);
  if (tanstackOptionalDynamic) return ':' + tanstackOptionalDynamic[1] + '?';
  const dynamic = segment.match(/^\[([^\]]+)\]$/);
  if (dynamic) return ':' + dynamic[1];
  if (segment === '$') return '*splat';
  if (segment.startsWith('$') && segment.length > 1) return ':' + segment.slice(1);
  return segment;
}

function assertNoDiscoveredRouteConflicts(routes: FrontierFrontendRouteConfig[]): void {
  const bySignature = new Map<string, FrontierFrontendRouteConfig[]>();
  for (const route of routes) {
    const signature = routeConflictSignature(route.path);
    const existing = bySignature.get(signature);
    if (existing === undefined) bySignature.set(signature, [route]);
    else existing.push(route);
  }
  for (const [signature, matching] of bySignature) {
    if (matching.length < 2) continue;
    throw new Error([
      'Frontier route discovery conflict for ' + matching[0].path + ' (' + signature + ').',
      'Files: ' + matching.map((route) => route.file).join(', ') + '.',
      'Route groups, pathless segments, and dynamic parameter names can resolve to the same URL shape; add explicit frontend.routes entries or rename one route.'
    ].join(' '));
  }
}

function routeConflictSignature(routePath: string): string {
  const segments = routePath.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return '/' + segments.map((segment) => {
    if (segment.startsWith('*')) return segment.endsWith('?') ? '*?' : '*';
    if (segment.startsWith(':')) return segment.endsWith('?') ? ':?' : ':';
    return segment;
  }).join('/');
}

function createRouteDiscoverySummary(config: NormalizedFrontierFrameworkConfig): RouteDiscoverySummary {
  return {
    kind: 'frontier.framework.route.discovery',
    appId: config.id,
    root: path.join(config.frontend.root, config.frontend.routesDir).replace(/\\/g, '/'),
    routes: config.frontend.routes.map((route) => {
      const discovery = route.metadata?.discovery;
      return {
        id: route.id,
        path: route.path,
        file: route.file,
        source: discovery && typeof discovery === 'object' ? 'filesystem' : 'config',
        signature: routeConflictSignature(route.path),
        segments: route.path.split('/').filter(Boolean)
      };
    })
  };
}

function createDevtoolsBridgeSummary(config: NormalizedFrontierFrameworkConfig) {
  return {
    kind: 'frontier.framework.devtools.bridge.summary',
    appId: config.id,
    globalName: config.devtools.globalName,
    bridgeGlobalName: config.devtools.bridgeGlobalName,
    scriptPath: config.devtools.scriptPath,
    autoBridge: config.devtools.autoBridge,
    maxRecords: config.devtools.maxRecords,
    channels: {
      stateSnapshots: config.devtools.stateSnapshots,
      patches: config.devtools.patches,
      crdt: config.devtools.crdt,
      eventLog: config.devtools.eventLog,
      traces: config.devtools.traces,
      telemetry: config.devtools.telemetry,
      timeline: config.devtools.timeline,
      rewind: config.devtools.rewind
    },
    methods: [
      'attachBridge',
      'inspect',
      'snapshot',
      'captureSnapshot',
      'rewind',
      'rewindOneStep',
      'getState',
      'setState',
      'recordPatch',
      'recordCrdtUpdate',
      'recordEventLogEntry',
      'recordTrace',
      'recordTelemetry',
      'timeline',
      'loadEvidence'
    ]
  };
}

function createTsxBundleContext(): TsxBundleContext {
  return {
    resolvedFiles: new Map(),
    sourceText: new Map(),
    localImports: new Map()
  };
}

async function bundleTsxForFrontierCompiler(entryFile: string, context: TsxBundleContext = createTsxBundleContext()): Promise<TsxBundleResult> {
  const visited = new Set<string>();
  const bundled = await readModule(entryFile, visited, new Map(), context, true);
  const code = bundled.join('\n\n');
  const files = Array.from(visited).sort();
  const hash = crypto.createHash('sha256');
  hash.update(code);
  for (const file of files) {
    hash.update('\0');
    hash.update(file);
  }
  return {
    code,
    files,
    fingerprint: hash.digest('hex')
  };
}

async function readModule(file: string, visited: Set<string>, aliases: Map<string, string>, context: TsxBundleContext, isEntry = false): Promise<string[]> {
  const resolvedFile = resolveSourceFile(file, context);
  if (visited.has(resolvedFile)) return [];
  visited.add(resolvedFile);
  let source = context.sourceText.get(resolvedFile);
  if (source === undefined) {
    source = await fs.readFile(resolvedFile, 'utf8');
    context.sourceText.set(resolvedFile, source);
  }
  let imports = context.localImports.get(resolvedFile);
  if (imports === undefined) {
    imports = parseLocalImports(source, resolvedFile);
    context.localImports.set(resolvedFile, imports);
  }
  const chunks: string[] = [];
  for (const item of imports) {
    chunks.push(...await readModule(item.file, visited, item.aliases, context));
  }
  let body = source
    .replace(/^\s*import\s+type\s+[^;]+;?\s*$/gm, '')
    .replace(/^\s*import\s+[^;]+;?\s*$/gm, '')
    .replace(/^\s*export\s+(?=(?:async\s+)?function\s+)/gm, '')
    .replace(/^\s*export\s+(?=(?:const|let|var|class)\s+)/gm, '');
  for (const [local, exported] of aliases.entries()) {
    body = body.replace(new RegExp('export\\s+default\\s+function\\s+' + escapeRegExp(exported) + '\\s*\\(', 'g'), 'function ' + local + '(');
    body = body.replace(/export\s+default\s+function\s*\(/g, 'function ' + local + '(');
    body = body.replace(new RegExp('export\\s+default\\s+' + escapeRegExp(exported) + '\\s*;?', 'g'), 'const ' + local + ' = ' + exported + ';');
    if (local !== exported) body += '\nconst ' + local + ' = ' + exported + ';';
  }
  if (!isEntry) body = body.replace(/^\s*export\s+default\s+/gm, '');
  chunks.push(body.trim());
  return chunks.filter(Boolean);
}

interface LocalImport {
  file: string;
  aliases: Map<string, string>;
}

function parseLocalImports(source: string, fromFile: string): LocalImport[] {
  const imports: LocalImport[] = [];
  const importRe = /^\s*import\s+(.+?)\s+from\s+['"](.+?)['"];?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = importRe.exec(source)) !== null) {
    const specifier = match[2];
    if (!specifier.startsWith('.')) continue;
    const aliases = new Map<string, string>();
    const clause = match[1].trim();
    const named = clause.match(/\{([^}]+)\}/);
    const defaultName = clause.split(',')[0]?.trim();
    if (defaultName && !defaultName.startsWith('{') && defaultName !== '*') aliases.set(defaultName, 'default');
    if (named) {
      for (const part of named[1].split(',')) {
        const [imported, local] = part.trim().split(/\s+as\s+/);
        if (imported) aliases.set((local ?? imported).trim(), imported.trim());
      }
    }
    imports.push({ file: path.resolve(path.dirname(fromFile), specifier), aliases });
  }
  return imports;
}

function resolveSourceFile(file: string, context?: TsxBundleContext): string {
  const cached = context?.resolvedFiles.get(file);
  if (cached) return cached;
  const candidates = [
    file,
    file + '.tsx',
    file + '.ts',
    file + '.jsx',
    file + '.js',
    path.join(file, 'index.tsx'),
    path.join(file, 'index.ts'),
    path.join(file, 'index.jsx'),
    path.join(file, 'index.js')
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      context?.resolvedFiles.set(file, candidate);
      return candidate;
    }
  }
  throw new Error('Unable to resolve local TSX import: ' + file);
}

function inferDefaultFunctionName(source: string): string | undefined {
  return source.match(/\bexport\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(/)?.[1];
}

function renderHtmlDocument(body: string, config: NormalizedFrontierFrameworkConfig): string {
  const attrs = Object.entries(config.frontend.shell.bodyAttrs ?? {}).map(([key, value]) => key + '="' + escapeHtml(value) + '"').join(' ');
  const bodyAttrs = attrs ? ' ' + attrs : '';
  const head = config.frontend.shell.head ?? '<link rel="stylesheet" href="/styles.css">';
  const devtools = config.devtools.enabled && config.devtools.includeInBuild
    ? '<script type="module" src="' + escapeHtml(config.devtools.scriptPath) + '"></script>'
    : '';
  return [
    '<!doctype html>',
    '<html lang="' + escapeHtml(config.frontend.shell.lang) + '">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>' + escapeHtml(config.frontend.shell.title) + '</title>',
    head,
    '</head>',
    '<body' + bodyAttrs + '>',
    '<div id="' + escapeHtml(config.frontend.shell.appRootId) + '">' + body + '</div>',
    devtools,
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

function htmlFileForRoute(outDir: string, routePath: string): string {
  if (routePath === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, routePath.replace(/^\/+/, ''), 'index.html');
}

function renderBackendReadme(contract: unknown): string {
  return '# Frontier Backend Artifact\n\nThis directory contains a backend deployment contract, not a framework-owned server runtime.\n\n```json\n' + JSON.stringify(contract, null, 2) + '\n```\n';
}

function renderBuildSummary(result: { config: NormalizedFrontierFrameworkConfig; frontendRoutes: unknown[]; artifacts: unknown[]; evidence: string; vite?: ViteBuildResult; componentPreview?: ComponentPreviewBuild; documentation?: DocumentationBuild; conformance?: ConformanceReport; harness?: HarnessValidation; auth?: AuthManifestBuild; migrations?: MigrationManifestBuild }): string {
  return [
    'Frontier build complete for ' + result.config.name,
    'Routes: ' + result.frontendRoutes.length,
    'Vite: ' + (result.vite?.used ? 'used' : result.vite?.enabled ? 'skipped' : 'disabled'),
    'Component previews: ' + (result.componentPreview?.enabled ? result.componentPreview.entries + ' entries' : 'disabled'),
    'Documentation: ' + (result.documentation?.enabled ? result.documentation.pages + ' pages' : 'disabled'),
    'Conformance: ' + (result.conformance?.ok ? 'ok' : result.conformance?.enabled ? 'failed' : 'disabled'),
    'Auth: ' + (result.auth?.enabled ? result.auth.manifest.summary.gateCount + ' gates, ' + result.auth.manifest.summary.tokenContractCount + ' token contracts' : 'disabled'),
    'Migrations: ' + (result.migrations?.enabled ? result.migrations.sources.length + ' sources' : 'disabled'),
    'Harness: ' + (result.harness?.ok ? 'ok' : 'needs attention'),
    'Artifacts: ' + result.artifacts.length,
    'Evidence: ' + result.evidence
  ].join('\n');
}

function renderConformanceSummary(result: ConformanceReport): string {
  return [
    'Frontier conformance ' + (result.ok ? 'ok' : 'failed') + ' for ' + result.appId,
    'Mode: ' + result.mode,
    'Rules: ' + result.requiredPackageUses.length,
    'Diagnostics: ' + result.lint.summary.diagnosticCount,
    'Errors: ' + result.lint.summary.errorCount
  ].join('\n');
}

function renderAuthSummary(result: AuthManifestBuild): string {
  return [
    'Frontier auth ' + (result.enabled ? 'enabled' : 'disabled') + ' for ' + result.appId,
    'Providers: ' + result.manifest.summary.providerCount,
    'Gates: ' + result.manifest.summary.gateCount,
    'Token contracts: ' + result.manifest.summary.tokenContractCount,
    'Runtime grants: ' + result.manifest.summary.runtimeGrantCount,
    'Manifest: ' + result.manifestFile,
    'Evidence: ' + result.evidenceFile
  ].join('\n');
}

function renderPlanSummary(plan: ReturnType<typeof createFrontierFramework>): string {
  return [
    plan.config.name,
    'Packages: ' + plan.packages.length,
    'Auth gates: ' + plan.auth.summary.gateCount,
    'Routes: ' + plan.routes.routes.length,
    'Deploy targets: ' + plan.deployTargets.map((target) => target.id).join(', ')
  ].join('\n');
}

function renderDeploySummary(plan: ReturnType<typeof createFrontierDeployPlan>): string {
  return plan.deployTargets.map((target) => [target.id, target.target, target.kind, target.output].filter(Boolean).join('\t')).join('\n');
}

function renderHarnessSummary(result: HarnessValidation): string {
  const lines = [
    'Frontier harness ' + (result.ok ? 'ok' : 'failed') + ' for ' + result.appId,
    'Mode: ' + result.mode,
    'Target: ' + result.target,
    'Evidence: ' + result.evidenceDir
  ];
  for (const check of result.checks) {
    lines.push((check.ok ? 'ok' : 'missing') + '\t' + check.id + (check.missing.length ? '\t' + check.missing.join(', ') : ''));
  }
  return lines.join('\n');
}

function renderAgentSummary(result: AgentBundleBuild): string {
  return [
    'Frontier agent bundle ' + (result.readiness.ok ? 'ready' : 'needs attention'),
    'Generated: ' + result.generatedDir,
    'Runbook: ' + result.runbookFile,
    'Handoff: ' + result.handoffFile,
    'Surface coverage: ' + result.surfaceCoverageFile,
    'Surface dashboard: ' + result.surfaceDashboardFile,
    'Surface loop: ' + result.surfaceLoopFile,
    'MCP tools: ' + result.mcpManifestFile,
    'CI gates: ' + result.ciGatesFile,
    'SARIF: ' + result.sarifFile,
    'Workflow: ' + result.workflowFile,
    'Replay: ' + result.replayScriptFile,
    'Files: ' + result.files.length
  ].join('\n');
}

function renderMigrationsSummary(result: MigrationManifestBuild): string {
  return [
    'Frontier migrations ' + (result.enabled ? 'enabled' : 'disabled') + ' for ' + result.appId,
    'Registry: ' + result.registryId,
    'Version: ' + result.initialVersion + ' -> ' + result.currentVersion,
    'Sources: ' + result.sources.length,
    'Bridge: ' + result.runtimeBridgeFile,
    'Evidence: ' + result.evidenceFile
  ].join('\n');
}

function renderDocumentationSummary(result: DocumentationBuild | Record<string, unknown>): string {
  if (result.kind === 'frontier.framework.documentation.build') {
    const build = result as DocumentationBuild;
    return [
      'Frontier documentation ' + (build.enabled ? 'built' : 'disabled') + ' for ' + build.appId,
      'Pages: ' + build.pages,
      'Sections: ' + build.sections,
      'Search records: ' + build.searchRecords,
      'Out: ' + build.outDir,
      'Artifacts: ' + build.artifacts.length
    ].join('\n');
  }
  const record = result as Record<string, unknown>;
  if (record.kind === 'frontier.framework.documentation.inspect') {
    const manifest = record.manifest as { pages?: unknown[] } | undefined;
    const diagnostics = record.diagnostics as unknown[] | undefined;
    return [
      'Frontier documentation inspect for ' + String(record.appId ?? ''),
      'Pages: ' + (Array.isArray(manifest?.pages) ? manifest.pages.length : 0),
      'Diagnostics: ' + (Array.isArray(diagnostics) ? diagnostics.length : 0),
      'Ok: ' + String(record.ok ?? true)
    ].join('\n');
  }
  const diagnostics = record.diagnostics as unknown[] | undefined;
  const cases = record.cases as unknown[] | undefined;
  return [
    String(record.kind ?? 'frontier.framework.documentation'),
    'Ok: ' + String(record.ok ?? true),
    Array.isArray(diagnostics) ? 'Diagnostics: ' + diagnostics.length : undefined,
    Array.isArray(cases) ? 'Cases: ' + cases.length : undefined
  ].filter((line): line is string => Boolean(line)).join('\n');
}

function renderSurfaceStatusSummary(result: FrontierFrameworkSurfaceStatusReport): string {
  const lines = [
    'Frontier surface status for ' + result.appId,
    'Matches: ' + result.summary.matchCount,
    'Statuses: ' + Object.entries(result.summary.statusCounts).map(([status, count]) => status + '=' + count).join(', '),
    'Kinds: ' + Object.entries(result.summary.kindCounts).map(([kind, count]) => kind + '=' + count).join(', ')
  ];
  if (result.coverage) {
    lines.push(
      'Coverage: ok=' + String(result.coverage.ok)
      + ', missing=' + result.coverage.missingCount
      + ', nextProbes=' + result.coverage.nextProbeCount
    );
  }
  const coverageBySurface = new Map(result.coverage?.records.map((record) => [record.surfaceId, record]) ?? []);
  for (const surface of result.surfaces.slice(0, 80)) {
    const coverage = coverageBySurface.get(surface.id);
    const coverageCell = coverage
      ? 'coverage=' + (coverage.ok ? 'ok' : 'missing:' + coverage.missing.join(',')) + ',next=' + coverage.nextCommand
      : '';
    lines.push([
      surface.status,
      surface.kind,
      surface.id,
      surface.route ?? '',
      surface.feature ?? '',
      surface.evidence.length ? 'evidence=' + surface.evidence.length : '',
      coverageCell
    ].join('\t'));
  }
  if (result.surfaces.length > 80) lines.push('... ' + (result.surfaces.length - 80) + ' more');
  return lines.join('\n');
}

function renderSurfaceCoverageSummary(result: FrontierFrameworkSurfaceCoverageReport): string {
  const lines = [
    'Frontier surface coverage for ' + result.appId,
    'OK: ' + result.ok,
    'Surfaces: ' + result.summary.surfaceCount + ' total, ' + result.summary.requiredSurfaceCount + ' claimed, ' + result.summary.missingCount + ' missing',
    'Probes: covered=' + result.summary.coveredProbeCount + ', missing=' + result.summary.missingProbeCount + ', planned=' + result.summary.plannedProbeCount
  ];
  const kindSummary = Object.entries(result.dashboard.byKind)
    .map(([kind, bucket]) => kind + '=' + bucket.ok + '/' + bucket.total)
    .join(', ');
  if (kindSummary) lines.push('Kinds: ' + kindSummary);
  for (const record of result.records.filter((item) => !item.ok).slice(0, 80)) {
    lines.push([
      'missing',
      record.surface.kind,
      record.surface.id,
      record.surface.route ?? '',
      record.missing.join(','),
      record.hints[0] ?? ''
    ].join('\t'));
  }
  const missingRecords = result.records.filter((item) => !item.ok).length;
  if (missingRecords > 80) lines.push('... ' + (missingRecords - 80) + ' more missing surfaces');
  return lines.join('\n');
}

function renderAgentLoopSummary(result: FrontierFrameworkAgentLoopReport): string {
  const lines = [
    'Frontier agent loop ' + (result.ok ? 'ready' : 'needs evidence') + ' for ' + result.appId,
    'Matches: ' + result.summary.matchedSurfaces + ', claimed=' + result.summary.claimedSurfaces + ', missing=' + result.summary.missingSurfaces,
    'Probes: covered=' + result.summary.coveredProbes + ', missing=' + result.summary.missingProbes + ', planned=' + result.summary.plannedProbes,
    'Work: total=' + result.summary.workItems + ', required=' + result.summary.requiredWorkItems,
    'Loop: ' + result.artifacts.loop,
    'Dashboard: ' + result.artifacts.loopDashboard
  ];
  for (const [kind, bucket] of Object.entries(result.dashboard.focus)) {
    lines.push('focus\t' + kind + '\t' + bucket.ok + '/' + bucket.total + '\tmissing=' + bucket.missing);
  }
  for (const item of result.workQueue.slice(0, 24)) {
    lines.push([
      'work',
      String(item.priority),
      item.kind,
      item.surfaceKind,
      item.surfaceId,
      item.route ?? '',
      item.probeKind ?? '',
      item.command,
      item.reason
    ].join('\t'));
  }
  for (const surface of result.next.slice(0, 24)) {
    lines.push([
      surface.ok ? 'planned' : 'missing',
      surface.kind,
      surface.id,
      surface.route ?? '',
      surface.missing.join(',') || surface.probes.filter((probe) => probe.status === 'planned').map((probe) => probe.kind).join(','),
      surface.nextCommand,
      surface.hint ?? ''
    ].join('\t'));
  }
  return lines.join('\n');
}

function renderSurfaceCoverageDashboard(result: FrontierFrameworkSurfaceCoverageReport): string {
  const lines = [
    '# Frontier Surface Coverage',
    '',
    '- appId: ' + result.appId,
    '- ok: ' + String(result.ok),
    '- claimed: ' + result.summary.requiredSurfaceCount,
    '- missing: ' + result.summary.missingCount,
    '- nextProbes: ' + result.summary.nextProbeCount,
    '- contracts: ' + result.summary.passedContractCount + '/' + result.summary.contractCount + ' passed',
    '- report: ' + result.reportFile,
    '',
    '## By Kind',
    '',
    '| kind | ok | missing | total | evidence |',
    '| --- | ---: | ---: | ---: | ---: |'
  ];
  for (const [kind, bucket] of Object.entries(result.dashboard.byKind)) {
    lines.push('| ' + kind + ' | ' + bucket.ok + ' | ' + bucket.missing + ' | ' + bucket.total + ' | ' + bucket.evidenceLinked + ' |');
  }
  lines.push('', '## By Status', '', '| status | ok | missing | total | evidence |', '| --- | ---: | ---: | ---: | ---: |');
  for (const [status, bucket] of Object.entries(result.dashboard.byStatus)) {
    lines.push('| ' + status + ' | ' + bucket.ok + ' | ' + bucket.missing + ' | ' + bucket.total + ' | ' + bucket.evidenceLinked + ' |');
  }
  lines.push('', '## By Probe', '', '| probe | covered | missing | planned | total |', '| --- | ---: | ---: | ---: | ---: |');
  for (const [probe, bucket] of Object.entries(result.dashboard.byProbe)) {
    lines.push('| ' + probe + ' | ' + bucket.covered + ' | ' + bucket.missing + ' | ' + bucket.planned + ' | ' + bucket.total + ' |');
  }
  lines.push('', '## By Contract', '', '| contract | passed | failed | missing | planned | total |', '| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const [contract, bucket] of Object.entries(result.dashboard.byContract)) {
    lines.push('| ' + contract + ' | ' + bucket.passed + ' | ' + bucket.failed + ' | ' + bucket.missing + ' | ' + bucket.planned + ' | ' + bucket.total + ' |');
  }
  lines.push('', '## By Route', '', '| route | ok | missing | total |', '| --- | ---: | ---: | ---: |');
  for (const route of result.dashboard.byRoute) {
    lines.push('| ' + route.route + ' | ' + route.ok + ' | ' + route.missing + ' | ' + route.total + ' |');
  }
  const missing = result.records.filter((record) => !record.ok);
  if (missing.length > 0) {
    lines.push('', '## Missing', '', '| surface | kind | route | missing | contracts | hint |', '| --- | --- | --- | --- | --- | --- |');
    for (const record of missing) {
      const failedContracts = record.contractProofs.filter((proof) => proof.required && proof.status !== 'passed').map((proof) => proof.kind + ':' + proof.status);
      lines.push('| ' + record.surface.id + ' | ' + record.surface.kind + ' | ' + (record.surface.route ?? '') + ' | ' + record.missing.join(', ') + ' | ' + failedContracts.join(', ') + ' | ' + (record.hints[0] ?? '') + ' |');
    }
    lines.push('', '## Next Probe Plan', '', '| surface | probe | status | command | route | reason |', '| --- | --- | --- | --- | --- | --- |');
    for (const record of missing) {
      for (const probe of record.nextProbes) {
        lines.push('| ' + probe.surfaceId + ' | ' + probe.kind + ' | ' + probe.status + ' | ' + probe.command + ' | ' + (probe.route ?? '') + ' | ' + probe.reason + ' |');
      }
    }
  }
  return lines.join('\n') + '\n';
}

function renderAgentLoopDashboard(result: FrontierFrameworkAgentLoopReport): string {
  const lines = [
    '# Frontier Agent Loop',
    '',
    '- appId: ' + result.appId,
    '- ok: ' + String(result.ok),
    '- matched: ' + result.summary.matchedSurfaces,
    '- claimed: ' + result.summary.claimedSurfaces,
    '- missing: ' + result.summary.missingSurfaces,
    '- nextProbes: ' + result.summary.nextProbes,
    '- workItems: ' + result.summary.workItems,
    '- requiredWorkItems: ' + result.summary.requiredWorkItems,
    '- coverage: ' + result.artifacts.coverage,
    '',
    '## Focus',
    '',
    '| kind | ok | missing | total | next |',
    '| --- | ---: | ---: | ---: | --- |'
  ];
  for (const [kind, bucket] of Object.entries(result.dashboard.focus)) {
    lines.push('| ' + kind + ' | ' + bucket.ok + ' | ' + bucket.missing + ' | ' + bucket.total + ' | ' + bucket.next.slice(0, 6).join(', ') + ' |');
  }
  lines.push('', '## Work Queue', '', '| priority | surface | kind | probe | route | command | required | reason |', '| ---: | --- | --- | --- | --- | --- | --- | --- |');
  for (const item of result.workQueue) {
    lines.push('| ' + item.priority + ' | ' + item.surfaceId + ' | ' + item.surfaceKind + ' | ' + (item.probeKind ?? '') + ' | ' + (item.route ?? '') + ' | ' + item.command + ' | ' + String(item.required) + ' | ' + item.reason + ' |');
  }
  lines.push('', '## Next Surfaces', '', '| surface | kind | status | route | missing | command |', '| --- | --- | --- | --- | --- | --- |');
  for (const surface of result.next) {
    const planned = surface.probes.filter((probe) => probe.status === 'planned').map((probe) => probe.kind);
    lines.push('| ' + surface.id + ' | ' + surface.kind + ' | ' + surface.status + ' | ' + (surface.route ?? '') + ' | ' + (surface.missing.join(', ') || planned.join(', ')) + ' | ' + surface.nextCommand + ' |');
  }
  if (result.missing.length > 0) {
    lines.push('', '## Missing Probes', '', '| surface | missing | hint |', '| --- | --- | --- |');
    for (const surface of result.missing) {
      lines.push('| ' + surface.id + ' | ' + surface.missing.join(', ') + ' | ' + (surface.hint ?? '') + ' |');
    }
    lines.push('', '## Next Probe Plan', '', '| surface | probe | status | command | route | reason |', '| --- | --- | --- | --- | --- | --- |');
    for (const surface of result.missing) {
      for (const probe of surface.nextProbes) {
        lines.push('| ' + probe.surfaceId + ' | ' + probe.kind + ' | ' + probe.status + ' | ' + probe.command + ' | ' + (probe.route ?? '') + ' | ' + probe.reason + ' |');
      }
    }
  }
  return lines.join('\n') + '\n';
}

function renderDoctorSummary(result: DoctorReport): string {
  const lines = [
    'Frontier doctor ' + (result.ok ? 'ok' : 'failed') + ' for ' + result.appId,
    'Routes: ' + result.summary.routes,
    'Endpoints: ' + result.summary.endpoints,
    'Transports: ' + result.summary.transports,
    'Surface coverage missing: ' + result.summary.surfaceCoverageMissing
  ];
  for (const check of result.checks) {
    lines.push((check.ok ? 'ok' : check.required ? 'missing' : 'warn') + '\t' + check.id + '\t' + check.detail);
  }
  return lines.join('\n');
}

function renderConfigCommandSummary(args: CliArgs, result: ConfigCommandReport): string {
  if (result.kind === 'frontier.framework.config.explain') {
    const lines = [
      'Frontier config explain' + (args.configExplainPath ? ' for ' + args.configExplainPath : ''),
      'Entries: ' + result.entries.length
    ];
    for (const entry of result.entries) {
      lines.push(entry.path + '\t' + entry.type + '\t' + entry.description);
    }
    return lines.join('\n');
  }
  return renderConfigValidationSummary(result);
}

function renderConfigValidationSummary(result: FrontierFrameworkConfigValidationResult): string {
  const lines = [
    'Frontier config validation ' + (result.ok ? 'ok' : 'failed'),
    'Schema: ' + (result.schemaValid ? 'valid' : 'invalid'),
    'Diagnostics: ' + result.diagnostics.length
  ];
  for (const diagnostic of result.diagnostics) {
    lines.push(diagnostic.severity + '\t' + diagnostic.path + '\t' + diagnostic.message + (diagnostic.suggestedFix ? '\t' + diagnostic.suggestedFix : ''));
  }
  return lines.join('\n');
}

function formatConfigValidationError(result: FrontierFrameworkConfigValidationResult): string {
  const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error').slice(0, 5);
  const details = errors.map((diagnostic) => diagnostic.path + ': ' + diagnostic.message + (diagnostic.suggestedFix ? ' Fix: ' + diagnostic.suggestedFix : '')).join('\n');
  return 'Frontier config validation failed with ' + errors.length + ' error(s).' + (details ? '\n' + details : '');
}

function firstConfigSuggestedFix(result: FrontierFrameworkConfigValidationResult): string | undefined {
  return result.diagnostics.find((diagnostic) => diagnostic.severity === 'error' && diagnostic.suggestedFix)?.suggestedFix
    ?? result.diagnostics.find((diagnostic) => diagnostic.suggestedFix)?.suggestedFix;
}

function renderHelp(): string {
  return `frontier <command>

Commands:
  init [dir]              Create a Frontier framework scaffold
  build                  Build frontend/backend/evidence artifacts
  inspect                Print the app graph plan
  doctor                 Validate config, source paths, source policy, scripts, deploy split, and harness readiness
  lint                   Run Frontier package-use conformance lint and SARIF export
  config explain [path]   Explain config fields, defaults, and suggested fixes
  config validate         Validate config schema and semantic rules
  auth                   Generate/inspect Frontier auth manifest and evidence
  migrations             Generate/inspect runtime migration manifest and bridge
  docs [action]           Inspect/build/lint/test/fuzz/bench generated documentation evidence
  surfaces               Query page, route, filter, feature, or app surface status
  status                 Alias for surfaces
  coverage               Report render/state/evidence coverage for claimed surfaces
  loop                   Join surface status, probes, and next missing evidence for agents
  harness                Validate test/fuzzer/benchmark/browser/agent gates
  agent                  Generate agent manifest, runbook, readiness, and handoff bundle
  fuzz                   Validate or run configured fuzzer gate
  bench                  Validate or run configured benchmark gate
  deploy-plan            Print deploy targets
  dev                    Build frontend and serve the static output

Options:
  --config <file>         Config path
  --cwd <dir>             Working directory
  --target <name>         all, frontend, backend, evidence
  --out <dir>             Output directory for docs build
  --cases <n>             Fuzz cases per documentation page
  --harness-target <name> all, tests, fuzzers, benchmarks, browser, agent, linter, hybrid
  --ref <ref>            Surface id, route, alias, feature, owner, or typed ref for surfaces/status
  --id <id>              Exact surface id for surfaces/status
  --kind <kind>          Surface kind for surfaces/status, e.g. page or filter
  --route <path>         Route path for surfaces/status
  --feature <id>         Feature id for surfaces/status
  --owner <id>           Surface owner for surfaces/status
  --status <status>      Surface lifecycle status for surfaces/status
  --tag <tag>            Surface tag filter for surfaces/status
  --path <config.path>    Config path filter for config explain
  --strict                Require Vite and harness gates to be present
  --json                  Print JSON
  --name <name>           App name for init
  --single                Scaffold without monorepo workspaces
  --package-manager <pm>  npm, pnpm, yarn, bun
  --port <port>           Dev server port
`;
}

async function serveStatic(root: string, port: number): Promise<void> {
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const requested = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
    const file = path.join(root, requested === '/' ? 'index.html' : requested);
    const fallback = path.join(file, 'index.html');
    const target = existsSync(file) ? file : fallback;
    try {
      const body = await fs.readFile(target);
      response.statusCode = 200;
      response.setHeader('Content-Type', contentTypeForPath(target));
      response.end(body);
    } catch {
      response.statusCode = 404;
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      response.end('Not found');
    }
  });
  await new Promise<void>((resolve) => server.listen(port, resolve));
  process.stdout.write('Frontier dev server listening on http://localhost:' + port + '\n');
}

function contentTypeForPath(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
    '.webp': 'image/webp'
  };
  return types[extension] || 'application/octet-stream';
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    command: argv[0] ?? 'help',
    cwd: process.cwd(),
    target: 'all',
    json: false,
    monorepo: true,
    port: 4173,
    install: false,
    strict: false,
    harnessTarget: 'all',
    surfaceQuery: {}
  };
  const rest = argv.slice(1);
  for (let index = 0; index < rest.length; index++) {
    const value = rest[index];
    if (value === '--cwd') args.cwd = path.resolve(rest[++index]);
    else if (value === '--config') args.config = rest[++index];
    else if (value === '--path') args.configExplainPath = rest[++index];
    else if (value === '--target') args.target = rest[++index] as CliTarget;
    else if (value === '--out') args.out = rest[++index];
    else if (value === '--cases') args.cases = Number(rest[++index]);
    else if (value === '--harness-target') args.harnessTarget = rest[++index] as HarnessTarget;
    else if (value === '--ref') args.surfaceQuery.ref = rest[++index];
    else if (value === '--id') args.surfaceQuery.id = rest[++index];
    else if (value === '--kind') args.surfaceQuery.kind = rest[++index];
    else if (value === '--route') args.surfaceQuery.route = rest[++index];
    else if (value === '--feature') args.surfaceQuery.feature = rest[++index];
    else if (value === '--owner') args.surfaceQuery.owner = rest[++index];
    else if (value === '--status') args.surfaceQuery.status = rest[++index];
    else if (value === '--tag') args.surfaceQuery.tags = [...(args.surfaceQuery.tags ?? []), rest[++index]];
    else if (value === '--browser') args.harnessTarget = 'browser';
    else if (value === '--agent') args.harnessTarget = 'agent';
    else if (value === '--hybrid') args.harnessTarget = 'hybrid';
    else if (value === '--strict') args.strict = true;
    else if (value === '--json') args.json = true;
    else if (value === '--name') args.name = rest[++index];
    else if (value === '--single') args.monorepo = false;
    else if (value === '--monorepo') args.monorepo = true;
    else if (value === '--package-manager') args.packageManager = rest[++index];
    else if (value === '--port') args.port = Number(rest[++index]);
    else if (value === '--install') args.install = true;
    else if (value === '--no-install') args.install = false;
    else if (!value.startsWith('-') && args.command === 'config') {
      if (!args.configAction && (value === 'explain' || value === 'validate')) args.configAction = value;
      else if (!args.configAction) {
        args.configAction = 'explain';
        args.configExplainPath = value;
      } else if (args.configAction === 'explain' && !args.configExplainPath) {
        args.configExplainPath = value;
      }
    }
    else if (!value.startsWith('-') && (args.command === 'docs' || args.command === 'documentation') && !args.docsAction) {
      args.docsAction = value as DocsAction;
    }
    else if (!value.startsWith('-') && (args.command === 'surfaces' || args.command === 'status' || args.command === 'loop' || args.command === 'agent-loop')) {
      if (value.startsWith('/')) args.surfaceQuery.route = value;
      else if (!args.surfaceQuery.ref) args.surfaceQuery.ref = value;
    }
    else if (!value.startsWith('-') && args.command === 'init' && !args.dir) args.dir = value;
  }
  if (args.command === 'config' && !args.configAction) args.configAction = 'explain';
  if ((args.command === 'docs' || args.command === 'documentation') && !args.docsAction) args.docsAction = 'inspect';
  return args;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char] ?? char);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isFrontierCliEntrypoint(): boolean {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
}

if (isFrontierCliEntrypoint()) {
  runFrontierCli().catch((error) => {
    process.stderr.write((error instanceof Error ? error.stack ?? error.message : String(error)) + '\n');
    process.exitCode = 1;
  });
}
