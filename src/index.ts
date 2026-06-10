import type { JsonObject, JsonValue } from '@shapeshift-labs/frontier';
import {
  createApplicationGraphFromManifestLike,
  type FrontierApplicationGraph
} from '@shapeshift-labs/frontier-application';
import {
  createAuthLintResources,
  createAuthManifest,
  createAuthRegistryGraph,
  type FrontierAuthCapabilityInput,
  type FrontierAuthGateInput,
  type FrontierAuthLinkingPolicyInput,
  type FrontierAuthManifest,
  type FrontierAuthManifestInput,
  type FrontierAuthProfileRequirementInput,
  type FrontierAuthProviderInput,
  type FrontierAuthRuntimeGrantInput,
  type FrontierAuthSessionStrategy,
  type FrontierAuthTokenContractInput
} from '@shapeshift-labs/frontier-auth';
import type {
  FrontierPreviewIntegrationFlags,
  FrontierPreviewRenderer,
  FrontierPreviewVariantInput
} from '@shapeshift-labs/frontier-component-preview';
import type { FrontierDocumentationIntegrationFlags } from '@shapeshift-labs/frontier-documentation';
import {
  createEffectManifest,
  type FrontierEffectManifest
} from '@shapeshift-labs/frontier-effects';
import {
  createManifest,
  createManifestProof,
  type FrontierManifest,
  type FrontierManifestEntryInput,
  type FrontierManifestProof,
  type FrontierManifestTaskInput
} from '@shapeshift-labs/frontier-manifest';
import {
  createRouteManifest,
  type FrontierRouteEntry,
  type FrontierRouteManifest
} from '@shapeshift-labs/frontier-route';
import {
  validateJsonSchemaContract,
  type JsonSchemaContract,
  type SchemaValidationIssue
} from '@shapeshift-labs/frontier-schema';
import {
  createTestManifest,
  type FrontierTestEvidenceRecord,
  type FrontierTestManifest,
  type FrontierTestProof,
  type FrontierTestRunRecord
} from '@shapeshift-labs/frontier-test';
import {
  createToolsManifest,
  type FrontierToolsManifest
} from '@shapeshift-labs/frontier-tools';
import {
  createTrace,
  type FrontierTrace
} from '@shapeshift-labs/frontier-trace';
import {
  createViewManifest,
  type FrontierViewManifest
} from '@shapeshift-labs/frontier-view';

export const FRONTIER_FRAMEWORK_PACKAGE_NAME = '@shapeshift-labs/frontier-framework';
export const FRONTIER_FRAMEWORK_CONFIG_FILES = [
  'frontier.config.mjs',
  'frontier.config.js',
  'frontier.config.cjs'
] as const;

export type FrontierFrameworkWorkspaceKind = 'monorepo' | 'single' | string;
export type FrontierFrameworkTargetKind = 'frontend' | 'backend' | 'evidence' | 'worker' | 'static' | 'node' | 'edge' | 'serverless' | string;
export type FrontierFrameworkPackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | string;

export interface FrontierFrameworkPackageUse {
  name: string;
  purpose: string;
  optional?: boolean;
  tags?: readonly string[];
}

export interface FrontierFrameworkWorkspaceConfig {
  kind?: FrontierFrameworkWorkspaceKind;
  appsDir?: string;
  packagesDir?: string;
  frontendPackage?: string;
  backendPackage?: string;
  contractsPackage?: string;
  packageManager?: FrontierFrameworkPackageManager;
  taskRunner?: 'turbo' | 'none' | string;
}

export interface FrontierFrameworkShellConfig {
  title?: string;
  lang?: string;
  head?: string;
  bodyAttrs?: Record<string, string>;
  appRootId?: string;
}

export interface FrontierFrontendRouteConfig {
  id?: string;
  path: string;
  file: string;
  entry?: string;
  title?: string;
  feature?: string;
  owner?: string;
  reads?: readonly string[];
  writes?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkFrontendConfig {
  root?: string;
  routesDir?: string;
  componentsDir?: string;
  assetsDir?: string;
  outDir?: string;
  evidenceDir?: string;
  cacheDir?: string;
  incremental?: boolean;
  jsxImportSource?: string;
  routes?: readonly FrontierFrontendRouteConfig[];
  shell?: FrontierFrameworkShellConfig;
}

export type FrontierFrameworkRouteScenarioConsolePolicy = 'fail' | 'allow' | 'warn' | string;
export type FrontierFrameworkRouteScenarioScrollPolicy = 'required' | 'optional' | 'forbidden' | string;

export interface FrontierFrameworkRouteScenarioFixtureConfig {
  id: string;
  kind?: string;
  title?: string;
  source?: string;
  file?: string;
  files?: readonly string[];
  data?: JsonValue;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkRouteScenarioDomRoleExpectation {
  role: string;
  name?: string;
  selector?: string;
  required?: boolean;
  count?: number;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkRouteScenarioSelectorExpectation {
  selector: string;
  text?: string;
  required?: boolean;
  count?: number;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkRouteScenarioExpectation {
  redirectTo?: string;
  finalPath?: string;
  status?: number;
  domRoles?: readonly FrontierFrameworkRouteScenarioDomRoleExpectation[];
  selectors?: readonly FrontierFrameworkRouteScenarioSelectorExpectation[];
  text?: readonly string[];
  statePaths?: readonly string[];
  consoleErrors?: FrontierFrameworkRouteScenarioConsolePolicy;
  scroll?: FrontierFrameworkRouteScenarioScrollPolicy;
  metadata?: JsonObject;
}

export interface FrontierFrameworkRouteScenarioConfig {
  id: string;
  title?: string;
  route: string;
  path?: string;
  authFixture?: string;
  sessionFixture?: string;
  stateFixture?: string;
  fixtures?: readonly string[];
  feature?: string;
  owner?: string;
  expected?: FrontierFrameworkRouteScenarioExpectation;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkRouteScenariosConfig {
  enabled?: boolean;
  generatedDir?: string;
  manifestFile?: string;
  playwrightPlanFile?: string;
  fixtures?: readonly FrontierFrameworkRouteScenarioFixtureConfig[];
  scenarios?: readonly FrontierFrameworkRouteScenarioConfig[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkRouteScenarioFixture {
  id: string;
  kind: string;
  title: string;
  source?: string;
  files: string[];
  data?: JsonValue;
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioDomRole {
  role: string;
  name?: string;
  selector?: string;
  required: boolean;
  count?: number;
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioSelector {
  selector: string;
  text?: string;
  required: boolean;
  count?: number;
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioExpected {
  redirectTo?: string;
  finalPath?: string;
  status?: number;
  domRoles: FrontierFrameworkRouteScenarioDomRole[];
  selectors: FrontierFrameworkRouteScenarioSelector[];
  text: string[];
  statePaths: string[];
  consoleErrors: FrontierFrameworkRouteScenarioConsolePolicy;
  scroll: FrontierFrameworkRouteScenarioScrollPolicy;
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenario {
  id: string;
  title: string;
  route: string;
  path: string;
  authFixture?: string;
  sessionFixture?: string;
  stateFixture?: string;
  fixtures: string[];
  feature?: string;
  owner?: string;
  expected: FrontierFrameworkRouteScenarioExpected;
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioManifest {
  kind: 'frontier.framework.route-scenario.manifest';
  version: 1;
  appId: string;
  enabled: boolean;
  fixtures: FrontierFrameworkRouteScenarioFixture[];
  scenarios: FrontierFrameworkRouteScenario[];
  summary: {
    fixtureCount: number;
    scenarioCount: number;
    redirectCount: number;
    domAssertionCount: number;
  };
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioPlaywrightCase {
  id: string;
  title: string;
  route: string;
  path: string;
  url: string;
  authFixture?: string;
  sessionFixture?: string;
  stateFixture?: string;
  fixtures: string[];
  expected: FrontierFrameworkRouteScenarioExpected;
  steps: string[];
  probes: string[];
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioPlaywrightPlan {
  kind: 'frontier.framework.route-scenario.playwright-plan';
  version: 1;
  appId: string;
  baseUrl: string;
  manifest: FrontierFrameworkRouteScenarioManifest;
  cases: FrontierFrameworkRouteScenarioPlaywrightCase[];
  probes: string[];
  artifacts: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkRouteScenarioPlaywrightPlanOptions {
  baseUrl?: string;
}

export type FrontierFrameworkSurfaceKind = 'route' | 'page' | 'view' | 'component' | 'filter' | 'feature' | 'action' | 'state' | 'resource' | string;
export type FrontierFrameworkSurfaceStatus = 'untracked' | 'planned' | 'in-progress' | 'implemented' | 'verified' | 'blocked' | 'deprecated' | string;

export interface FrontierFrameworkSurfaceStatusConfig {
  id: string;
  title?: string;
  description?: string;
  terminal?: boolean;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export type FrontierFrameworkSurfaceContractKind =
  | 'evidence-ok'
  | 'no-gaps'
  | 'no-warnings'
  | 'route-comparison'
  | string;

export interface FrontierFrameworkSurfaceContractConfig {
  id?: string;
  kind?: FrontierFrameworkSurfaceContractKind;
  artifact?: string;
  route?: string;
  samplePath?: string;
  scenario?: string;
  required?: boolean;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkSurfaceContract {
  id: string;
  kind: FrontierFrameworkSurfaceContractKind;
  artifact?: string;
  route?: string;
  samplePath?: string;
  scenario?: string;
  required: boolean;
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkSurfaceConfig {
  id: string;
  kind: FrontierFrameworkSurfaceKind;
  title?: string;
  status?: FrontierFrameworkSurfaceStatus;
  aliases?: readonly string[];
  route?: string;
  feature?: string;
  owner?: string;
  files?: readonly string[];
  evidence?: readonly string[];
  dependsOn?: readonly string[];
  coverage?: readonly FrontierFrameworkSurfaceCoverageProbeKind[];
  contracts?: readonly FrontierFrameworkSurfaceContractConfig[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkSurfaceIntentScenarioConfig {
  enabled?: boolean;
  id?: string;
  title?: string;
  path?: string;
  authFixture?: string;
  sessionFixture?: string;
  stateFixture?: string;
  fixtures?: readonly string[];
  expected?: FrontierFrameworkRouteScenarioExpectation;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkSurfaceIntentConfig extends FrontierFrameworkSurfaceConfig {
  scenario?: boolean | FrontierFrameworkSurfaceIntentScenarioConfig;
}

export interface FrontierFrameworkSurfacesConfig {
  enabled?: boolean;
  generatedDir?: string;
  registryFile?: string;
  defaultStatus?: FrontierFrameworkSurfaceStatus;
  statuses?: readonly (string | FrontierFrameworkSurfaceStatusConfig)[];
  surfaces?: readonly FrontierFrameworkSurfaceConfig[];
  intents?: readonly FrontierFrameworkSurfaceIntentConfig[];
  deriveRoutes?: boolean;
  deriveFeatures?: boolean;
  coverage?: FrontierFrameworkSurfaceCoverageConfig;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkSurfaceCoverageConfig {
  enabled?: boolean;
  reportFile?: string;
  dashboardFile?: string;
  failOnMissing?: boolean;
  verifyEvidenceFiles?: boolean;
  verifyEvidenceFreshness?: boolean;
  verifyEvidenceProbeKinds?: boolean;
  evidenceRoots?: readonly string[];
  evidenceProbeTokens?: Record<string, readonly string[]>;
  focusKinds?: readonly FrontierFrameworkSurfaceKind[];
  requireEvidenceForStatuses?: readonly string[];
  requireRenderForKinds?: readonly string[];
  requireStateForKinds?: readonly string[];
  requireProbesForKinds?: Record<string, readonly FrontierFrameworkSurfaceCoverageProbeKind[]>;
}

export interface FrontierFrameworkSurfaceStatusDefinition {
  id: string;
  title: string;
  description?: string;
  terminal: boolean;
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkSurfaceRecord {
  id: string;
  kind: FrontierFrameworkSurfaceKind;
  title: string;
  status: FrontierFrameworkSurfaceStatus;
  aliases: string[];
  route?: string;
  feature?: string;
  owner?: string;
  files: string[];
  evidence: string[];
  dependsOn: string[];
  coverage: string[];
  contracts: FrontierFrameworkSurfaceContract[];
  source: 'config' | 'route' | 'feature';
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkSurfaceRegistry {
  kind: 'frontier.framework.surface-status.registry';
  version: 1;
  appId: string;
  enabled: boolean;
  statuses: FrontierFrameworkSurfaceStatusDefinition[];
  surfaces: FrontierFrameworkSurfaceRecord[];
  summary: {
    surfaceCount: number;
    statusCounts: Record<string, number>;
    kindCounts: Record<string, number>;
    verifiedCount: number;
    evidenceLinkedCount: number;
  };
  tags: string[];
  metadata: JsonObject;
}

export interface FrontierFrameworkSurfaceStatusQuery {
  ref?: string;
  id?: string;
  kind?: FrontierFrameworkSurfaceKind;
  route?: string;
  feature?: string;
  owner?: string;
  status?: FrontierFrameworkSurfaceStatus;
  tags?: readonly string[];
}

export interface FrontierFrameworkSurfaceStatusReport {
  kind: 'frontier.framework.surface-status.report';
  version: 1;
  appId: string;
  query: FrontierFrameworkSurfaceStatusQuery;
  surfaces: FrontierFrameworkSurfaceRecord[];
  coverage?: FrontierFrameworkSurfaceStatusCoverageSnapshot;
  summary: {
    matchCount: number;
    statusCounts: Record<string, number>;
    kindCounts: Record<string, number>;
    verifiedCount: number;
    terminalCount: number;
    untrackedCount: number;
    evidenceLinkedCount: number;
  };
}

export type FrontierFrameworkSurfaceCoverageProbeKind = 'evidence' | 'render' | 'state' | string;
export type FrontierFrameworkSurfaceCoverageProbeStatus = 'covered' | 'missing' | 'planned';

export interface FrontierFrameworkSurfaceCoverageProbe {
  id: string;
  kind: FrontierFrameworkSurfaceCoverageProbeKind;
  status: FrontierFrameworkSurfaceCoverageProbeStatus;
  source: 'surface-evidence' | 'route-scenario' | 'generated-plan' | 'state-path' | 'none' | string;
  route?: string;
  artifact?: string;
  statePath?: string;
  tags: string[];
}

export interface FrontierFrameworkSurfaceCoverageProbePlan {
  id: string;
  surfaceId: string;
  kind: FrontierFrameworkSurfaceCoverageProbeKind;
  status: Exclude<FrontierFrameworkSurfaceCoverageProbeStatus, 'covered'>;
  command: string;
  reason: string;
  route?: string;
  artifact?: string;
  statePath?: string;
  tags: string[];
}

export type FrontierFrameworkSurfaceContractProofStatus = 'passed' | 'failed' | 'missing' | 'planned';

export interface FrontierFrameworkSurfaceContractProof {
  id: string;
  contractId: string;
  kind: FrontierFrameworkSurfaceContractKind;
  status: FrontierFrameworkSurfaceContractProofStatus;
  required: boolean;
  artifact?: string;
  route?: string;
  samplePath?: string;
  scenario?: string;
  message: string;
  tags: string[];
}

export interface FrontierFrameworkSurfaceStatusCoverageRecord {
  surfaceId: string;
  ok: boolean;
  required: string[];
  covered: string[];
  missing: string[];
  nextCommand: string;
  nextProbes: FrontierFrameworkSurfaceCoverageProbePlan[];
}

export interface FrontierFrameworkSurfaceStatusCoverageSnapshot {
  enabled: boolean;
  ok: boolean;
  missingCount: number;
  nextProbeCount: number;
  records: FrontierFrameworkSurfaceStatusCoverageRecord[];
}

export interface FrontierFrameworkSurfaceCoverageAcceptance {
  kind: 'frontier.framework.surface-coverage.acceptance';
  run: FrontierTestRunRecord;
  proof: FrontierTestProof;
  evidence: FrontierTestEvidenceRecord;
}

export interface FrontierFrameworkSurfaceCoverageRecord {
  surface: FrontierFrameworkSurfaceRecord;
  required: string[];
  covered: string[];
  missing: string[];
  probes: FrontierFrameworkSurfaceCoverageProbe[];
  nextProbes: FrontierFrameworkSurfaceCoverageProbePlan[];
  contracts: FrontierFrameworkSurfaceContract[];
  contractProofs: FrontierFrameworkSurfaceContractProof[];
  ok: boolean;
  hints: string[];
}

export interface FrontierFrameworkSurfaceCoverageReport {
  kind: 'frontier.framework.surface-coverage.report';
  version: 1;
  appId: string;
  enabled: boolean;
  ok: boolean;
  reportFile: string;
  dashboardFile: string;
  failOnMissing: boolean;
  requiredStatuses: string[];
  records: FrontierFrameworkSurfaceCoverageRecord[];
  dashboard: {
    byKind: Record<string, { total: number; ok: number; missing: number; evidenceLinked: number }>;
    byStatus: Record<string, { total: number; ok: number; missing: number; evidenceLinked: number }>;
    byRoute: Array<{ route: string; total: number; ok: number; missing: number; surfaces: string[] }>;
    byProbe: Record<string, { total: number; covered: number; missing: number; planned: number; surfaces: string[] }>;
    byContract: Record<string, { total: number; passed: number; failed: number; missing: number; planned: number; surfaces: string[] }>;
  };
  summary: {
    surfaceCount: number;
    requiredSurfaceCount: number;
    okCount: number;
    missingCount: number;
    plannedProbeCount: number;
    coveredProbeCount: number;
    missingProbeCount: number;
    nextProbeCount: number;
    evidenceLinkedCount: number;
    contractCount: number;
    passedContractCount: number;
    failedContractCount: number;
    missingContractCount: number;
    plannedContractCount: number;
  };
  acceptance?: FrontierFrameworkSurfaceCoverageAcceptance;
}

export interface FrontierFrameworkAgentLoopSurface {
  id: string;
  kind: FrontierFrameworkSurfaceKind;
  title: string;
  status: FrontierFrameworkSurfaceStatus;
  route?: string;
  feature?: string;
  owner?: string;
  ok: boolean;
  required: string[];
  missing: string[];
  covered: string[];
  evidence: string[];
  probes: FrontierFrameworkSurfaceCoverageProbe[];
  nextProbes: FrontierFrameworkSurfaceCoverageProbePlan[];
  contracts: FrontierFrameworkSurfaceContract[];
  contractProofs: FrontierFrameworkSurfaceContractProof[];
  nextCommand: string;
  hint?: string;
  tags: string[];
}

export type FrontierFrameworkAgentLoopWorkKind = 'missing-probe' | 'planned-probe' | 'surface-inspection' | string;

export interface FrontierFrameworkAgentLoopWorkItem {
  id: string;
  priority: number;
  kind: FrontierFrameworkAgentLoopWorkKind;
  surfaceId: string;
  surfaceKind: FrontierFrameworkSurfaceKind;
  surfaceStatus: FrontierFrameworkSurfaceStatus;
  title: string;
  route?: string;
  feature?: string;
  owner?: string;
  probeKind?: FrontierFrameworkSurfaceCoverageProbeKind;
  command: string;
  reason: string;
  required: boolean;
  artifacts: string[];
  acceptance: string[];
  tags: string[];
}

export interface FrontierFrameworkAgentLoopReport {
  kind: 'frontier.framework.agent-loop.report';
  version: 1;
  appId: string;
  generatedAt: string;
  ok: boolean;
  strict: boolean;
  query: FrontierFrameworkSurfaceStatusQuery;
  focusKinds: string[];
  status: FrontierFrameworkSurfaceStatusReport;
  coverage: FrontierFrameworkSurfaceCoverageReport;
  dashboard: {
    byKind: FrontierFrameworkSurfaceCoverageReport['dashboard']['byKind'];
    byStatus: FrontierFrameworkSurfaceCoverageReport['dashboard']['byStatus'];
    byRoute: FrontierFrameworkSurfaceCoverageReport['dashboard']['byRoute'];
    focus: Record<string, { total: number; ok: number; missing: number; next: string[] }>;
  };
  next: FrontierFrameworkAgentLoopSurface[];
  missing: FrontierFrameworkAgentLoopSurface[];
  workQueue: FrontierFrameworkAgentLoopWorkItem[];
  commands: Array<{
    id: string;
    command: string;
    required: boolean;
    produces: string[];
    tags: string[];
  }>;
  artifacts: {
    registry: string;
    coverage: string;
    dashboard: string;
    loop: string;
    loopDashboard: string;
  };
  summary: {
    matchedSurfaces: number;
    claimedSurfaces: number;
    missingSurfaces: number;
    nextSurfaceCount: number;
    coveredProbes: number;
    missingProbes: number;
    plannedProbes: number;
    failedContracts: number;
    missingContracts: number;
    nextProbes: number;
    workItems: number;
    requiredWorkItems: number;
  };
}

export interface FrontierFrameworkComponentPreviewConfig {
  enabled?: boolean;
  rootDir?: string;
  outDir?: string;
  include?: readonly string[];
  exclude?: readonly string[];
  extensions?: readonly string[];
  packageName?: string;
  renderer?: FrontierPreviewRenderer;
  generatedAt?: number;
  defaultVariants?: readonly FrontierPreviewVariantInput[];
  integrations?: FrontierPreviewIntegrationFlags;
  manifestFileName?: string;
  moduleFileName?: string;
  htmlFileName?: string;
  title?: string;
  maxFiles?: number;
}

export interface FrontierFrameworkDocumentationConfig {
  enabled?: boolean;
  rootDir?: string;
  outDir?: string;
  include?: readonly string[];
  exclude?: readonly string[];
  packageName?: string;
  packageVersion?: string;
  generatedAt?: number;
  integrations?: FrontierDocumentationIntegrationFlags;
  manifestFileName?: string;
  moduleFileName?: string;
  htmlFileName?: string;
  searchFileName?: string;
  evidenceFileName?: string;
  jsonlFileName?: string;
  title?: string;
  maxFiles?: number;
}

export interface FrontierBackendEndpointConfig {
  id?: string;
  path: string;
  method?: string;
  file?: string;
  feature?: string;
  owner?: string;
  reads?: readonly string[];
  writes?: readonly string[];
  effects?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export type FrontierFrameworkTransportKind =
  | 'fetch'
  | 'http'
  | 'websocket'
  | 'sse'
  | 'crdt-sync'
  | 'crdt-websocket'
  | 'realtime'
  | 'realtime-websocket'
  | 'event-log'
  | 'state-cache'
  | 'worker'
  | 'custom'
  | string;

export type FrontierFrameworkTransportProtocol =
  | 'fetch'
  | 'http'
  | 'websocket'
  | 'sse'
  | 'broadcast-channel'
  | 'post-message'
  | 'worker'
  | 'custom'
  | string;

export interface FrontierFrameworkBackendTransportConfig {
  id?: string;
  kind: FrontierFrameworkTransportKind;
  protocol?: FrontierFrameworkTransportProtocol;
  path?: string;
  package?: string;
  adapter?: string;
  runtime?: string;
  feature?: string;
  owner?: string;
  required?: boolean;
  reads?: readonly string[];
  writes?: readonly string[];
  effects?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkBackendConfig {
  root?: string;
  entry?: string;
  outDir?: string;
  handlerExport?: string;
  adapters?: readonly string[];
  endpoints?: readonly FrontierBackendEndpointConfig[];
  transports?: readonly FrontierFrameworkBackendTransportConfig[];
}

export interface FrontierFrameworkViteDevServerConfig {
  host?: string;
  port?: number;
  open?: boolean;
  hmr?: boolean;
}

export interface FrontierFrameworkViteConfig {
  enabled?: boolean;
  hmr?: boolean;
  configFile?: string;
  generatedEntryDir?: string;
  outDir?: string;
  plugin?: 'frontier-framework' | 'frontier-dom' | 'none' | string;
  strict?: boolean;
  devServer?: FrontierFrameworkViteDevServerConfig;
}

export interface FrontierFrameworkDevtoolsConfig {
  enabled?: boolean;
  floatingButton?: boolean;
  globalName?: string;
  bridgeGlobalName?: string;
  scriptPath?: string;
  rewind?: boolean;
  timeline?: boolean;
  telemetry?: boolean;
  stateSnapshots?: boolean;
  patches?: boolean;
  crdt?: boolean;
  eventLog?: boolean;
  traces?: boolean;
  autoBridge?: boolean;
  maxRecords?: number;
  includeInBuild?: boolean;
}

export interface FrontierFrameworkTelemetryConfig {
  enabled?: boolean;
  logging?: boolean;
  trace?: boolean;
  inspect?: boolean;
  redaction?: boolean;
  jsonl?: boolean;
  sinks?: readonly string[];
}

export interface FrontierFrameworkAuthConfig {
  enabled?: boolean;
  generatedDir?: string;
  manifestFile?: string;
  evidenceFile?: string;
  strict?: boolean;
  failOnMissingGate?: boolean;
  sessionStrategy?: FrontierAuthSessionStrategy;
  providers?: readonly FrontierAuthProviderInput[];
  session?: FrontierAuthManifestInput['session'];
  profile?: FrontierAuthProfileRequirementInput;
  linking?: FrontierAuthLinkingPolicyInput;
  gates?: readonly FrontierAuthGateInput[];
  routeGuards?: readonly FrontierAuthGateInput[];
  capabilities?: readonly FrontierAuthCapabilityInput[];
  tokenContracts?: readonly FrontierAuthTokenContractInput[];
  runtimeGrants?: readonly FrontierAuthRuntimeGrantInput[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export type FrontierFrameworkMigrationSourceKind =
  | 'state'
  | 'sync-snapshot'
  | 'crdt-snapshot'
  | 'state-cache'
  | 'query-cache'
  | 'event-log-snapshot'
  | 'dom-state'
  | 'custom'
  | string;

export interface FrontierFrameworkMigrationSourceConfig {
  id?: string;
  kind: FrontierFrameworkMigrationSourceKind;
  source?: string;
  required?: boolean;
  versionPath?: string | false;
  dataVersionPaths?: readonly string[];
  writeDataVersionPaths?: readonly string[];
  payloadPath?: string | false;
  payloadPaths?: readonly string[];
  targetVersion?: string;
  metadata?: JsonObject;
}

export interface FrontierFrameworkMigrationsConfig {
  enabled?: boolean;
  currentVersion?: string;
  initialVersion?: string;
  registryId?: string;
  generatedDir?: string;
  evidenceFile?: string;
  runtimeBridgeFile?: string;
  strict?: boolean;
  failOnMissingVersion?: boolean;
  autoMigrateState?: boolean;
  autoMigrateCache?: boolean;
  sources?: readonly FrontierFrameworkMigrationSourceConfig[];
}

export type FrontierFrameworkSourcePolicyEnforcement = 'warn' | 'error' | string;
export type FrontierFrameworkSourcePolicyPreset = 'adapter' | 'app-wide' | 'strict-app' | 'migration' | string;
export type FrontierFrameworkSourcePolicyLocalImportExtensions = 'source' | 'runtime' | 'off' | string;
export type FrontierFrameworkRuntimeModuleKind =
  | 'dom-events'
  | 'form-actions'
  | 'tool-surface'
  | 'offline-snapshot'
  | 'test-api'
  | 'canvas-tools'
  | 'dnd'
  | 'collaboration'
  | string;

export interface FrontierFrameworkRuntimeModuleBindingConfig {
  kind: FrontierFrameworkRuntimeModuleKind;
  target?: string;
  events?: readonly string[];
  actions?: readonly string[];
  tools?: readonly string[];
  snapshots?: readonly string[];
  tests?: readonly string[];
  reads?: readonly string[];
  writes?: readonly string[];
  capabilities?: readonly string[];
  evidence?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkRuntimeModuleBindingInput extends Omit<FrontierFrameworkRuntimeModuleBindingConfig, 'kind'> {
  kind?: FrontierFrameworkRuntimeModuleKind;
}

export interface FrontierFrameworkRuntimeModuleConfig {
  id: string;
  kind?: FrontierFrameworkRuntimeModuleKind;
  title?: string;
  file?: string;
  files?: readonly string[];
  owner?: string;
  owns?: readonly FrontierFrameworkRuntimeModuleKind[];
  bindings?: readonly FrontierFrameworkRuntimeModuleBindingConfig[];
  reads?: readonly string[];
  writes?: readonly string[];
  actions?: readonly string[];
  effects?: readonly string[];
  capabilities?: readonly string[];
  evidence?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkSourcePolicyConfig {
  enabled?: boolean;
  preset?: FrontierFrameworkSourcePolicyPreset;
  enforcement?: FrontierFrameworkSourcePolicyEnforcement;
  maxFrontierComponentsPerFile?: number | false;
  maxLinesPerFile?: number | false;
  maxCharsPerFile?: number | false;
  localImportExtensions?: FrontierFrameworkSourcePolicyLocalImportExtensions;
  businessLogic?: boolean;
  businessLogicSeverity?: 'error' | 'warning' | 'info' | 'hint' | string;
  sourceGraphFile?: string;
  sourceGraphRegistryFile?: string;
  frontendRouteRoots?: readonly string[];
  frontendComponentRoots?: readonly string[];
  backendHandlerRoots?: readonly string[];
  domainRoots?: readonly string[];
  generatedRoots?: readonly string[];
  forbiddenAdapterCalls?: readonly string[];
  allowedAdapterDeclarations?: readonly string[];
  include?: readonly string[];
  exclude?: readonly string[];
  runtimeModules?: readonly FrontierFrameworkRuntimeModuleConfig[];
  metadata?: JsonObject;
}

export type FrontierFrameworkConformanceMode = 'off' | 'migration' | 'recommended' | 'strict' | string;
export type FrontierFrameworkConformanceEnforcement = 'warn' | 'error' | string;
export type FrontierFrameworkRequiredPackageUseMode = 'dependency' | 'import' | 'dependency-or-import' | string;

export interface FrontierFrameworkRequiredPackageUseConfig {
  id?: string;
  package: string;
  mode?: FrontierFrameworkRequiredPackageUseMode;
  required?: boolean;
  perSource?: boolean;
  reason?: string;
  resourceKinds?: readonly string[];
  resourceTags?: readonly string[];
  filePatterns?: readonly string[];
  importPatterns?: readonly string[];
  textPatterns?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkConformanceConfig {
  enabled?: boolean;
  mode?: FrontierFrameworkConformanceMode;
  enforcement?: FrontierFrameworkConformanceEnforcement;
  failOnViolation?: boolean;
  generatedDir?: string;
  reportFile?: string;
  sarifFile?: string;
  requiredPackageUses?: readonly FrontierFrameworkRequiredPackageUseConfig[];
  metadata?: JsonObject;
}

export type FrontierFrameworkHarnessMode = 'off' | 'recommended' | 'strict';
export type FrontierFrameworkHarnessAutoRun = 'off' | 'plan' | 'required';
export type FrontierFrameworkHarnessCommandKind = 'test' | 'fuzz' | 'benchmark' | 'browser' | 'lint' | 'evidence' | 'agent' | string;

export interface FrontierFrameworkHarnessCommandConfig {
  id: string;
  kind: FrontierFrameworkHarnessCommandKind;
  command: string;
  required?: boolean;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkHarnessGateConfig {
  required?: boolean;
  command?: string;
  files?: readonly string[];
  packages?: readonly string[];
  tags?: readonly string[];
}

export interface FrontierFrameworkHarnessConfig {
  mode?: FrontierFrameworkHarnessMode;
  strict?: boolean;
  failOnMissing?: boolean;
  generatedDir?: string;
  evidenceDir?: string;
  corpusDir?: string;
  fixturesDir?: string;
  autoRun?: FrontierFrameworkHarnessAutoRun;
  replayFailures?: boolean;
  minimizeCorpus?: boolean;
  browserTrace?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry' | string;
  tests?: FrontierFrameworkHarnessGateConfig;
  fuzzers?: FrontierFrameworkHarnessGateConfig;
  benchmarks?: FrontierFrameworkHarnessGateConfig;
  browser?: FrontierFrameworkHarnessGateConfig;
  agentKit?: FrontierFrameworkHarnessGateConfig;
  linter?: FrontierFrameworkHarnessGateConfig;
  hybrid?: FrontierFrameworkHarnessGateConfig;
  commands?: readonly FrontierFrameworkHarnessCommandConfig[];
}

export type FrontierFrameworkAgentHandoffMode = 'advisory' | 'required' | 'strict' | string;

export interface FrontierFrameworkAgentCheckpointConfig {
  id: string;
  title: string;
  source?: 'config' | 'feature' | 'evidence' | 'harness' | 'test' | 'handoff' | string;
  required?: boolean;
  query?: string;
  command?: string;
  artifacts?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkAgentConfig {
  enabled?: boolean;
  generatedDir?: string;
  manifestDir?: string;
  runsDir?: string;
  runbookFile?: string;
  handoffFile?: string;
  requireFeatureManifest?: boolean;
  requireEvidence?: boolean;
  requireHarness?: boolean;
  requireProof?: boolean;
  requireCleanScope?: boolean;
  handoffMode?: FrontierFrameworkAgentHandoffMode;
  maxOpenQuestions?: number;
  checkpoints?: readonly FrontierFrameworkAgentCheckpointConfig[];
}

export interface FrontierFrameworkDeployTarget {
  id: string;
  kind?: FrontierFrameworkTargetKind;
  target?: 'frontend' | 'backend' | 'evidence' | string;
  runtime?: string;
  output?: string;
  command?: string;
  adapter?: string;
  env?: readonly string[];
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkDeployConfig {
  frontend?: readonly FrontierFrameworkDeployTarget[];
  backend?: readonly FrontierFrameworkDeployTarget[];
  evidence?: readonly FrontierFrameworkDeployTarget[];
}

export interface FrontierFrameworkFeatureConfig {
  id: string;
  title?: string;
  routes?: readonly string[];
  endpoints?: readonly string[];
  actions?: readonly string[];
  state?: readonly string[];
  owner?: string;
  tags?: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkConfig {
  id?: string;
  name?: string;
  root?: string;
  workspace?: FrontierFrameworkWorkspaceConfig;
  frontend?: FrontierFrameworkFrontendConfig;
  routeScenarios?: FrontierFrameworkRouteScenariosConfig;
  surfaces?: FrontierFrameworkSurfacesConfig;
  componentPreview?: FrontierFrameworkComponentPreviewConfig;
  documentation?: FrontierFrameworkDocumentationConfig;
  backend?: FrontierFrameworkBackendConfig;
  vite?: FrontierFrameworkViteConfig;
  devtools?: FrontierFrameworkDevtoolsConfig;
  telemetry?: FrontierFrameworkTelemetryConfig;
  auth?: FrontierFrameworkAuthConfig;
  migrations?: FrontierFrameworkMigrationsConfig;
  sourcePolicy?: FrontierFrameworkSourcePolicyConfig;
  conformance?: FrontierFrameworkConformanceConfig;
  harness?: FrontierFrameworkHarnessConfig;
  agent?: FrontierFrameworkAgentConfig;
  deploy?: FrontierFrameworkDeployConfig;
  features?: readonly FrontierFrameworkFeatureConfig[];
  packages?: readonly FrontierFrameworkPackageUse[];
  metadata?: JsonObject;
}

export const FRONTIER_FRAMEWORK_CONFIG_SCHEMA_ID = 'frontier.framework.config.schema.v1';

export type FrontierFrameworkConfigDiagnosticSeverity = 'error' | 'warning' | 'info';
export type FrontierFrameworkConfigDiagnosticSource = 'schema' | 'semantic';

export interface FrontierFrameworkConfigDiagnostic {
  id: string;
  severity: FrontierFrameworkConfigDiagnosticSeverity;
  source: FrontierFrameworkConfigDiagnosticSource;
  path: string;
  message: string;
  expected?: string;
  actual?: string;
  suggestedFix?: string;
  tags?: readonly string[];
}

export interface FrontierFrameworkConfigExplainEntry {
  path: string;
  type: string;
  default?: JsonValue;
  description: string;
  suggestedFix?: string;
  examples?: readonly JsonValue[];
  tags?: readonly string[];
}

export interface FrontierFrameworkConfigValidationOptions {
  maxDiagnostics?: number;
  explain?: boolean;
}

export interface FrontierFrameworkConfigValidationResult {
  kind: 'frontier.framework.config.validation';
  appId?: string;
  ok: boolean;
  schemaValid: boolean;
  generatedAt: string;
  schema: {
    id: typeof FRONTIER_FRAMEWORK_CONFIG_SCHEMA_ID;
    package: typeof FRONTIER_FRAMEWORK_PACKAGE_NAME;
    version: 1;
  };
  diagnostics: FrontierFrameworkConfigDiagnostic[];
  explain: readonly FrontierFrameworkConfigExplainEntry[];
}

const stringArraySchema: JsonSchemaContract = { type: 'array', items: { type: 'string', minLength: 1 } };
const metadataSchema: JsonSchemaContract = { type: 'object', additionalProperties: true };
const surfaceContractArraySchema: JsonSchemaContract = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: true,
    properties: {
      id: { type: 'string', minLength: 1 },
      kind: { type: 'string', minLength: 1 },
      artifact: { type: 'string', minLength: 1 },
      route: { type: 'string', minLength: 1 },
      samplePath: { type: 'string', minLength: 1 },
      scenario: { type: 'string', minLength: 1 },
      required: { type: 'boolean' },
      tags: stringArraySchema,
      metadata: metadataSchema
    }
  }
};
const harnessGateSchema: JsonSchemaContract = {
  type: 'object',
  additionalProperties: true,
  properties: {
    required: { type: 'boolean' },
    command: { type: 'string', minLength: 1 },
    files: stringArraySchema,
    packages: stringArraySchema,
    tags: stringArraySchema
  }
};
const deployTargetSchema: JsonSchemaContract = {
  type: 'object',
  additionalProperties: true,
  required: ['id'],
  properties: {
    id: { type: 'string', minLength: 1 },
    kind: { type: 'string', minLength: 1 },
    target: { type: 'string', minLength: 1 },
    runtime: { type: 'string', minLength: 1 },
    output: { type: 'string', minLength: 1 },
    command: { type: 'string', minLength: 1 },
    adapter: { type: 'string', minLength: 1 },
    env: stringArraySchema,
    tags: stringArraySchema,
    metadata: metadataSchema
  }
};

export const FRONTIER_FRAMEWORK_CONFIG_SCHEMA: JsonSchemaContract = {
  type: 'object',
  additionalProperties: true,
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    root: { type: 'string', minLength: 1 },
    workspace: {
      type: 'object',
      additionalProperties: true,
      properties: {
        kind: { type: 'string', minLength: 1 },
        appsDir: { type: 'string', minLength: 1 },
        packagesDir: { type: 'string', minLength: 1 },
        frontendPackage: { type: 'string', minLength: 1 },
        backendPackage: { type: 'string', minLength: 1 },
        contractsPackage: { type: 'string', minLength: 1 },
        packageManager: { type: 'string', minLength: 1 },
        taskRunner: { type: 'string', minLength: 1 }
      }
    },
    frontend: {
      type: 'object',
      additionalProperties: true,
      properties: {
        root: { type: 'string', minLength: 1 },
        routesDir: { type: 'string', minLength: 1 },
        componentsDir: { type: 'string', minLength: 1 },
        assetsDir: { type: 'string', minLength: 1 },
        outDir: { type: 'string', minLength: 1 },
        evidenceDir: { type: 'string', minLength: 1 },
        cacheDir: { type: 'string', minLength: 1 },
        incremental: { type: 'boolean' },
        jsxImportSource: { type: 'string', minLength: 1 },
        shell: {
          type: 'object',
          additionalProperties: true,
          properties: {
            title: { type: 'string', minLength: 1 },
            lang: { type: 'string', minLength: 1 },
            head: { type: 'string' },
            bodyAttrs: metadataSchema,
            appRootId: { type: 'string', minLength: 1 }
          }
        },
        routes: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['path', 'file'],
            properties: {
              id: { type: 'string', minLength: 1 },
              path: { type: 'string', minLength: 1 },
              file: { type: 'string', minLength: 1 },
              entry: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              feature: { type: 'string', minLength: 1 },
              owner: { type: 'string', minLength: 1 },
              reads: stringArraySchema,
              writes: stringArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        }
      }
    },
    routeScenarios: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        generatedDir: { type: 'string', minLength: 1 },
        manifestFile: { type: 'string', minLength: 1 },
        playwrightPlanFile: { type: 'string', minLength: 1 },
        fixtures: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              source: { type: 'string', minLength: 1 },
              file: { type: 'string', minLength: 1 },
              files: stringArraySchema,
              data: {},
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        scenarios: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id', 'route'],
            properties: {
              id: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              route: { type: 'string', minLength: 1 },
              path: { type: 'string', minLength: 1 },
              authFixture: { type: 'string', minLength: 1 },
              sessionFixture: { type: 'string', minLength: 1 },
              stateFixture: { type: 'string', minLength: 1 },
              fixtures: stringArraySchema,
              feature: { type: 'string', minLength: 1 },
              owner: { type: 'string', minLength: 1 },
              expected: {
                type: 'object',
                additionalProperties: true,
                properties: {
                  redirectTo: { type: 'string', minLength: 1 },
                  finalPath: { type: 'string', minLength: 1 },
                  status: { type: 'integer', minimum: 100, maximum: 599 },
                  domRoles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: true,
                      required: ['role'],
                      properties: {
                        role: { type: 'string', minLength: 1 },
                        name: { type: 'string', minLength: 1 },
                        selector: { type: 'string', minLength: 1 },
                        required: { type: 'boolean' },
                        count: { type: 'integer', minimum: 0 },
                        tags: stringArraySchema,
                        metadata: metadataSchema
                      }
                    }
                  },
                  selectors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: true,
                      required: ['selector'],
                      properties: {
                        selector: { type: 'string', minLength: 1 },
                        text: { type: 'string', minLength: 1 },
                        required: { type: 'boolean' },
                        count: { type: 'integer', minimum: 0 },
                        tags: stringArraySchema,
                        metadata: metadataSchema
                      }
                    }
                  },
                  text: stringArraySchema,
                  statePaths: stringArraySchema,
                  consoleErrors: { type: 'string', minLength: 1 },
                  scroll: { type: 'string', minLength: 1 },
                  metadata: metadataSchema
                }
              },
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        tags: stringArraySchema,
        metadata: metadataSchema
      }
    },
    surfaces: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        generatedDir: { type: 'string', minLength: 1 },
        registryFile: { type: 'string', minLength: 1 },
        defaultStatus: { type: 'string', minLength: 1 },
        statuses: { type: 'array', items: {} },
        deriveRoutes: { type: 'boolean' },
        deriveFeatures: { type: 'boolean' },
        coverage: {
          type: 'object',
          additionalProperties: true,
          properties: {
            enabled: { type: 'boolean' },
            reportFile: { type: 'string', minLength: 1 },
            dashboardFile: { type: 'string', minLength: 1 },
            failOnMissing: { type: 'boolean' },
            verifyEvidenceFiles: { type: 'boolean' },
            verifyEvidenceFreshness: { type: 'boolean' },
            verifyEvidenceProbeKinds: { type: 'boolean' },
            evidenceRoots: stringArraySchema,
            evidenceProbeTokens: {
              type: 'object',
              additionalProperties: stringArraySchema
            },
            focusKinds: stringArraySchema,
            requireEvidenceForStatuses: stringArraySchema,
            requireRenderForKinds: stringArraySchema,
            requireStateForKinds: stringArraySchema,
            requireProbesForKinds: {
              type: 'object',
              additionalProperties: stringArraySchema
            }
          }
        },
        surfaces: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id', 'kind'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              status: { type: 'string', minLength: 1 },
              aliases: stringArraySchema,
              route: { type: 'string', minLength: 1 },
              feature: { type: 'string', minLength: 1 },
              owner: { type: 'string', minLength: 1 },
              files: stringArraySchema,
              evidence: stringArraySchema,
              dependsOn: stringArraySchema,
              coverage: stringArraySchema,
              contracts: surfaceContractArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        intents: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id', 'kind'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              status: { type: 'string', minLength: 1 },
              aliases: stringArraySchema,
              route: { type: 'string', minLength: 1 },
              feature: { type: 'string', minLength: 1 },
              owner: { type: 'string', minLength: 1 },
              files: stringArraySchema,
              evidence: stringArraySchema,
              dependsOn: stringArraySchema,
              coverage: stringArraySchema,
              contracts: surfaceContractArraySchema,
              scenario: {
                type: ['boolean', 'object'],
                additionalProperties: true,
                properties: {
                  enabled: { type: 'boolean' },
                  id: { type: 'string', minLength: 1 },
                  title: { type: 'string', minLength: 1 },
                  path: { type: 'string', minLength: 1 },
                  authFixture: { type: 'string', minLength: 1 },
                  sessionFixture: { type: 'string', minLength: 1 },
                  stateFixture: { type: 'string', minLength: 1 },
                  fixtures: stringArraySchema,
                  expected: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      redirectTo: { type: 'string', minLength: 1 },
                      finalPath: { type: 'string', minLength: 1 },
                      status: { type: 'integer', minimum: 100, maximum: 599 },
                      domRoles: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: true,
                          required: ['role'],
                          properties: {
                            role: { type: 'string', minLength: 1 },
                            name: { type: 'string', minLength: 1 },
                            selector: { type: 'string', minLength: 1 },
                            required: { type: 'boolean' },
                            count: { type: 'integer', minimum: 0 },
                            tags: stringArraySchema,
                            metadata: metadataSchema
                          }
                        }
                      },
                      selectors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: true,
                          required: ['selector'],
                          properties: {
                            selector: { type: 'string', minLength: 1 },
                            text: { type: 'string', minLength: 1 },
                            required: { type: 'boolean' },
                            count: { type: 'integer', minimum: 0 },
                            tags: stringArraySchema,
                            metadata: metadataSchema
                          }
                        }
                      },
                      text: stringArraySchema,
                      statePaths: stringArraySchema,
                      consoleErrors: { type: 'string', minLength: 1 },
                      scroll: { type: 'string', minLength: 1 },
                      metadata: metadataSchema
                    }
                  },
                  tags: stringArraySchema,
                  metadata: metadataSchema
                }
              },
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        tags: stringArraySchema,
        metadata: metadataSchema
      }
    },
    componentPreview: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        rootDir: { type: 'string', minLength: 1 },
        outDir: { type: 'string', minLength: 1 },
        include: stringArraySchema,
        exclude: stringArraySchema,
        extensions: stringArraySchema,
        packageName: { type: 'string', minLength: 1 },
        renderer: { type: 'string', minLength: 1 },
        generatedAt: { type: 'integer', minimum: 0 },
        defaultVariants: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            properties: {
              id: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              viewport: { type: 'string', minLength: 1 },
              theme: { type: 'string', minLength: 1 },
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        integrations: {
          type: 'object',
          additionalProperties: true,
          properties: {
            autoDiscovery: { type: 'boolean' },
            vite: { type: 'boolean' },
            browserBook: { type: 'boolean' },
            inspector: { type: 'boolean' },
            stateBridge: { type: 'boolean' },
            crdtTimeline: { type: 'boolean' },
            eventLogReplay: { type: 'boolean' },
            telemetry: { type: 'boolean' },
            browserEvidence: { type: 'boolean' },
            fuzz: { type: 'boolean' },
            benchmarks: { type: 'boolean' }
          }
        },
        manifestFileName: { type: 'string', minLength: 1 },
        moduleFileName: { type: 'string', minLength: 1 },
        htmlFileName: { type: 'string', minLength: 1 },
        title: { type: 'string', minLength: 1 },
        maxFiles: { type: 'integer', minimum: 1 }
      }
    },
    documentation: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        rootDir: { type: 'string', minLength: 1 },
        outDir: { type: 'string', minLength: 1 },
        include: stringArraySchema,
        exclude: stringArraySchema,
        packageName: { type: 'string', minLength: 1 },
        packageVersion: { type: 'string', minLength: 1 },
        generatedAt: { type: 'integer', minimum: 0 },
        integrations: {
          type: 'object',
          additionalProperties: true,
          properties: {
            autoDiscovery: { type: 'boolean' },
            packageCatalog: { type: 'boolean' },
            apiReference: { type: 'boolean' },
            guideBook: { type: 'boolean' },
            browserBook: { type: 'boolean' },
            inspector: { type: 'boolean' },
            componentPreview: { type: 'boolean' },
            routeDocs: { type: 'boolean' },
            stateDocs: { type: 'boolean' },
            migrationDocs: { type: 'boolean' },
            telemetry: { type: 'boolean' },
            browserEvidence: { type: 'boolean' },
            fuzz: { type: 'boolean' },
            benchmarks: { type: 'boolean' },
            searchIndex: { type: 'boolean' },
            agentEvidence: { type: 'boolean' }
          }
        },
        manifestFileName: { type: 'string', minLength: 1 },
        moduleFileName: { type: 'string', minLength: 1 },
        htmlFileName: { type: 'string', minLength: 1 },
        searchFileName: { type: 'string', minLength: 1 },
        evidenceFileName: { type: 'string', minLength: 1 },
        jsonlFileName: { type: 'string', minLength: 1 },
        title: { type: 'string', minLength: 1 },
        maxFiles: { type: 'integer', minimum: 1 }
      }
    },
    backend: {
      type: 'object',
      additionalProperties: true,
      properties: {
        root: { type: 'string', minLength: 1 },
        entry: { type: 'string', minLength: 1 },
        outDir: { type: 'string', minLength: 1 },
        handlerExport: { type: 'string', minLength: 1 },
        adapters: stringArraySchema,
        endpoints: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['path'],
            properties: {
              id: { type: 'string', minLength: 1 },
              path: { type: 'string', minLength: 1 },
              method: { type: 'string', minLength: 1 },
              file: { type: 'string', minLength: 1 },
              feature: { type: 'string', minLength: 1 },
              owner: { type: 'string', minLength: 1 },
              reads: stringArraySchema,
              writes: stringArraySchema,
              effects: stringArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        transports: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['kind'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              protocol: { type: 'string', minLength: 1 },
              path: { type: 'string', minLength: 1 },
              package: { type: 'string', minLength: 1 },
              adapter: { type: 'string', minLength: 1 },
              runtime: { type: 'string', minLength: 1 },
              feature: { type: 'string', minLength: 1 },
              owner: { type: 'string', minLength: 1 },
              required: { type: 'boolean' },
              reads: stringArraySchema,
              writes: stringArraySchema,
              effects: stringArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        }
      }
    },
    vite: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        hmr: { type: 'boolean' },
        configFile: { type: 'string', minLength: 1 },
        generatedEntryDir: { type: 'string', minLength: 1 },
        outDir: { type: 'string', minLength: 1 },
        plugin: { type: 'string', minLength: 1 },
        strict: { type: 'boolean' },
        devServer: {
          type: 'object',
          additionalProperties: true,
          properties: {
            host: { type: 'string', minLength: 1 },
            port: { type: 'integer', minimum: 1, maximum: 65535 },
            open: { type: 'boolean' },
            hmr: { type: 'boolean' }
          }
        }
      }
    },
    devtools: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        floatingButton: { type: 'boolean' },
        globalName: { type: 'string', minLength: 1 },
        bridgeGlobalName: { type: 'string', minLength: 1 },
        scriptPath: { type: 'string', minLength: 1 },
        rewind: { type: 'boolean' },
        timeline: { type: 'boolean' },
        telemetry: { type: 'boolean' },
        stateSnapshots: { type: 'boolean' },
        patches: { type: 'boolean' },
        crdt: { type: 'boolean' },
        eventLog: { type: 'boolean' },
        traces: { type: 'boolean' },
        autoBridge: { type: 'boolean' },
        maxRecords: { type: 'integer', minimum: 1 },
        includeInBuild: { type: 'boolean' }
      }
    },
    telemetry: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        logging: { type: 'boolean' },
        trace: { type: 'boolean' },
        inspect: { type: 'boolean' },
        redaction: { type: 'boolean' },
        jsonl: { type: 'boolean' },
        sinks: stringArraySchema
      }
    },
    auth: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        generatedDir: { type: 'string', minLength: 1 },
        manifestFile: { type: 'string', minLength: 1 },
        evidenceFile: { type: 'string', minLength: 1 },
        strict: { type: 'boolean' },
        failOnMissingGate: { type: 'boolean' },
        sessionStrategy: { type: 'string', minLength: 1 },
        providers: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              issuer: { type: 'string', minLength: 1 },
              authorizationEndpoint: { type: 'string', minLength: 1 },
              tokenEndpoint: { type: 'string', minLength: 1 },
              jwksEndpoint: { type: 'string', minLength: 1 },
              scopes: stringArraySchema,
              pkce: { type: 'boolean' },
              state: { type: 'boolean' },
              nonce: { type: 'boolean' },
              enabled: { type: 'boolean' },
              runtime: stringArraySchema,
              claims: stringArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        session: {
          type: 'object',
          additionalProperties: true,
          properties: {
            strategy: { type: 'string', minLength: 1 },
            cookieName: { type: 'string', minLength: 1 },
            ttlSeconds: { type: 'integer', minimum: 1 },
            refreshSeconds: { type: 'integer', minimum: 1 },
            csrfProtection: { type: 'boolean' },
            httpOnly: { type: 'boolean' },
            secure: { type: 'boolean' },
            sameSite: { type: 'string', minLength: 1 },
            tags: stringArraySchema,
            metadata: metadataSchema
          }
        },
        profile: {
          type: 'object',
          additionalProperties: true,
          properties: {
            requireSubject: { type: 'boolean' },
            requireEmail: { type: 'boolean' },
            requireProvider: { type: 'boolean' },
            fields: stringArraySchema,
            access: stringArraySchema,
            legal: stringArraySchema,
            mode: { type: 'string', minLength: 1 },
            tags: stringArraySchema,
            metadata: metadataSchema
          }
        },
        linking: {
          type: 'object',
          additionalProperties: true,
          properties: {
            providerFirst: { type: 'boolean' },
            allowEmailFallback: { type: 'boolean' },
            allowRelink: { type: 'boolean' },
            attachProviderAccount: { type: 'boolean' },
            identityKeys: stringArraySchema,
            fallbackKeys: stringArraySchema,
            reservedEmails: stringArraySchema,
            reservedUsernames: stringArraySchema,
            tags: stringArraySchema,
            metadata: metadataSchema
          }
        },
        gates: { type: 'array', items: { type: 'object', additionalProperties: true } },
        routeGuards: { type: 'array', items: { type: 'object', additionalProperties: true } },
        capabilities: { type: 'array', items: { type: 'object', additionalProperties: true } },
        tokenContracts: { type: 'array', items: { type: 'object', additionalProperties: true } },
        runtimeGrants: { type: 'array', items: { type: 'object', additionalProperties: true } },
        tags: stringArraySchema,
        metadata: metadataSchema
      }
    },
    migrations: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        currentVersion: { type: 'string', minLength: 1 },
        initialVersion: { type: 'string', minLength: 1 },
        registryId: { type: 'string', minLength: 1 },
        generatedDir: { type: 'string', minLength: 1 },
        evidenceFile: { type: 'string', minLength: 1 },
        runtimeBridgeFile: { type: 'string', minLength: 1 },
        strict: { type: 'boolean' },
        failOnMissingVersion: { type: 'boolean' },
        autoMigrateState: { type: 'boolean' },
        autoMigrateCache: { type: 'boolean' },
        sources: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['kind'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              source: { type: 'string', minLength: 1 },
              required: { type: 'boolean' },
              versionPath: { type: ['string', 'boolean'], minLength: 1 },
              dataVersionPaths: stringArraySchema,
              writeDataVersionPaths: stringArraySchema,
              payloadPath: { type: ['string', 'boolean'], minLength: 1 },
              payloadPaths: stringArraySchema,
              targetVersion: { type: 'string', minLength: 1 },
              metadata: metadataSchema
            }
          }
        }
      }
    },
    sourcePolicy: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        preset: { type: 'string', minLength: 1 },
        enforcement: { type: 'string', minLength: 1 },
        maxFrontierComponentsPerFile: { type: ['integer', 'boolean'], minimum: 1 },
        maxLinesPerFile: { type: ['integer', 'boolean'], minimum: 1 },
        maxCharsPerFile: { type: ['integer', 'boolean'], minimum: 1 },
        localImportExtensions: { type: 'string', minLength: 1 },
        businessLogic: { type: 'boolean' },
        businessLogicSeverity: { type: 'string', minLength: 1 },
        sourceGraphFile: { type: 'string', minLength: 1 },
        sourceGraphRegistryFile: { type: 'string', minLength: 1 },
        frontendRouteRoots: stringArraySchema,
        frontendComponentRoots: stringArraySchema,
        backendHandlerRoots: stringArraySchema,
        domainRoots: stringArraySchema,
        generatedRoots: stringArraySchema,
        forbiddenAdapterCalls: stringArraySchema,
        allowedAdapterDeclarations: stringArraySchema,
        include: stringArraySchema,
        exclude: stringArraySchema,
        runtimeModules: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              file: { type: 'string', minLength: 1 },
              files: stringArraySchema,
              owner: { type: 'string', minLength: 1 },
              owns: stringArraySchema,
              reads: stringArraySchema,
              writes: stringArraySchema,
              actions: stringArraySchema,
              effects: stringArraySchema,
              capabilities: stringArraySchema,
              evidence: stringArraySchema,
              tags: stringArraySchema,
              bindings: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: true,
                  required: ['kind'],
                  properties: {
                    kind: { type: 'string', minLength: 1 },
                    target: { type: 'string', minLength: 1 },
                    events: stringArraySchema,
                    actions: stringArraySchema,
                    tools: stringArraySchema,
                    snapshots: stringArraySchema,
                    tests: stringArraySchema,
                    reads: stringArraySchema,
                    writes: stringArraySchema,
                    capabilities: stringArraySchema,
                    evidence: stringArraySchema,
                    metadata: metadataSchema
                  }
                }
              },
              metadata: metadataSchema
            }
          }
        },
        metadata: metadataSchema
      }
    },
    conformance: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        mode: { type: 'string', minLength: 1 },
        enforcement: { type: 'string', minLength: 1 },
        failOnViolation: { type: 'boolean' },
        generatedDir: { type: 'string', minLength: 1 },
        reportFile: { type: 'string', minLength: 1 },
        sarifFile: { type: 'string', minLength: 1 },
        requiredPackageUses: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['package'],
            properties: {
              id: { type: 'string', minLength: 1 },
              package: { type: 'string', minLength: 1 },
              mode: { type: 'string', minLength: 1 },
              required: { type: 'boolean' },
              perSource: { type: 'boolean' },
              reason: { type: 'string', minLength: 1 },
              resourceKinds: stringArraySchema,
              resourceTags: stringArraySchema,
              filePatterns: stringArraySchema,
              importPatterns: stringArraySchema,
              textPatterns: stringArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        },
        metadata: metadataSchema
      }
    },
    harness: {
      type: 'object',
      additionalProperties: true,
      properties: {
        mode: { type: 'string', minLength: 1 },
        strict: { type: 'boolean' },
        failOnMissing: { type: 'boolean' },
        generatedDir: { type: 'string', minLength: 1 },
        evidenceDir: { type: 'string', minLength: 1 },
        corpusDir: { type: 'string', minLength: 1 },
        fixturesDir: { type: 'string', minLength: 1 },
        autoRun: { type: 'string', minLength: 1 },
        replayFailures: { type: 'boolean' },
        minimizeCorpus: { type: 'boolean' },
        browserTrace: { type: 'string', minLength: 1 },
        tests: harnessGateSchema,
        fuzzers: harnessGateSchema,
        benchmarks: harnessGateSchema,
        browser: harnessGateSchema,
        agentKit: harnessGateSchema,
        linter: harnessGateSchema,
        hybrid: harnessGateSchema,
        commands: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id', 'kind', 'command'],
            properties: {
              id: { type: 'string', minLength: 1 },
              kind: { type: 'string', minLength: 1 },
              command: { type: 'string', minLength: 1 },
              required: { type: 'boolean' },
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        }
      }
    },
    agent: {
      type: 'object',
      additionalProperties: true,
      properties: {
        enabled: { type: 'boolean' },
        generatedDir: { type: 'string', minLength: 1 },
        manifestDir: { type: 'string', minLength: 1 },
        runsDir: { type: 'string', minLength: 1 },
        runbookFile: { type: 'string', minLength: 1 },
        handoffFile: { type: 'string', minLength: 1 },
        requireFeatureManifest: { type: 'boolean' },
        requireEvidence: { type: 'boolean' },
        requireHarness: { type: 'boolean' },
        requireProof: { type: 'boolean' },
        requireCleanScope: { type: 'boolean' },
        handoffMode: { type: 'string', minLength: 1 },
        maxOpenQuestions: { type: 'integer', minimum: 0 },
        checkpoints: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
            required: ['id', 'title'],
            properties: {
              id: { type: 'string', minLength: 1 },
              title: { type: 'string', minLength: 1 },
              source: { type: 'string', minLength: 1 },
              required: { type: 'boolean' },
              query: { type: 'string', minLength: 1 },
              command: { type: 'string', minLength: 1 },
              artifacts: stringArraySchema,
              tags: stringArraySchema,
              metadata: metadataSchema
            }
          }
        }
      }
    },
    deploy: {
      type: 'object',
      additionalProperties: true,
      properties: {
        frontend: { type: 'array', items: deployTargetSchema },
        backend: { type: 'array', items: deployTargetSchema },
        evidence: { type: 'array', items: deployTargetSchema }
      }
    },
    features: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true,
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          routes: stringArraySchema,
          endpoints: stringArraySchema,
          actions: stringArraySchema,
          state: stringArraySchema,
          owner: { type: 'string', minLength: 1 },
          tags: stringArraySchema,
          metadata: metadataSchema
        }
      }
    },
    packages: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true,
        required: ['name', 'purpose'],
        properties: {
          name: { type: 'string', minLength: 1 },
          purpose: { type: 'string', minLength: 1 },
          optional: { type: 'boolean' },
          tags: stringArraySchema
        }
      }
    },
    metadata: metadataSchema
  }
};

export const FRONTIER_FRAMEWORK_CONFIG_EXPLAIN: readonly FrontierFrameworkConfigExplainEntry[] = [
  { path: 'workspace.kind', type: 'monorepo | single | string', default: 'monorepo', description: 'Controls whether scaffold/default paths use apps/web, apps/api, and packages/contracts or a single app layout.', suggestedFix: 'Use "monorepo" for split frontend/backend packages; use "single" when one app owns both sides.', examples: ['monorepo', 'single'], tags: ['workspace', 'monorepo'] },
  { path: 'frontend.root', type: 'string', default: 'apps/web', description: 'Frontend app root used by route discovery, component policy checks, and static output generation.', suggestedFix: 'Point this at the deployable frontend package root.', examples: ['apps/web'], tags: ['frontend', 'routes'] },
  { path: 'frontend.routes', type: 'Array<{ path: string; file: string }>', description: 'Optional explicit TSX route list. Omit it to let Frontier discover page files from frontend.root/frontend.routesDir.', suggestedFix: 'Each route path should start with "/" and each file should point at a TSX/JSX route module.', examples: [[{ path: '/', file: 'apps/web/src/routes/index.tsx' }]], tags: ['frontend', 'routes', 'tsx'] },
  { path: 'frontend.outDir', type: 'string', default: 'dist/frontend', description: 'Deployable static frontend artifact directory.', suggestedFix: 'Keep this separate from backend.outDir and frontend.evidenceDir.', examples: ['dist/frontend'], tags: ['frontend', 'deploy'] },
  { path: 'routeScenarios.enabled', type: 'boolean', default: true, description: 'Enables app-defined route scenario manifests and generated browser-plan records for auth/session/state fixtures, redirects, DOM roles, selectors, scroll, and console policies.', suggestedFix: 'Keep enabled for browser-facing apps and declare scenarios for important route states rather than hardcoding one happy path.', examples: [true], tags: ['routes', 'scenario', 'browser', 'evidence'] },
  { path: 'routeScenarios.fixtures', type: 'FrontierFrameworkRouteScenarioFixtureConfig[]', description: 'App-owned fixture registry referenced by route scenarios. Frontier validates ids and propagates data/files/tags without defining app-specific fixture meanings.', suggestedFix: 'Declare fixtures such as auth/session/state/data modes in app terms, then reference their ids from routeScenarios.scenarios.', examples: [[{ id: 'guest-session', kind: 'auth', data: { authenticated: false } }]], tags: ['routes', 'scenario', 'fixtures', 'auth'] },
  { path: 'routeScenarios.scenarios', type: 'FrontierFrameworkRouteScenarioConfig[]', description: 'Route, fixture, and expected browser behavior records that can generate Playwright cases and evidence plans.', suggestedFix: 'Add one scenario per important route state, including expected redirects, final path, DOM roles, selectors, text, scroll policy, and console-error policy.', examples: [[{ id: 'guest-home', route: '/home', authFixture: 'guest-session', expected: { redirectTo: '/' } }]], tags: ['routes', 'scenario', 'playwright'] },
  { path: 'surfaces.enabled', type: 'boolean', default: true, description: 'Enables app-defined status records for routes, pages, filters, features, components, actions, and other product surfaces.', suggestedFix: 'Keep enabled for browser-facing or agent-owned apps so a route existing cannot be mistaken for a verified surface.', examples: [true], tags: ['surfaces', 'status', 'evidence'] },
  { path: 'surfaces.statuses', type: '(string | FrontierFrameworkSurfaceStatusConfig)[]', default: ['untracked', 'planned', 'in-progress', 'implemented', 'verified', 'blocked', 'deprecated'], description: 'Status vocabulary for app-owned surfaces. Frontier ships generic defaults, but apps can define their own lifecycle words.', suggestedFix: 'Declare statuses that match the app workflow, then reference them from surfaces.surfaces records.', examples: [['planned', 'implemented', 'verified']], tags: ['surfaces', 'status'] },
  { path: 'surfaces.surfaces', type: 'FrontierFrameworkSurfaceConfig[]', description: 'App-owned surface records for pages, routes, filters, features, actions, or resources with status and evidence links.', suggestedFix: 'Declare important surfaces explicitly and attach evidence paths or run ids when the surface reaches a verified status.', examples: [[{ id: 'page.home.guest', kind: 'page', route: '/', status: 'verified', evidence: ['agent-runs/home/evidence.json'] }]], tags: ['surfaces', 'status', 'evidence'] },
  { path: 'surfaces.surfaces[].aliases', type: 'string[]', description: 'Optional human-friendly refs for querying a page, filter, route, action, or other surface without knowing its exact id.', suggestedFix: 'Add stable aliases such as "home", "profile", or "worlds.mine" for surfaces agents and humans ask about often.', examples: [['home', 'worlds.mine']], tags: ['surfaces', 'status', 'query'] },
  { path: 'surfaces.surfaces[].coverage', type: 'string[]', description: 'Per-surface probe requirements such as evidence, render, state, action, filter, or an app-defined probe kind.', suggestedFix: 'Use this when a single route, page, filter, or action needs stricter evidence than the default kind/status rules.', examples: [['evidence', 'render', 'state']], tags: ['surfaces', 'coverage', 'agent'] },
  { path: 'surfaces.surfaces[].contracts', type: 'FrontierFrameworkSurfaceContractConfig[]', description: 'Per-surface proof contracts that linked evidence must satisfy before the surface can count as verified, including evidence-ok, no-gaps, no-warnings, and route-comparison checks.', suggestedFix: 'Use contracts when linked artifacts are not enough and a page/action must prove that its own scenario, route comparison, or evidence summary passed.', examples: [[{ kind: 'route-comparison', artifact: 'agent-runs/hybrid/evidence.json', route: '/home', scenario: 'authenticated-home' }]], tags: ['surfaces', 'coverage', 'contracts', 'agent', 'evidence'] },
  { path: 'surfaces.intents', type: 'FrontierFrameworkSurfaceIntentConfig[]', description: 'Agent-first shorthand for declaring a surface once and letting Frontier expand it into a status record plus optional route scenario skeleton.', suggestedFix: 'Use intents for route/page/filter/action work queues where agents need stable refs, default probes, and generated browser-plan entries without duplicating config.', examples: [[{ id: 'page.home.creator', kind: 'page', route: '/home', status: 'implemented', scenario: true }]], tags: ['surfaces', 'coverage', 'agent', 'route-scenarios'] },
  { path: 'surfaces.intents[].scenario', type: 'boolean | FrontierFrameworkSurfaceIntentScenarioConfig', description: 'Controls whether a surface intent with a route generates a route scenario skeleton; page, route, view, and component intents default to generating one.', suggestedFix: 'Use scenario: false when a surface should be tracked without browser render probes, or provide expected selectors/state paths for stronger coverage.', examples: [{ expected: { selectors: [{ selector: 'main' }], statePaths: ['/session'] } }], tags: ['surfaces', 'coverage', 'route-scenarios', 'browser'] },
  { path: 'surfaces.coverage.enabled', type: 'boolean', default: true, description: 'Generates an agent-facing surface coverage report that joins status records to evidence links, generated render probes, route scenarios, and state probes.', suggestedFix: 'Keep enabled so agents can ask which declared surfaces still lack render/state/evidence coverage.', examples: [true], tags: ['surfaces', 'coverage', 'agent'] },
  { path: 'surfaces.coverage.failOnMissing', type: 'boolean', default: false, description: 'Fails build evidence or strict coverage checks when claimed surface statuses lack required coverage.', suggestedFix: 'Use true for apps where verified surfaces must always have matching evidence/probe coverage.', examples: [true], tags: ['surfaces', 'coverage', 'strict'] },
  { path: 'surfaces.coverage.verifyEvidenceFiles', type: 'boolean', default: false, description: 'Strict CLI and evidence builds check that surface evidence links which look like local file paths exist under the app root.', suggestedFix: 'Enable this for agent-first apps where stale or missing evidence paths should not count as verified coverage.', examples: [true], tags: ['surfaces', 'coverage', 'evidence', 'strict'] },
  { path: 'surfaces.coverage.verifyEvidenceFreshness', type: 'boolean', default: false, description: 'Strict CLI and evidence builds check that local surface evidence artifacts are newer than declared surface source files.', suggestedFix: 'Enable this when verified surfaces should be rechecked after source changes.', examples: [true], tags: ['surfaces', 'coverage', 'evidence', 'freshness'] },
  { path: 'surfaces.coverage.verifyEvidenceProbeKinds', type: 'boolean', default: false, description: 'Strict CLI and evidence builds check that linked local evidence artifacts mention each required non-evidence probe kind before counting that probe as covered.', suggestedFix: 'Enable this for agent-first apps so a generic evidence file cannot accidentally satisfy render/state/action/filter coverage.', examples: [true], tags: ['surfaces', 'coverage', 'evidence', 'strict', 'agent'] },
  { path: 'surfaces.coverage.evidenceRoots', type: 'string[]', default: ['.'], description: 'Root directories, relative to the app cwd, used to resolve local surface evidence paths during CLI verification.', suggestedFix: 'Add ".." for monorepos that keep agent-runs at the repository root while running Frontier from an app subdirectory.', examples: [['.', '..']], tags: ['surfaces', 'coverage', 'evidence', 'monorepo'] },
  { path: 'surfaces.coverage.evidenceProbeTokens', type: 'Record<string, string[]>', default: '{}', description: 'Optional app-owned token aliases used when verifyEvidenceProbeKinds scans local evidence artifacts for required probe kinds.', suggestedFix: 'Add aliases only when an app records probe evidence with domain terms rather than generic words like render, state, action, or filter.', examples: [{ render: ['screenshot', 'layout'], action: ['actionId'] }], tags: ['surfaces', 'coverage', 'evidence', 'agent'] },
  { path: 'surfaces.coverage.focusKinds', type: 'string[]', default: ['route', 'page', 'filter', 'action'], description: 'Surface kinds shown as first-class agent loop dashboard buckets.', suggestedFix: 'Keep route/page/filter/action for product migrations, or add app-owned kinds that agents should actively pull from the loop.', examples: [['route', 'page', 'filter', 'action', 'workflow']], tags: ['surfaces', 'coverage', 'agent', 'dashboard'] },
  { path: 'surfaces.coverage.requireEvidenceForStatuses', type: 'string[]', default: ['verified'], description: 'Surface statuses that require evidence links and any kind-specific probes.', suggestedFix: 'Keep "verified" here so planned or untracked records can exist without blocking agents.', examples: [['implemented', 'verified']], tags: ['surfaces', 'coverage', 'status'] },
  { path: 'surfaces.coverage.requireRenderForKinds', type: 'string[]', default: ['page', 'route', 'view', 'component'], description: 'Surface kinds that require a generated render probe when their status is claim-worthy.', suggestedFix: 'Include route/page/view/component surfaces that should be browser-observable.', examples: [['page', 'route']], tags: ['surfaces', 'coverage', 'render'] },
  { path: 'surfaces.coverage.requireStateForKinds', type: 'string[]', default: ['state'], description: 'Surface kinds that require a state-path probe when their status is claim-worthy.', suggestedFix: 'Use this for state, cache, or runtime-model surfaces that should be observable without DOM assumptions.', examples: [['state', 'resource']], tags: ['surfaces', 'coverage', 'state'] },
  { path: 'surfaces.coverage.requireProbesForKinds', type: 'Record<string, string[]>', default: '{}', description: 'Global per-kind probe requirements layered on top of evidence/render/state defaults.', suggestedFix: 'Use this for agent workflows where action, filter, or page surfaces must always carry app-defined probe evidence before they can be treated as covered.', examples: [{ action: ['evidence', 'state'], filter: ['state'] }], tags: ['surfaces', 'coverage', 'agent'] },
  { path: 'componentPreview.enabled', type: 'boolean', default: true, description: 'Controls generation of Frontier component preview manifests, standalone preview books, and preview evidence from TSX/JSX component exports.', suggestedFix: 'Leave enabled for browser-facing apps so agents and humans can inspect component surfaces.', examples: [true], tags: ['component-preview', 'frontend', 'agent'] },
  { path: 'componentPreview.include', type: 'string[]', default: ['apps/web/src/components'], description: 'Source roots scanned by frontier-component-preview for exported component functions.', suggestedFix: 'Point this at the app-owned component folders and keep route files out unless route previews are intentional.', examples: [['apps/web/src/components']], tags: ['component-preview', 'source'] },
  { path: 'componentPreview.outDir', type: 'string', default: '.frontier-framework/component-preview', description: 'Generated preview book, manifest, module, proof, harness plan, fuzz cases, and browser-evidence plan output directory.', suggestedFix: 'Keep this under .frontier-framework so previews stay generated and separate from deploy artifacts.', examples: ['.frontier-framework/component-preview'], tags: ['component-preview', 'evidence'] },
  { path: 'documentation.enabled', type: 'boolean', default: true, description: 'Controls generation of Frontier documentation manifests, standalone docs books, search records, JSONL, and documentation evidence.', suggestedFix: 'Leave enabled for agent-first apps so docs stay executable and inspectable from build evidence.', examples: [true], tags: ['documentation', 'docs', 'agent'] },
  { path: 'documentation.include', type: 'string[]', default: ['README.md', 'docs', 'features', 'apps/web/src/routes', 'apps/web/src/components', 'apps/api', 'packages'], description: 'Source roots scanned by frontier-documentation for guides, feature manifests, API exports, package metadata, and route/backend docs.', suggestedFix: 'Point this at the app-owned docs, features, package, route, and backend folders that should appear in the generated docs book.', examples: [['README.md', 'docs', 'features', 'packages']], tags: ['documentation', 'source'] },
  { path: 'documentation.outDir', type: 'string', default: '.frontier-framework/documentation', description: 'Generated documentation book, manifest, docs module, search index, proof, JSONL, harness plan, fuzz cases, benchmark plan, and browser-evidence plan output directory.', suggestedFix: 'Keep this under .frontier-framework so generated docs evidence stays separate from deploy artifacts.', examples: ['.frontier-framework/documentation'], tags: ['documentation', 'evidence'] },
  { path: 'backend.root', type: 'string', default: 'apps/api', description: 'Backend app root used to locate the Fetch-compatible handler contract.', suggestedFix: 'Point this at the backend package root, even when the concrete server adapter is app-owned.', examples: ['apps/api'], tags: ['backend', 'deploy'] },
  { path: 'backend.entry', type: 'string', default: 'src/handler.ts', description: 'Fetch handler entry file relative to backend.root.', suggestedFix: 'Export backend.handlerExport from this file so Node, edge, serverless, or custom adapters can wrap it.', examples: ['src/handler.ts'], tags: ['backend'] },
  { path: 'backend.transports', type: 'Array<{ kind: string; protocol?: string; path?: string }>', default: [{ kind: 'fetch', protocol: 'http', path: '/api/*' }, { kind: 'crdt-websocket', protocol: 'websocket', path: '/sync/:documentId' }, { kind: 'event-log', protocol: 'sse', path: '/events/:streamId' }, { kind: 'state-cache', protocol: 'http', path: '/cache/:queryKey' }], description: 'Adapter-neutral communication declarations for fetch, CRDT sync, realtime, event-log, state-cache, worker, and custom backends.', suggestedFix: 'Declare the transport contract here and keep concrete server implementation in the app or adapter package.', tags: ['backend', 'sync', 'crdt'] },
  { path: 'vite.enabled', type: 'boolean', default: true, description: 'Enables the default Vite frontend bundler path and virtual devtools module integration.', suggestedFix: 'Keep enabled unless a host framework owns bundling; set vite.strict=true when Vite must be present.', examples: [true], tags: ['vite', 'frontend'] },
  { path: 'vite.hmr', type: 'boolean', default: true, description: 'Controls Vite hot module reloading for Frontier dev builds and the generated Vite plugin config.', suggestedFix: 'Leave true for local development; set vite.hmr=false when the host runtime or deployment environment cannot use HMR.', examples: [true, false], tags: ['vite', 'hmr', 'dev'] },
  { path: 'vite.configFile', type: 'string', default: 'vite.config.ts', description: 'Vite config used by the framework build and doctor checks.', suggestedFix: 'Create the config or set vite.enabled=false for non-Vite hosts.', examples: ['vite.config.ts'], tags: ['vite'] },
  { path: 'devtools.enabled', type: 'boolean', default: true, description: 'Controls emission of the floating inspect/debug/rewind overlay and bridge summary.', suggestedFix: 'Leave enabled in development so agents can inspect state, patches, CRDT updates, traces, and telemetry.', examples: [true], tags: ['devtools', 'agent'] },
  { path: 'auth.enabled', type: 'boolean', default: true, description: 'Enables Frontier-native auth manifests, route/resource gates, token contracts, runtime grants, lint resources, and evidence output.', suggestedFix: 'Leave enabled for apps with user sessions, protected backend endpoints, realtime rooms, service tokens, or auth-sensitive agent workflows.', examples: [true], tags: ['auth', 'agent'] },
  { path: 'auth.sessionStrategy', type: 'jwt | database | opaque | cookie | hybrid | custom', default: 'jwt', description: 'Declares the app-owned session strategy that Frontier should model; Frontier does not own the auth server or crypto implementation.', suggestedFix: 'Use "jwt" for stateless bearer/cookie sessions, "database" for durable server sessions, or "custom" for app-owned adapters.', examples: ['jwt', 'database', 'custom'], tags: ['auth', 'session'] },
  { path: 'auth.providers', type: 'FrontierAuthProviderInput[]', default: [{ id: 'frontier-session', kind: 'bearer' }, { id: 'frontier-service-token', kind: 'service-token' }, { id: 'frontier-dev-credentials', kind: 'credentials' }], description: 'Declares provider surfaces for OAuth/OIDC, credentials, passkeys, service tokens, bearer sessions, or custom auth without importing a provider SDK.', suggestedFix: 'Declare every provider shape that can create a session so agents and lint gates can reason about session claims and account linking.', tags: ['auth', 'providers'] },
  { path: 'auth.profile', type: 'FrontierAuthProfileRequirementInput', default: { fields: ['username'], access: ['granted_access'], legal: ['accepted_terms_of_use', 'accepted_privacy_policy'] }, description: 'Defines app-level profile completeness gates used by backend endpoints, realtime rooms, and protected UI flows.', suggestedFix: 'List the subject, profile, access, and legal acceptance fields your app requires before protected runtime work is allowed.', tags: ['auth', 'profile', 'access'] },
  { path: 'auth.tokenContracts', type: 'FrontierAuthTokenContractInput[]', default: [{ id: 'session-jwt' }, { id: 'runtime-room' }, { id: 'service-user' }], description: 'Declares app-owned token issue/verify contracts for sessions, runtime rooms, service users, workers, and backend transport handoffs.', suggestedFix: 'Keep signing/verification in app adapters, but declare issuer, audience, TTL, required claims, and sensitive claims here.', tags: ['auth', 'token', 'runtime'] },
  { path: 'auth.routeGuards', type: 'FrontierAuthGateInput[]', description: 'Route/resource auth gates generated into manifests, lint resources, tests, agent gates, and auth evidence.', suggestedFix: 'Add gates for protected frontend routes, backend endpoints, realtime rooms, CRDT sync, event logs, and state-cache transports.', tags: ['auth', 'routes', 'backend'] },
  { path: 'migrations.enabled', type: 'boolean', default: true, description: 'Enables first-class frontier-migrations runtime data-source manifests and generated app-state/cache hydration bridge.', suggestedFix: 'Keep enabled when any persisted, server, CRDT, event-log, or query-cache data may outlive the current app version.', examples: [true], tags: ['migrations', 'runtime', 'state'] },
  { path: 'migrations.sources', type: 'Array<{ id?: string; kind: string; required?: boolean }>', default: [{ id: 'app-state', kind: 'state' }, { id: 'state-cache', kind: 'query-cache' }, { id: 'crdt-documents', kind: 'crdt-snapshot' }, { id: 'event-log', kind: 'event-log-snapshot' }], description: 'Declares old-data ingress points that should be migrated before Frontier runtime state, cache, CRDT views, or event-log replay consumes them.', suggestedFix: 'Add a source for every persisted/browser/server data boundary, then wire its generated bridge helper into the storage adapter or state initializer.', tags: ['migrations', 'data-source', 'runtime'] },
  { path: 'sourcePolicy.enabled', type: 'boolean', default: true, description: 'Turns configurable source-structure enforcement on or off.', suggestedFix: 'Prefer adjusting per-rule limits before disabling the whole policy.', examples: [true], tags: ['source-policy', 'lint'] },
  { path: 'sourcePolicy.preset', type: 'adapter | app-wide | strict-app | migration', default: 'adapter', description: 'Selects source-policy defaults for thin adapters, whole app source trees, strict generated apps, or staged migrations.', suggestedFix: 'Use "strict-app" for new Frontier apps and "migration" while splitting legacy runtime files.', examples: ['strict-app', 'migration'], tags: ['source-policy', 'preset'] },
  { path: 'sourcePolicy.enforcement', type: 'warn | error', default: 'error', description: 'Controls whether source policy violations are advisory or fail doctor/evidence builds.', suggestedFix: 'Use "error" for agent-first projects and "warn" during migrations.', examples: ['error', 'warn'], tags: ['source-policy', 'lint'] },
  { path: 'sourcePolicy.maxFrontierComponentsPerFile', type: 'positive integer | false', default: 1, description: 'Maximum Frontier component functions allowed per source file. false disables just this rule.', suggestedFix: 'Split components into separate files or set this rule to false for generated files.', examples: [1, false], tags: ['source-policy', 'components'] },
  { path: 'sourcePolicy.maxLinesPerFile', type: 'positive integer | false', default: 320, description: 'Maximum source file length. false disables just this rule.', suggestedFix: 'Move large helpers into smaller modules or disable the rule for generated paths.', examples: [320, false], tags: ['source-policy', 'file-size'] },
  { path: 'sourcePolicy.maxCharsPerFile', type: 'positive integer | false', default: 24000, description: 'Maximum source file character count. false disables just this rule.', suggestedFix: 'Split dense files instead of compressing code onto fewer lines to bypass line-count limits.', examples: [24000, false], tags: ['source-policy', 'file-size'] },
  { path: 'sourcePolicy.localImportExtensions', type: 'source | runtime | off', default: 'source', description: 'Controls local import specifiers in TS/TSX source. "source" rejects relative .js/.jsx specifiers when a .ts/.tsx source file exists; emitted packages should use TypeScript rewriteRelativeImportExtensions for runtime JS.', suggestedFix: 'Import local source modules with .ts/.tsx extensions, or set this to "runtime" only for packages that intentionally author NodeNext runtime specifiers.', examples: ['source', 'runtime', 'off'], tags: ['source-policy', 'imports'] },
  { path: 'sourcePolicy.businessLogic', type: 'boolean', default: true, description: 'Uses frontier-ast-walk to reject business logic inside route, component, and backend handler adapters.', suggestedFix: 'Move effectful calls and domain symbols into packages/domain, packages/contracts, Frontier actions, effects, tools, workers, or workflows.', examples: [true], tags: ['source-policy', 'ast', 'business-logic'] },
  { path: 'sourcePolicy.domainRoots', type: 'string[]', default: ['packages/domain/src', 'packages/contracts/src'], description: 'Source roots treated as domain/application logic by frontier-ast-walk.', suggestedFix: 'Add app-owned domain packages here instead of putting logic directly in TSX routes or API handlers.', examples: [['packages/domain/src', 'packages/contracts/src']], tags: ['source-policy', 'ast', 'domain'] },
  { path: 'sourcePolicy.sourceGraphFile', type: 'string', default: 'dist/frontier/source-graph.json', description: 'Machine-readable import/declaration/call graph emitted for agents, linter resources, docs, fuzzers, and benchmarks.', suggestedFix: 'Keep this in the evidence directory so CI and agents can inspect source impact after builds.', examples: ['dist/frontier/source-graph.json'], tags: ['source-policy', 'ast', 'evidence'] },
  { path: 'sourcePolicy.runtimeModules', type: 'FrontierFrameworkRuntimeModuleConfig[]', description: 'Declares app-owned runtime controller modules for DOM events, form dispatch, tools, offline snapshots, test APIs, DnD, canvas, and collaboration.', suggestedFix: 'Use defineRuntimeModule with bindDomEvents, bindFormActions, bindToolSurface, bindOfflineSnapshot, and bindTestApi instead of centralizing all runtime behavior in one file.', examples: [[{ id: 'runtime.forms', file: 'apps/web/src/runtime/forms.ts', owns: ['form-actions'] }]], tags: ['source-policy', 'runtime-modules', 'evidence'] },
  { path: 'conformance.enabled', type: 'boolean', default: true, description: 'Turns Frontier package-use and workflow conformance enforcement on or off.', suggestedFix: 'Leave enabled for agent-first projects so missing Frontier package usage becomes a lint/SARIF failure.', examples: [true], tags: ['conformance', 'lint', 'agent'] },
  { path: 'conformance.mode', type: 'off | migration | recommended | strict', default: 'strict', description: 'Controls how aggressively the framework requires Frontier package usage across source, manifests, harnesses, and agent workflows.', suggestedFix: 'Use "migration" for warning-only staged ports, "recommended" while integrating packages, and "strict" for locked-down agent workflows.', examples: ['migration', 'strict'], tags: ['conformance', 'agent'] },
  { path: 'conformance.requiredPackageUses', type: 'FrontierFrameworkRequiredPackageUseConfig[]', description: 'Rules that require a Frontier package dependency or import when matching frontend, state, sync, migration, test, lint, benchmark, browser, or agent surfaces are present.', suggestedFix: 'Add package-use rules for app-specific Frontier integrations rather than relying on prose runbooks.', examples: [[{ id: 'frontend-design', package: '@shapeshift-labs/frontier-design', mode: 'import', perSource: true, filePatterns: ['apps/web/src/**/*.tsx'] }]], tags: ['conformance', 'package-use'] },
  { path: 'harness.mode', type: 'off | recommended | strict', default: 'recommended', description: 'Controls generated tests, fuzzers, benchmarks, browser probes, and missing-gate strictness.', suggestedFix: 'Use "strict" when missing harness pieces should fail agents and CI.', examples: ['recommended', 'strict'], tags: ['harness', 'agent'] },
  { path: 'agent.requireFeatureManifest', type: 'boolean', default: true, description: 'Requires features/*.json to exist for agent workflow readiness.', suggestedFix: 'Keep enabled so agents have declared surfaces before implementation.', examples: [true], tags: ['agent', 'feature'] },
  { path: 'agent.maxOpenQuestions', type: 'non-negative integer', default: 3, description: 'Maximum unresolved handoff questions tolerated by generated agent readiness checks.', suggestedFix: 'Use 0 for fully strict handoffs or a small number while the app is incubating.', examples: [0, 3], tags: ['agent', 'handoff'] },
  { path: 'deploy.frontend', type: 'FrontierFrameworkDeployTarget[]', default: [{ id: 'frontend-static', kind: 'static', target: 'frontend', output: 'dist/frontend' }], description: 'Deploy targets for static frontend artifacts.', suggestedFix: 'Keep frontend targets separate from backend targets so they can deploy to different platforms.', tags: ['deploy', 'frontend'] },
  { path: 'deploy.backend', type: 'FrontierFrameworkDeployTarget[]', default: [{ id: 'backend-fetch', kind: 'serverless', target: 'backend', adapter: 'fetch', output: 'dist/backend' }], description: 'Deploy targets for app-owned backend adapters around the Fetch handler contract.', suggestedFix: 'Declare platform adapters here without making the framework own a server runtime.', tags: ['deploy', 'backend'] },
  { path: 'deploy.evidence', type: 'FrontierFrameworkDeployTarget[]', default: [{ id: 'frontier-evidence', kind: 'evidence', target: 'evidence', output: 'dist/frontier' }], description: 'Deploy or archive targets for machine-readable Frontier evidence.', suggestedFix: 'Keep evidence output durable so agents, CI, and reviews can inspect builds after deploy.', tags: ['deploy', 'evidence', 'agent'] }
];

export interface NormalizedFrontierFrameworkConfig extends FrontierFrameworkConfig {
  id: string;
  name: string;
  workspace: Required<FrontierFrameworkWorkspaceConfig>;
  frontend: Required<Omit<FrontierFrameworkFrontendConfig, 'routes' | 'shell'>> & {
    routes: FrontierFrontendRouteConfig[];
    shell: Required<Pick<FrontierFrameworkShellConfig, 'title' | 'lang' | 'appRootId'>> & FrontierFrameworkShellConfig;
  };
  routeScenarios: Required<Omit<FrontierFrameworkRouteScenariosConfig, 'fixtures' | 'scenarios' | 'tags' | 'metadata'>> & {
    fixtures: FrontierFrameworkRouteScenarioFixture[];
    scenarios: FrontierFrameworkRouteScenario[];
    tags: string[];
    metadata: JsonObject;
  };
  surfaces: Required<Omit<FrontierFrameworkSurfacesConfig, 'statuses' | 'surfaces' | 'intents' | 'coverage' | 'tags' | 'metadata'>> & {
    statuses: FrontierFrameworkSurfaceStatusDefinition[];
    surfaces: FrontierFrameworkSurfaceRecord[];
    intents: FrontierFrameworkSurfaceIntentConfig[];
    coverage: Required<Omit<FrontierFrameworkSurfaceCoverageConfig, 'focusKinds' | 'requireEvidenceForStatuses' | 'requireRenderForKinds' | 'requireStateForKinds' | 'requireProbesForKinds' | 'evidenceProbeTokens'>> & {
      focusKinds: string[];
      requireEvidenceForStatuses: string[];
      requireRenderForKinds: string[];
      requireStateForKinds: string[];
      requireProbesForKinds: Record<string, string[]>;
      evidenceProbeTokens: Record<string, string[]>;
    };
    tags: string[];
    metadata: JsonObject;
  };
  componentPreview: Required<Omit<FrontierFrameworkComponentPreviewConfig, 'packageName' | 'generatedAt' | 'defaultVariants' | 'integrations'>> & {
    packageName?: string;
    generatedAt?: number;
    defaultVariants?: FrontierPreviewVariantInput[];
    integrations: FrontierPreviewIntegrationFlags;
  };
  documentation: Required<Omit<FrontierFrameworkDocumentationConfig, 'packageName' | 'packageVersion' | 'generatedAt' | 'integrations'>> & {
    packageName?: string;
    packageVersion?: string;
    generatedAt?: number;
    integrations: FrontierDocumentationIntegrationFlags;
  };
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>> & {
    adapters: string[];
    endpoints: FrontierBackendEndpointConfig[];
    transports: FrontierFrameworkBackendTransportConfig[];
  };
  vite: Required<Omit<FrontierFrameworkViteConfig, 'devServer'>> & {
    devServer: Required<FrontierFrameworkViteDevServerConfig>;
  };
  devtools: Required<FrontierFrameworkDevtoolsConfig>;
  telemetry: Required<FrontierFrameworkTelemetryConfig>;
  auth: Required<Omit<FrontierFrameworkAuthConfig, 'providers' | 'session' | 'profile' | 'linking' | 'gates' | 'routeGuards' | 'capabilities' | 'tokenContracts' | 'runtimeGrants' | 'tags' | 'metadata'>> & {
    providers: FrontierAuthProviderInput[];
    session: NonNullable<FrontierAuthManifestInput['session']>;
    profile: FrontierAuthProfileRequirementInput;
    linking: FrontierAuthLinkingPolicyInput;
    gates: FrontierAuthGateInput[];
    routeGuards: FrontierAuthGateInput[];
    capabilities: FrontierAuthCapabilityInput[];
    tokenContracts: FrontierAuthTokenContractInput[];
    runtimeGrants: FrontierAuthRuntimeGrantInput[];
    tags: string[];
    metadata: JsonObject;
  };
  migrations: Required<Omit<FrontierFrameworkMigrationsConfig, 'sources'>> & {
    sources: Required<FrontierFrameworkMigrationSourceConfig>[];
  };
  sourcePolicy: Required<Omit<FrontierFrameworkSourcePolicyConfig, 'preset' | 'maxFrontierComponentsPerFile' | 'maxLinesPerFile' | 'maxCharsPerFile' | 'include' | 'exclude' | 'runtimeModules' | 'metadata'>> & {
    preset: FrontierFrameworkSourcePolicyPreset;
    maxFrontierComponentsPerFile: number | false;
    maxLinesPerFile: number | false;
    maxCharsPerFile: number | false;
    localImportExtensions: FrontierFrameworkSourcePolicyLocalImportExtensions;
    include: string[];
    exclude: string[];
    runtimeModules: FrontierFrameworkRuntimeModuleConfig[];
    frontendRouteRoots: string[];
    frontendComponentRoots: string[];
    backendHandlerRoots: string[];
    domainRoots: string[];
    generatedRoots: string[];
    forbiddenAdapterCalls: string[];
    allowedAdapterDeclarations: string[];
    metadata: JsonObject;
  };
  conformance: Required<Omit<FrontierFrameworkConformanceConfig, 'requiredPackageUses' | 'metadata'>> & {
    requiredPackageUses: FrontierFrameworkRequiredPackageUseConfig[];
    metadata: JsonObject;
  };
  harness: Required<Omit<FrontierFrameworkHarnessConfig, 'tests' | 'fuzzers' | 'benchmarks' | 'browser' | 'agentKit' | 'linter' | 'hybrid' | 'commands'>> & {
    tests: Required<FrontierFrameworkHarnessGateConfig>;
    fuzzers: Required<FrontierFrameworkHarnessGateConfig>;
    benchmarks: Required<FrontierFrameworkHarnessGateConfig>;
    browser: Required<FrontierFrameworkHarnessGateConfig>;
    agentKit: Required<FrontierFrameworkHarnessGateConfig>;
    linter: Required<FrontierFrameworkHarnessGateConfig>;
    hybrid: Required<FrontierFrameworkHarnessGateConfig>;
    commands: FrontierFrameworkHarnessCommandConfig[];
  };
  agent: Required<Omit<FrontierFrameworkAgentConfig, 'checkpoints'>> & {
    checkpoints: Required<FrontierFrameworkAgentCheckpointConfig>[];
  };
  deploy: Required<FrontierFrameworkDeployConfig>;
  features: FrontierFrameworkFeatureConfig[];
  packages: FrontierFrameworkPackageUse[];
}

export interface FrontierFrameworkPlan {
  config: NormalizedFrontierFrameworkConfig;
  packages: FrontierFrameworkPackageUse[];
  auth: FrontierAuthManifest;
  routes: FrontierRouteManifest;
  routeScenarios: FrontierFrameworkRouteScenarioManifest;
  routeScenarioPlaywright: FrontierFrameworkRouteScenarioPlaywrightPlan;
  surfaces: FrontierFrameworkSurfaceRegistry;
  surfaceCoverage: FrontierFrameworkSurfaceCoverageReport;
  views: FrontierViewManifest;
  manifest: FrontierManifest;
  manifestProof: FrontierManifestProof;
  effects: FrontierEffectManifest;
  tools: FrontierToolsManifest;
  tests: FrontierTestManifest;
  trace: FrontierTrace;
  application: FrontierApplicationGraph;
  deployTargets: FrontierFrameworkDeployTarget[];
  artifacts: FrontierFrameworkArtifactPlan[];
  research: readonly FrontierFrameworkResearchInsight[];
  runtimeAdapters: readonly FrontierFrameworkRuntimeAdapterProfile[];
  syncAdapters: readonly FrontierFrameworkSyncAdapterProfile[];
  agent: FrontierFrameworkAgentPlan;
}

export interface FrontierFrameworkArtifactPlan {
  id: string;
  kind: 'frontend' | 'backend' | 'evidence';
  path: string;
  deployTarget?: string;
  description: string;
}

export interface FrontierFrameworkScaffoldOptions {
  name?: string;
  monorepo?: boolean;
  packageManager?: FrontierFrameworkPackageManager;
}

export interface FrontierFrameworkScaffoldFile {
  path: string;
  content: string;
  executable?: boolean;
}

export interface FrontierFrameworkResearchInsight {
  id: string;
  title: string;
  source: string;
  decision: 'accepted' | 'measured' | 'reference' | 'rejected' | 'needs-revisit';
  transfer: string;
  tags?: readonly string[];
  packages?: readonly string[];
}

export interface FrontierFrameworkRuntimeAdapterProfile {
  id: string;
  package?: string;
  source: string;
  runtime: string;
  contract: 'fetch-handler' | 'server-function' | 'adapter-preset' | 'custom';
  deployTargets: readonly string[];
  tags?: readonly string[];
}

export interface FrontierFrameworkSyncAdapterProfile {
  id: string;
  package?: string;
  source: string;
  protocol: string;
  contract: 'crdt' | 'event-log' | 'shape-stream' | 'query-sync' | 'presence' | 'custom';
  persistence?: readonly string[];
  tags?: readonly string[];
}

export interface FrontierFrameworkAgentCapability {
  id: string;
  title: string;
  command: string;
  reads: readonly string[];
  writes: readonly string[];
  requires: readonly string[];
  produces: readonly string[];
  tags: readonly string[];
  metadata?: JsonObject;
}

export interface FrontierFrameworkAgentPlan {
  kind: 'frontier.framework.agent.plan';
  appId: string;
  enabled: boolean;
  generatedDir: string;
  manifestDir: string;
  runsDir: string;
  runbookFile: string;
  handoffFile: string;
  handoffMode: FrontierFrameworkAgentHandoffMode;
  requirements: {
    featureManifest: boolean;
    evidence: boolean;
    harness: boolean;
    proof: boolean;
    cleanScope: boolean;
    maxOpenQuestions: number;
  };
  capabilities: readonly FrontierFrameworkAgentCapability[];
  checkpoints: readonly Required<FrontierFrameworkAgentCheckpointConfig>[];
}

export const FRONTIER_FRAMEWORK_DEFAULT_PACKAGE_STACK: readonly FrontierFrameworkPackageUse[] = [
  { name: '@shapeshift-labs/frontier', purpose: 'Core JSON patch, registry, runtime budget, and type primitives.' },
  { name: '@shapeshift-labs/frontier-state', purpose: 'Patch-routed app state for browser runtime adapters.', optional: true },
  { name: '@shapeshift-labs/frontier-dom', purpose: 'Default JSX/TSX DOM authoring, hydration, compiler, and devtools.' },
  { name: '@shapeshift-labs/frontier-route', purpose: 'Frontend routes and backend endpoint route resources.' },
  { name: '@shapeshift-labs/frontier-view', purpose: 'Renderer-neutral route and component view manifests.' },
  { name: '@shapeshift-labs/frontier-design', purpose: 'Renderer-neutral design tokens, recipes, CSS variables, and design evidence for frontend surfaces.' },
  { name: '@shapeshift-labs/frontier-component-preview', purpose: 'Generated Frontier component preview manifests, standalone preview books, proof artifacts, and preview harness evidence.' },
  { name: '@shapeshift-labs/frontier-documentation', purpose: 'Generated Frontier documentation manifests, standalone docs books, search records, proof JSONL, and docs harness evidence.' },
  { name: '@shapeshift-labs/frontier-schema', purpose: 'Schema-backed config validation, semantic diagnostics, and explainable config contracts.' },
  { name: '@shapeshift-labs/frontier-auth', purpose: 'Frontier-native auth providers, sessions, gates, token contracts, runtime grants, account-linking policy, and auth evidence.' },
  { name: '@shapeshift-labs/frontier-manifest', purpose: 'Build/source/deploy/test manifest records.' },
  { name: '@shapeshift-labs/frontier-ast-walk', purpose: 'Source graph, import/declaration/call analysis, and business-logic placement evidence for tools and agents.' },
  { name: '@shapeshift-labs/frontier-application', purpose: 'Whole-app graph and impact query surface.' },
  { name: '@shapeshift-labs/frontier-migrations', purpose: 'Boundary-first data migrations for runtime state, query-cache, CRDT snapshots, event logs, DOM state, and app data sources.' },
  { name: '@shapeshift-labs/frontier-effects', purpose: 'Serializable deploy/runtime effects and resources.' },
  { name: '@shapeshift-labs/frontier-tools', purpose: 'Agent-operable CLI and app action manifests.' },
  { name: '@shapeshift-labs/frontier-test', purpose: 'Reusable acceptance and evidence manifests.' },
  { name: '@shapeshift-labs/frontier-workflow', purpose: 'Durable agent evidence workflow manifests and replay process metadata.' },
  { name: '@shapeshift-labs/frontier-trace', purpose: 'Build, route, and deploy trace records.' },
  { name: '@shapeshift-labs/frontier-inspect', purpose: 'Inspection bundles, registry snapshots, and AI-readable feature maps.', optional: true },
  { name: '@shapeshift-labs/frontier-linter', purpose: 'Strict package, manifest, evidence, trace, harness, agent readiness, and SARIF checks.' },
  { name: '@shapeshift-labs/frontier-event-log', purpose: 'Replay cursors, patch events, checkpoints, and server/client catch-up streams.', optional: true },
  { name: '@shapeshift-labs/frontier-state-cache', purpose: 'Normalized query cache, persistence, optimistic layers, and mutation bridge.', optional: true },
  { name: '@shapeshift-labs/frontier-state-cache-idb', purpose: 'Browser IndexedDB state-cache persistence adapter.', optional: true },
  { name: '@shapeshift-labs/frontier-state-cache-file', purpose: 'Node file state-cache persistence adapter.', optional: true },
  { name: '@shapeshift-labs/frontier-state-cache-sql', purpose: 'SQL state-cache persistence adapter contract.', optional: true },
  { name: '@shapeshift-labs/frontier-crdt', purpose: 'CRDT document and operation primitives for local-first apps.', optional: true },
  { name: '@shapeshift-labs/frontier-crdt-sync', purpose: 'CRDT sync model, convergence harnesses, and protocol records.', optional: true },
  { name: '@shapeshift-labs/frontier-crdt-websocket', purpose: 'WebSocket transport adapter for CRDT sync.', optional: true },
  { name: '@shapeshift-labs/frontier-realtime', purpose: 'Realtime room/session contracts for app-owned servers.', optional: true },
  { name: '@shapeshift-labs/frontier-realtime-websocket', purpose: 'WebSocket realtime adapter shape for app-owned deployments.', optional: true },
  { name: '@shapeshift-labs/frontier-logging', purpose: 'Optional structured logs and telemetry sinks.', optional: true },
  { name: '@shapeshift-labs/frontier-policy', purpose: 'Optional capability decisions for actions/effects.', optional: true },
  { name: '@shapeshift-labs/frontier-worker', purpose: 'Optional background job descriptors.', optional: true },
  { name: '@shapeshift-labs/frontier-assets', purpose: 'Optional asset provenance and generated variants.', optional: true },
  { name: '@shapeshift-labs/frontier-history', purpose: 'Temporal explanation, rewind, undo planning, and audit/provenance records.', optional: true },
  { name: '@shapeshift-labs/frontier-playwright', purpose: 'Optional browser evidence harness.', optional: true }
];

export const FRONTIER_FRAMEWORK_DEFAULT_BACKEND_TRANSPORTS: readonly FrontierFrameworkBackendTransportConfig[] = [
  {
    id: 'api.fetch',
    kind: 'fetch',
    protocol: 'http',
    path: '/api/*',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    adapter: 'fetch-handler',
    runtime: 'node|edge|serverless|custom',
    required: true,
    effects: ['backend.request'],
    tags: ['backend', 'fetch-handler', 'http']
  },
  {
    id: 'sync.crdt.websocket',
    kind: 'crdt-websocket',
    protocol: 'websocket',
    path: '/sync/:documentId',
    package: '@shapeshift-labs/frontier-crdt-websocket',
    adapter: '@shapeshift-labs/frontier-crdt-sync',
    runtime: 'app-owned',
    effects: ['sync.connect', 'sync.patch', 'sync.presence'],
    tags: ['backend', 'sync', 'crdt', 'websocket']
  },
  {
    id: 'sync.crdt.model',
    kind: 'crdt-sync',
    protocol: 'custom',
    package: '@shapeshift-labs/frontier-crdt-sync',
    runtime: 'node|browser',
    effects: ['sync.plan', 'sync.converge'],
    tags: ['sync', 'crdt', 'model-checker']
  },
  {
    id: 'events.patch-log',
    kind: 'event-log',
    protocol: 'sse',
    path: '/events/:streamId',
    package: '@shapeshift-labs/frontier-event-log',
    runtime: 'node|browser',
    effects: ['event-log.append', 'event-log.replay', 'event-log.checkpoint'],
    tags: ['backend', 'event-log', 'replay', 'sse']
  },
  {
    id: 'cache.state',
    kind: 'state-cache',
    protocol: 'http',
    path: '/cache/:queryKey',
    package: '@shapeshift-labs/frontier-state-cache',
    runtime: 'node|browser',
    effects: ['cache.read', 'cache.persist', 'cache.optimistic'],
    tags: ['backend', 'state-cache', 'query-cache']
  },
  {
    id: 'rooms.realtime.websocket',
    kind: 'realtime-websocket',
    protocol: 'websocket',
    path: '/realtime/:roomId',
    package: '@shapeshift-labs/frontier-realtime-websocket',
    adapter: '@shapeshift-labs/frontier-realtime',
    runtime: 'app-owned',
    effects: ['realtime.connect', 'realtime.broadcast', 'presence.update'],
    tags: ['backend', 'realtime', 'websocket']
  },
  {
    id: 'workers.tasks',
    kind: 'worker',
    protocol: 'worker',
    package: '@shapeshift-labs/frontier-worker',
    runtime: 'node|edge|browser',
    effects: ['worker.enqueue', 'worker.execute', 'worker.record'],
    tags: ['backend', 'worker', 'async']
  }
];

export const FRONTIER_FRAMEWORK_DEFAULT_MIGRATION_SOURCES: readonly FrontierFrameworkMigrationSourceConfig[] = [
  {
    id: 'app-state',
    kind: 'state',
    source: 'frontier.state.initial',
    required: true,
    versionPath: '/$version',
    metadata: { package: '@shapeshift-labs/frontier-state' }
  },
  {
    id: 'query-cache',
    kind: 'query-cache',
    source: 'frontier.state-cache.persistence',
    dataVersionPaths: ['/metadata/dataVersion', '/dataVersion'],
    writeDataVersionPaths: ['/metadata/dataVersion'],
    required: false,
    metadata: { package: '@shapeshift-labs/frontier-state-cache' }
  },
  {
    id: 'crdt-snapshots',
    kind: 'crdt-snapshot',
    source: 'frontier.crdt.snapshot',
    payloadPaths: ['/view', '/snapshot', '/state', '/data'],
    dataVersionPaths: ['/metadata/dataVersion', '/basis/dataVersion', '/dataVersion'],
    writeDataVersionPaths: ['/metadata/dataVersion'],
    required: false,
    metadata: { package: '@shapeshift-labs/frontier-crdt' }
  },
  {
    id: 'event-log',
    kind: 'event-log-snapshot',
    source: 'frontier.event-log.snapshot',
    payloadPaths: ['/snapshot', '/state', '/data'],
    dataVersionPaths: ['/metadata/dataVersion', '/basis/dataVersion', '/dataVersion'],
    writeDataVersionPaths: ['/metadata/dataVersion'],
    required: false,
    metadata: { package: '@shapeshift-labs/frontier-event-log' }
  }
];

export const FRONTIER_FRAMEWORK_RUNTIME_ADAPTER_CATALOG: readonly FrontierFrameworkRuntimeAdapterProfile[] = [
  { id: 'fetch.standard', source: 'Fetch API', runtime: 'node|edge|serverless|browser-worker', contract: 'fetch-handler', deployTargets: ['node', 'edge', 'serverless', 'custom'], tags: ['backend', 'portable'] },
  { id: 'hono.adapters', package: 'hono', source: 'Hono adapter packages', runtime: 'node|cloudflare|vercel|netlify|lambda|bun|deno', contract: 'fetch-handler', deployTargets: ['cloudflare-workers', 'vercel', 'netlify', 'aws-lambda', 'bun', 'deno'], tags: ['backend', 'adapter'] },
  { id: 'nitro.presets', package: 'nitropack', source: 'Nuxt/Nitro deployment presets', runtime: 'node|edge|serverless|deno|bun', contract: 'adapter-preset', deployTargets: ['node-server', 'cloudflare', 'netlify', 'vercel-edge', 'deno', 'bun'], tags: ['backend', 'preset'] },
  { id: 'tanstack.server-functions', package: '@tanstack/react-start', source: 'TanStack Start server functions', runtime: 'node|edge|serverless', contract: 'server-function', deployTargets: ['node', 'serverless', 'custom'], tags: ['server-functions', 'typed-boundary'] },
  { id: 'react-router.custom-framework', package: 'react-router', source: 'React Router Data/Framework custom framework mode', runtime: 'browser|node|edge', contract: 'custom', deployTargets: ['static', 'ssr', 'custom'], tags: ['route-modules', 'loaders', 'actions'] }
];

export const FRONTIER_FRAMEWORK_SYNC_ADAPTER_CATALOG: readonly FrontierFrameworkSyncAdapterProfile[] = [
  { id: 'frontier.crdt-sync', package: '@shapeshift-labs/frontier-crdt-sync', source: 'Frontier CRDT sync model checker and transport records', protocol: 'custom|websocket', contract: 'crdt', persistence: ['frontier-event-log', 'frontier-state-cache'], tags: ['frontier', 'crdt', 'model-checker'] },
  { id: 'frontier.event-log', package: '@shapeshift-labs/frontier-event-log', source: 'Frontier patch event logs and replay cursors', protocol: 'sse|http|custom', contract: 'event-log', persistence: ['checkpoint', 'consumer-cursor'], tags: ['frontier', 'replay', 'event-log'] },
  { id: 'frontier.state-cache', package: '@shapeshift-labs/frontier-state-cache', source: 'Frontier normalized query-result cache and persistence adapters', protocol: 'http|indexeddb|file|sql', contract: 'query-sync', persistence: ['indexeddb', 'file', 'sql'], tags: ['frontier', 'cache', 'optimistic'] },
  { id: 'automerge.repo', package: '@automerge/automerge-repo', source: 'Automerge Repo network/storage adapters', protocol: 'websocket|broadcast-channel|custom', contract: 'crdt', persistence: ['indexeddb', 'nodefs', 'custom-storage-adapter'], tags: ['external', 'crdt', 'local-first'] },
  { id: 'yjs.websocket', package: 'y-websocket', source: 'Yjs WebsocketProvider awareness/update protocol', protocol: 'websocket', contract: 'presence', persistence: ['ypersistence', 'custom'], tags: ['external', 'crdt', 'presence'] },
  { id: 'electric.shape-stream', package: '@electric-sql/client', source: 'Electric ShapeStream HTTP long-poll shape log', protocol: 'http-long-poll', contract: 'shape-stream', persistence: ['postgres-logical-replication', 'local-materialization'], tags: ['external', 'shape', 'postgres'] },
  { id: 'zero.query-sync', package: '@rocicorp/zero', source: 'Zero query sync and client/server permissions', protocol: 'websocket|http', contract: 'query-sync', persistence: ['client-cache', 'server-replica'], tags: ['external', 'query-sync', 'local-first'] }
];

export const FRONTIER_FRAMEWORK_RESEARCH_INSIGHTS: readonly FrontierFrameworkResearchInsight[] = [
  { id: 'vite.virtual-html', title: 'Vite virtual modules and transformIndexHtml', source: 'Vite plugin API', decision: 'accepted', transfer: 'Expose frontierFrameworkVite() with virtual devtools modules and HTML injection hooks.', tags: ['vite', 'plugin', 'devtools'], packages: ['vite'] },
  { id: 'filesystem-route-discovery', title: 'Framework-aware filesystem route discovery', source: 'Next.js, SvelteKit, Astro, and TanStack Router filesystem routing', decision: 'accepted', transfer: 'Discover route groups, flat route files, dynamic params, optional params, splats, excluded files, conflicts, and route discovery evidence without importing a router runtime.', tags: ['routes', 'filesystem', 'agent-evidence'], packages: ['next', '@sveltejs/kit', 'astro', '@tanstack/react-router'] },
  { id: 'router.custom-framework', title: 'Route module/data mode separation', source: 'React Router custom framework and mode docs', decision: 'accepted', transfer: 'Keep Frontier routes renderer-neutral while allowing loaders/actions/server functions to be declared as tools and effects.', tags: ['routes', 'loaders', 'actions'], packages: ['react-router'] },
  { id: 'server-function-ids', title: 'Stable server function IDs', source: 'TanStack Start server functions', decision: 'accepted', transfer: 'Represent server functions as agent-operable actions with stable IDs instead of owning a backend runtime.', tags: ['server-functions', 'typed-boundary'], packages: ['@tanstack/react-start'] },
  { id: 'adapter-presets', title: 'Adapter preset catalogs', source: 'Nuxt/Nitro, Astro, SvelteKit, Hono adapters', decision: 'accepted', transfer: 'Keep deployment targets as catalog/profile data so frontend and backend artifacts remain independently deployable.', tags: ['deploy', 'adapters'], packages: ['nitropack', 'astro', '@sveltejs/kit', 'hono'] },
  { id: 'trace-rewind', title: 'Trace timeline and snapshot rewind', source: 'Playwright trace viewer and Frontier telemetry surfaces', decision: 'accepted', transfer: 'Make devtools snapshots, state, patches, CRDT updates, event-log replay, trace records, telemetry, and browser trace artifacts first-class evidence outputs through a structural bridge.', tags: ['playwright', 'devtools', 'rewind', 'telemetry', 'crdt'], packages: ['@playwright/test'] },
  { id: 'property-fuzz-corpus', title: 'Property/corpus fuzzing', source: 'QuickCheck, fast-check, libFuzzer, FuzzBench', decision: 'accepted', transfer: 'Generate fast-check-backed app-state model fuzz templates with corpus/replay inputs, deterministic fallback cases, failure artifacts, and replay minimization.', tags: ['fuzz', 'property', 'corpus', 'model-checking'], packages: ['fast-check', '@jazzer.js/core'] },
  { id: 'local-first-sync-catalog', title: 'Local-first sync adapter catalog', source: 'Automerge Repo, Yjs, ElectricSQL, Zero', decision: 'accepted', transfer: 'Publish sync adapter profiles for CRDT, presence, shape-stream, event-log, and query-sync backends without importing them in the framework core.', tags: ['sync', 'crdt', 'local-first'], packages: ['@automerge/automerge-repo', 'y-websocket', '@electric-sql/client', '@rocicorp/zero'] },
  { id: 'frontier-native-auth-contracts', title: 'Auth as app-owned Frontier contracts', source: 'Frontier auth package boundary and app-owned runtime auth constraints', decision: 'accepted', transfer: 'Model providers, sessions, profile completeness, account linking, route/resource gates, token issue/verify contracts, runtime grants, redaction, lint resources, and evidence as Frontier manifests without owning app crypto/secrets/storage.', tags: ['auth', 'security', 'session', 'runtime', 'agent'], packages: ['@shapeshift-labs/frontier-auth'] },
  { id: 'agent-operability-bundle', title: 'Agent-operable project graph exports', source: 'Frontier tools, linter, test, workflow, application, and MCP-style tool descriptors', decision: 'accepted', transfer: 'Generate MCP/tool manifests, CI evidence gates, SARIF/linter output, issue/PR handoff bundles, and replay scripts from the same Frontier project graph.', tags: ['agent', 'mcp', 'sarif', 'ci', 'replay'], packages: ['@shapeshift-labs/frontier-tools', '@shapeshift-labs/frontier-linter', '@shapeshift-labs/frontier-test', '@shapeshift-labs/frontier-workflow', '@shapeshift-labs/frontier-application'] },
  { id: 'runtime-data-migrations', title: 'Runtime data-source migrations before hydration', source: 'frontier-migrations boundary/runtime source helpers', decision: 'accepted', transfer: 'Generate migration manifests and a bridge that normalizes persisted app state, query-cache snapshots, CRDT snapshots, event logs, and DOM state before runtime consumers hydrate them.', tags: ['migrations', 'state', 'cache', 'crdt', 'event-log'], packages: ['@shapeshift-labs/frontier-migrations', '@shapeshift-labs/frontier-state', '@shapeshift-labs/frontier-state-cache'] }
];

export const FRONTIER_FRAMEWORK_DEFAULT_AGENT_CHECKPOINTS: readonly FrontierFrameworkAgentCheckpointConfig[] = [
  {
    id: 'agent.orient',
    title: 'Orient on config, app graph, package boundary, and dirty scope',
    source: 'config',
    required: true,
    command: 'frontier inspect --json',
    artifacts: ['frontier.config.mjs', 'dist/frontier/application.json'],
    tags: ['agent', 'orient']
  },
  {
    id: 'agent.feature-contract',
    title: 'Declare or update feature manifest before broad implementation',
    source: 'feature',
    required: true,
    query: 'features/*.json',
    artifacts: ['features/*.json'],
    tags: ['agent', 'feature-manifest']
  },
  {
    id: 'agent.evidence',
    title: 'Emit compact evidence, manifests, traces, tools, and test records',
    source: 'evidence',
    required: true,
    command: 'frontier build --target evidence',
    artifacts: ['dist/frontier/evidence.json', 'dist/frontier/manifest-proof.json', 'dist/frontier/component-preview.json', '.frontier-framework/component-preview/index.html'],
    tags: ['agent', 'evidence']
  },
  {
    id: 'agent.harness',
    title: 'Validate harness gates and generated fuzz/benchmark/browser templates',
    source: 'harness',
    required: true,
    command: 'frontier harness --json',
    artifacts: ['dist/frontier/harness/evidence.json', '.frontier-framework/harness/harness-plan.json'],
    tags: ['agent', 'harness']
  },
  {
    id: 'agent.handoff',
    title: 'Produce a concise handoff with gates, evidence paths, and open questions',
    source: 'handoff',
    required: true,
    command: 'frontier agent --json',
    artifacts: ['.frontier-framework/agent/HANDOFF.md', '.frontier-framework/agent/agent-readiness.json'],
    tags: ['agent', 'handoff']
  },
  {
    id: 'agent.operability-bundle',
    title: 'Emit MCP tools, CI gates, SARIF, issue/PR handoff bundles, and replay scripts',
    source: 'handoff',
    required: true,
    command: 'frontier agent --json',
    artifacts: ['.frontier-framework/agent/mcp-tools.json', '.frontier-framework/agent/tool-manifest.json', '.frontier-framework/agent/ci-evidence-gates.json', '.frontier-framework/agent/frontier-agent-lint.json', '.frontier-framework/agent/frontier-agent-lint.sarif', '.frontier-framework/agent/frontier-agent-replay.mjs', '.frontier-framework/agent/ISSUE-HANDOFF.md', '.frontier-framework/agent/PR-HANDOFF.md'],
    tags: ['agent', 'mcp', 'ci', 'sarif', 'replay', 'handoff']
  }
];

export function defineFrontierConfig(config: FrontierFrameworkConfig): FrontierFrameworkConfig {
  return config;
}

export function defineRuntimeModule(id: string, config?: Omit<FrontierFrameworkRuntimeModuleConfig, 'id'>): FrontierFrameworkRuntimeModuleConfig;
export function defineRuntimeModule(config: FrontierFrameworkRuntimeModuleConfig): FrontierFrameworkRuntimeModuleConfig;
export function defineRuntimeModule(
  input: string | FrontierFrameworkRuntimeModuleConfig,
  config: Omit<FrontierFrameworkRuntimeModuleConfig, 'id'> = {}
): FrontierFrameworkRuntimeModuleConfig {
  const source: FrontierFrameworkRuntimeModuleConfig = typeof input === 'string' ? { ...config, id: input } : input;
  const bindings = (source.bindings ?? []).map(normalizeRuntimeModuleBinding);
  const ownedKinds = uniqueStrings([
    ...(source.owns ?? []),
    ...(source.kind ? [source.kind] : []),
    ...bindings.map((binding) => binding.kind)
  ]);
  return {
    id: source.id,
    kind: source.kind ?? ownedKinds[0] ?? 'custom',
    title: source.title ?? source.id,
    file: source.file,
    files: [...(source.files ?? (source.file ? [source.file] : []))],
    owner: source.owner,
    owns: ownedKinds,
    bindings,
    reads: [...(source.reads ?? [])],
    writes: [...(source.writes ?? [])],
    actions: [...(source.actions ?? [])],
    effects: [...(source.effects ?? [])],
    capabilities: [...(source.capabilities ?? [])],
    evidence: [...(source.evidence ?? [])],
    tags: [...(source.tags ?? [])],
    metadata: source.metadata ?? {}
  };
}

export function createRouteScenarioManifest(
  config: FrontierFrameworkConfig = {}
): FrontierFrameworkRouteScenarioManifest {
  return createRouteScenarioManifestFromConfig(normalizeFrontierFrameworkConfig(config));
}

export function createRouteScenarioPlaywrightPlan(
  config: FrontierFrameworkConfig = {},
  options: FrontierFrameworkRouteScenarioPlaywrightPlanOptions = {}
): FrontierFrameworkRouteScenarioPlaywrightPlan {
  const normalized = normalizeFrontierFrameworkConfig(config);
  return createRouteScenarioPlaywrightPlanFromConfig(normalized, options);
}

export function createSurfaceRegistry(
  config: FrontierFrameworkConfig = {}
): FrontierFrameworkSurfaceRegistry {
  return createSurfaceRegistryFromConfig(normalizeFrontierFrameworkConfig(config));
}

export function createSurfaceStatusReport(
  config: FrontierFrameworkConfig = {},
  query: FrontierFrameworkSurfaceStatusQuery = {}
): FrontierFrameworkSurfaceStatusReport {
  const normalized = normalizeFrontierFrameworkConfig(config);
  const routeScenarios = createRouteScenarioManifestFromConfig(normalized);
  const routeScenarioPlaywright = createRouteScenarioPlaywrightPlanFromManifest(normalized, routeScenarios);
  const registry = createSurfaceRegistryFromConfig(normalized);
  const status = createSurfaceStatusReportFromRegistry(registry, query);
  const coverage = createSurfaceCoverageReportFromInputs(
    normalized,
    registry,
    routeScenarios,
    routeScenarioPlaywright
  );
  return attachSurfaceStatusCoverage(status, coverage);
}

export function createSurfaceStatusReportFromRegistry(
  registry: FrontierFrameworkSurfaceRegistry,
  query: FrontierFrameworkSurfaceStatusQuery = {}
): FrontierFrameworkSurfaceStatusReport {
  const normalizedQuery = normalizeSurfaceStatusQuery(query);
  const surfaces = registry.surfaces.filter((surface) => surfaceMatchesSurfaceStatusQuery(surface, normalizedQuery));
  const statusIds = new Map(registry.statuses.map((status) => [status.id, status]));
  const summary = createSurfaceStatusSummary(surfaces, statusIds);
  return {
    kind: 'frontier.framework.surface-status.report',
    version: 1,
    appId: registry.appId,
    query: normalizedQuery,
    surfaces,
    summary
  };
}

export function createSurfaceCoverageReport(
  config: FrontierFrameworkConfig = {}
): FrontierFrameworkSurfaceCoverageReport {
  const normalized = normalizeFrontierFrameworkConfig(config);
  const routeScenarios = createRouteScenarioManifestFromConfig(normalized);
  const routeScenarioPlaywright = createRouteScenarioPlaywrightPlanFromManifest(normalized, routeScenarios);
  return createSurfaceCoverageReportFromInputs(
    normalized,
    createSurfaceRegistryFromConfig(normalized),
    routeScenarios,
    routeScenarioPlaywright
  );
}

function attachSurfaceStatusCoverage(
  status: FrontierFrameworkSurfaceStatusReport,
  coverage: FrontierFrameworkSurfaceCoverageReport
): FrontierFrameworkSurfaceStatusReport {
  const matchedIds = new Set(status.surfaces.map((surface) => surface.id));
  const records = coverage.records.filter((record) => matchedIds.has(record.surface.id));
  return {
    ...status,
    coverage: {
      enabled: coverage.enabled,
      ok: records.every((record) => record.ok),
      missingCount: records.filter((record) => !record.ok).length,
      nextProbeCount: records.reduce((sum, record) => sum + record.nextProbes.length, 0),
      records: records.map((record) => ({
        surfaceId: record.surface.id,
        ok: record.ok,
        required: [...record.required],
        covered: [...record.covered],
        missing: [...record.missing],
        nextCommand: agentLoopNextCommand(record),
        nextProbes: record.nextProbes.map((probe) => ({ ...probe, tags: [...probe.tags] }))
      }))
    }
  };
}

export function createFrontierAgentLoopReport(
  config: FrontierFrameworkConfig = {},
  query: FrontierFrameworkSurfaceStatusQuery = {}
): FrontierFrameworkAgentLoopReport {
  const normalized = normalizeFrontierFrameworkConfig(config);
  const routeScenarios = createRouteScenarioManifestFromConfig(normalized);
  const routeScenarioPlaywright = createRouteScenarioPlaywrightPlanFromManifest(normalized, routeScenarios);
  const registry = createSurfaceRegistryFromConfig(normalized);
  const coverage = createSurfaceCoverageReportFromInputs(
    normalized,
    registry,
    routeScenarios,
    routeScenarioPlaywright
  );
  return createAgentLoopReportFromInputs(normalized, registry, coverage, query);
}

export function createSurfaceCoverageReportFromInputs(
  config: NormalizedFrontierFrameworkConfig,
  registry: FrontierFrameworkSurfaceRegistry,
  routeScenarios: FrontierFrameworkRouteScenarioManifest,
  routeScenarioPlaywright: FrontierFrameworkRouteScenarioPlaywrightPlan
): FrontierFrameworkSurfaceCoverageReport {
  const enabled = registry.enabled && config.surfaces.coverage.enabled;
  const requiredStatuses = new Set(config.surfaces.coverage.requireEvidenceForStatuses);
  const renderKinds = new Set(config.surfaces.coverage.requireRenderForKinds);
  const stateKinds = new Set(config.surfaces.coverage.requireStateForKinds);
  const records = enabled
    ? registry.surfaces.map((surface) => createSurfaceCoverageRecord(surface, {
      reportFile: config.surfaces.coverage.reportFile,
      requiredStatuses,
      renderKinds,
      stateKinds,
      probesForKinds: config.surfaces.coverage.requireProbesForKinds,
      routeScenarios,
      routeScenarioPlaywright
    }))
    : [];
  const summary = createSurfaceCoverageSummary(records);
  return {
    kind: 'frontier.framework.surface-coverage.report',
    version: 1,
    appId: config.id,
    enabled,
    ok: summary.missingCount === 0,
    reportFile: config.surfaces.coverage.reportFile,
    dashboardFile: config.surfaces.coverage.dashboardFile,
    failOnMissing: config.surfaces.coverage.failOnMissing,
    requiredStatuses: [...config.surfaces.coverage.requireEvidenceForStatuses],
    records,
    dashboard: createSurfaceCoverageDashboard(records),
    summary
  };
}

export function bindDomEvents(input: FrontierFrameworkRuntimeModuleBindingInput = {}): FrontierFrameworkRuntimeModuleBindingConfig {
  return normalizeRuntimeModuleBinding({ ...input, kind: 'dom-events', capabilities: [...(input.capabilities ?? []), 'dom.events'] });
}

export function bindFormActions(input: FrontierFrameworkRuntimeModuleBindingInput = {}): FrontierFrameworkRuntimeModuleBindingConfig {
  return normalizeRuntimeModuleBinding({ ...input, kind: 'form-actions', capabilities: [...(input.capabilities ?? []), 'forms.dispatch'] });
}

export function bindToolSurface(input: FrontierFrameworkRuntimeModuleBindingInput = {}): FrontierFrameworkRuntimeModuleBindingConfig {
  return normalizeRuntimeModuleBinding({ ...input, kind: 'tool-surface', capabilities: [...(input.capabilities ?? []), 'tools.surface'] });
}

export function bindOfflineSnapshot(input: FrontierFrameworkRuntimeModuleBindingInput = {}): FrontierFrameworkRuntimeModuleBindingConfig {
  return normalizeRuntimeModuleBinding({ ...input, kind: 'offline-snapshot', capabilities: [...(input.capabilities ?? []), 'offline.snapshot'] });
}

export function bindTestApi(input: FrontierFrameworkRuntimeModuleBindingInput = {}): FrontierFrameworkRuntimeModuleBindingConfig {
  return normalizeRuntimeModuleBinding({ ...input, kind: 'test-api', capabilities: [...(input.capabilities ?? []), 'test.api'] });
}

export function explainFrontierFrameworkConfig(query?: string): readonly FrontierFrameworkConfigExplainEntry[] {
  const normalizedQuery = (query ?? '').trim();
  if (!normalizedQuery) return FRONTIER_FRAMEWORK_CONFIG_EXPLAIN;
  const lowerQuery = normalizedQuery.toLowerCase();
  return FRONTIER_FRAMEWORK_CONFIG_EXPLAIN.filter((entry) => {
    const path = entry.path.toLowerCase();
    return (
      path === lowerQuery
      || path.startsWith(lowerQuery + '.')
      || path.includes(lowerQuery)
      || (entry.tags ?? []).some((tag) => tag.toLowerCase() === lowerQuery)
    );
  });
}

export function validateFrontierFrameworkConfig(
  config: unknown = {},
  options: FrontierFrameworkConfigValidationOptions = {}
): FrontierFrameworkConfigValidationResult {
  const maxDiagnostics = options.maxDiagnostics ?? 80;
  const schemaResult = validateJsonSchemaContract(config, FRONTIER_FRAMEWORK_CONFIG_SCHEMA, {
    maxIssues: maxDiagnostics,
    strictSchema: { maxIssues: 20 }
  });
  const diagnostics: FrontierFrameworkConfigDiagnostic[] = schemaResult.issues.map(schemaIssueToConfigDiagnostic);
  if (isRecord(config)) {
    addSemanticConfigDiagnostics(config, diagnostics, maxDiagnostics);
  }
  return {
    kind: 'frontier.framework.config.validation',
    appId: readStringProperty(config, 'id') ?? readConfigNameId(config),
    ok: diagnostics.every((diagnostic) => diagnostic.severity !== 'error'),
    schemaValid: schemaResult.valid,
    generatedAt: new Date().toISOString(),
    schema: {
      id: FRONTIER_FRAMEWORK_CONFIG_SCHEMA_ID,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      version: 1
    },
    diagnostics,
    explain: options.explain === false ? [] : FRONTIER_FRAMEWORK_CONFIG_EXPLAIN
  };
}

export function normalizeFrontierFrameworkConfig(config: FrontierFrameworkConfig = {}): NormalizedFrontierFrameworkConfig {
  const name = config.name ?? 'frontier-framework';
  const id = config.id ?? slugify(name);
  const workspaceInput = config.workspace ?? {};
  const workspace = {
    kind: workspaceInput.kind ?? 'monorepo',
    appsDir: workspaceInput.appsDir ?? 'apps',
    packagesDir: workspaceInput.packagesDir ?? 'packages',
    frontendPackage: workspaceInput.frontendPackage ?? 'web',
    backendPackage: workspaceInput.backendPackage ?? 'api',
    contractsPackage: workspaceInput.contractsPackage ?? 'contracts',
    packageManager: workspaceInput.packageManager ?? 'npm',
    taskRunner: workspaceInput.taskRunner ?? 'turbo'
  };
  const frontendInput = config.frontend ?? {};
  const frontendRoot = frontendInput.root ?? (workspace.kind === 'monorepo' ? workspace.appsDir + '/' + workspace.frontendPackage : '.');
  const frontendOut = frontendInput.outDir ?? 'dist/frontend';
  const frontend = {
    root: frontendRoot,
    routesDir: frontendInput.routesDir ?? 'src/routes',
    componentsDir: frontendInput.componentsDir ?? 'src/components',
    assetsDir: frontendInput.assetsDir ?? 'public',
    outDir: frontendOut,
    evidenceDir: frontendInput.evidenceDir ?? 'dist/frontier',
    cacheDir: frontendInput.cacheDir ?? '.frontier-framework/cache/frontend',
    incremental: frontendInput.incremental ?? true,
    jsxImportSource: frontendInput.jsxImportSource ?? '@shapeshift-labs/frontier-dom',
    routes: [...(frontendInput.routes ?? [])],
    shell: {
      title: frontendInput.shell?.title ?? name,
      lang: frontendInput.shell?.lang ?? 'en',
      appRootId: frontendInput.shell?.appRootId ?? 'frontier-framework',
      ...frontendInput.shell
    }
  };
  const surfaceIntents = normalizeSurfaceIntentConfigs(config.surfaces?.intents);
  const routeScenariosInput = config.routeScenarios ?? {};
  const routeScenariosGeneratedDir = routeScenariosInput.generatedDir ?? '.frontier-framework/route-scenarios';
  const configuredRouteScenarios = (routeScenariosInput.scenarios ?? []).map((scenario) => normalizeRouteScenario(scenario));
  const generatedRouteScenarios = createSurfaceIntentRouteScenarios(surfaceIntents, configuredRouteScenarios);
  const routeScenarios = {
    enabled: routeScenariosInput.enabled ?? true,
    generatedDir: routeScenariosGeneratedDir,
    manifestFile: routeScenariosInput.manifestFile ?? routeScenariosGeneratedDir + '/manifest.json',
    playwrightPlanFile: routeScenariosInput.playwrightPlanFile ?? routeScenariosGeneratedDir + '/playwright-plan.json',
    fixtures: (routeScenariosInput.fixtures ?? []).map(normalizeRouteScenarioFixture),
    scenarios: [...configuredRouteScenarios, ...generatedRouteScenarios],
    tags: [...(routeScenariosInput.tags ?? [])],
    metadata: routeScenariosInput.metadata ?? {}
  };
  const surfacesInput = config.surfaces ?? {};
  const surfacesGeneratedDir = surfacesInput.generatedDir ?? '.frontier-framework/surfaces';
  const surfaces = normalizeSurfacesConfig(surfacesInput, {
    appId: id,
    generatedDir: surfacesGeneratedDir,
    frontendRoutes: frontend.routes,
    features: [...(config.features ?? [])],
    intents: surfaceIntents
  });
  const backendInput = config.backend ?? {};
  const componentPreviewInput = config.componentPreview ?? {};
  const componentPreview = {
    enabled: componentPreviewInput.enabled ?? true,
    rootDir: componentPreviewInput.rootDir ?? '.',
    outDir: componentPreviewInput.outDir ?? '.frontier-framework/component-preview',
    include: [...(componentPreviewInput.include ?? [joinAppPath(frontend.root, frontend.componentsDir)])],
    exclude: [...(componentPreviewInput.exclude ?? [
      'node_modules/**',
      'dist/**',
      '.frontier-framework/cache/**',
      '.git/**',
      '**/*.test.*',
      '**/*.spec.*'
    ])],
    extensions: [...(componentPreviewInput.extensions ?? ['.tsx', '.jsx'])],
    packageName: componentPreviewInput.packageName,
    renderer: componentPreviewInput.renderer ?? 'frontier-dom',
    generatedAt: componentPreviewInput.generatedAt,
    defaultVariants: componentPreviewInput.defaultVariants ? [...componentPreviewInput.defaultVariants] : undefined,
    integrations: { ...(componentPreviewInput.integrations ?? {}) },
    manifestFileName: componentPreviewInput.manifestFileName ?? 'manifest.json',
    moduleFileName: componentPreviewInput.moduleFileName ?? 'preview-module.mjs',
    htmlFileName: componentPreviewInput.htmlFileName ?? 'index.html',
    title: componentPreviewInput.title ?? name + ' Component Previews',
    maxFiles: componentPreviewInput.maxFiles ?? 5000
  };
  const documentationInput = config.documentation ?? {};
  const documentation: NormalizedFrontierFrameworkConfig['documentation'] = {
    enabled: documentationInput.enabled ?? true,
    rootDir: documentationInput.rootDir ?? '.',
    outDir: documentationInput.outDir ?? '.frontier-framework/documentation',
    include: [...(documentationInput.include ?? [
      'README.md',
      'docs',
      'features',
      joinAppPath(frontend.root, frontend.routesDir),
      joinAppPath(frontend.root, frontend.componentsDir),
      backendInput.root ?? (workspace.kind === 'monorepo' ? workspace.appsDir + '/' + workspace.backendPackage : 'server'),
      workspace.packagesDir
    ])],
    exclude: [...(documentationInput.exclude ?? [
      'node_modules',
      'dist',
      '.frontier-framework',
      'coverage',
      '.git',
      '.next',
      '.turbo',
      'benchmarks/results'
    ])],
    packageName: documentationInput.packageName,
    packageVersion: documentationInput.packageVersion,
    generatedAt: documentationInput.generatedAt,
    integrations: { ...(documentationInput.integrations ?? {}) },
    manifestFileName: documentationInput.manifestFileName ?? 'manifest.json',
    moduleFileName: documentationInput.moduleFileName ?? 'docs-module.mjs',
    htmlFileName: documentationInput.htmlFileName ?? 'index.html',
    searchFileName: documentationInput.searchFileName ?? 'search.json',
    evidenceFileName: documentationInput.evidenceFileName ?? 'evidence.json',
    jsonlFileName: documentationInput.jsonlFileName ?? 'documentation.jsonl',
    title: documentationInput.title ?? name + ' Documentation',
    maxFiles: documentationInput.maxFiles ?? 5000
  };
  const backend = {
    root: backendInput.root ?? (workspace.kind === 'monorepo' ? workspace.appsDir + '/' + workspace.backendPackage : 'server'),
    entry: backendInput.entry ?? 'src/handler.ts',
    outDir: backendInput.outDir ?? 'dist/backend',
    handlerExport: backendInput.handlerExport ?? 'handleFrontierRequest',
    adapters: [...(backendInput.adapters ?? ['node', 'edge', 'serverless', 'custom'])],
    endpoints: [...(backendInput.endpoints ?? [{ path: '/api/health', method: 'GET', feature: 'system' }])],
    transports: (backendInput.transports ?? FRONTIER_FRAMEWORK_DEFAULT_BACKEND_TRANSPORTS).map(normalizeTransport)
  };
  const viteInput = config.vite ?? {};
  const viteHmr = viteInput.hmr ?? viteInput.devServer?.hmr ?? true;
  const vite = {
    enabled: viteInput.enabled ?? true,
    hmr: viteHmr,
    configFile: viteInput.configFile ?? 'vite.config.ts',
    generatedEntryDir: viteInput.generatedEntryDir ?? '.frontier-framework/vite',
    outDir: viteInput.outDir ?? frontend.outDir + '/assets',
    plugin: viteInput.plugin ?? 'frontier-framework',
    strict: viteInput.strict ?? false,
    devServer: {
      host: viteInput.devServer?.host ?? '127.0.0.1',
      port: viteInput.devServer?.port ?? 5173,
      open: viteInput.devServer?.open ?? false,
      hmr: viteHmr
    }
  };
  const devtoolsInput = config.devtools ?? {};
  const devtools = {
    enabled: devtoolsInput.enabled ?? true,
    floatingButton: devtoolsInput.floatingButton ?? true,
    globalName: devtoolsInput.globalName ?? '__FRONTIER_DEVTOOLS__',
    bridgeGlobalName: devtoolsInput.bridgeGlobalName ?? devtoolsInput.globalName ?? '__FRONTIER_DEVTOOLS__',
    scriptPath: devtoolsInput.scriptPath ?? '/frontier-devtools.js',
    rewind: devtoolsInput.rewind ?? true,
    timeline: devtoolsInput.timeline ?? true,
    telemetry: devtoolsInput.telemetry ?? true,
    stateSnapshots: devtoolsInput.stateSnapshots ?? true,
    patches: devtoolsInput.patches ?? true,
    crdt: devtoolsInput.crdt ?? true,
    eventLog: devtoolsInput.eventLog ?? true,
    traces: devtoolsInput.traces ?? true,
    autoBridge: devtoolsInput.autoBridge ?? true,
    maxRecords: devtoolsInput.maxRecords ?? 160,
    includeInBuild: devtoolsInput.includeInBuild ?? true
  };
  const telemetryInput = config.telemetry ?? {};
  const telemetry = {
    enabled: telemetryInput.enabled ?? true,
    logging: telemetryInput.logging ?? true,
    trace: telemetryInput.trace ?? true,
    inspect: telemetryInput.inspect ?? true,
    redaction: telemetryInput.redaction ?? true,
    jsonl: telemetryInput.jsonl ?? true,
    sinks: [...(telemetryInput.sinks ?? ['frontier.logging.browser', 'frontier.trace.jsonl', 'frontier.inspect.bundle'])]
  };
  const authInput = config.auth ?? {};
  const authGeneratedDir = authInput.generatedDir ?? '.frontier-framework/auth';
  const authSessionStrategy = authInput.sessionStrategy ?? authInput.session?.strategy ?? 'jwt';
  const auth = {
    enabled: authInput.enabled ?? true,
    generatedDir: authGeneratedDir,
    manifestFile: authInput.manifestFile ?? authGeneratedDir + '/auth-manifest.json',
    evidenceFile: authInput.evidenceFile ?? frontend.evidenceDir + '/auth.json',
    strict: authInput.strict ?? false,
    failOnMissingGate: authInput.failOnMissingGate ?? authInput.strict ?? false,
    sessionStrategy: authSessionStrategy,
    providers: [...(authInput.providers ?? defaultAuthProviders())],
    session: {
      ...(authInput.session ?? {}),
      strategy: authSessionStrategy
    },
    profile: authInput.profile ?? defaultAuthProfileRequirement(),
    linking: authInput.linking ?? defaultAuthLinkingPolicy(),
    gates: [...(authInput.gates ?? [])],
    routeGuards: [...(authInput.routeGuards ?? defaultAuthRouteGuards(frontend, backend))],
    capabilities: [...(authInput.capabilities ?? defaultAuthCapabilities(backend))],
    tokenContracts: [...(authInput.tokenContracts ?? defaultAuthTokenContracts(id))],
    runtimeGrants: [...(authInput.runtimeGrants ?? defaultAuthRuntimeGrants(id))],
    tags: [...(authInput.tags ?? [])],
    metadata: authInput.metadata ?? {}
  };
  const migrationsInput = config.migrations ?? {};
  const migrationsGeneratedDir = migrationsInput.generatedDir ?? '.frontier-framework/migrations';
  const migrations = {
    enabled: migrationsInput.enabled ?? true,
    currentVersion: migrationsInput.currentVersion ?? '1',
    initialVersion: migrationsInput.initialVersion ?? '1',
    registryId: migrationsInput.registryId ?? id + '.migrations',
    generatedDir: migrationsGeneratedDir,
    evidenceFile: migrationsInput.evidenceFile ?? frontend.evidenceDir + '/migrations.json',
    runtimeBridgeFile: migrationsInput.runtimeBridgeFile ?? migrationsGeneratedDir + '/frontier-runtime-migrations.mjs',
    strict: migrationsInput.strict ?? false,
    failOnMissingVersion: migrationsInput.failOnMissingVersion ?? true,
    autoMigrateState: migrationsInput.autoMigrateState ?? true,
    autoMigrateCache: migrationsInput.autoMigrateCache ?? true,
    sources: (migrationsInput.sources ?? FRONTIER_FRAMEWORK_DEFAULT_MIGRATION_SOURCES).map((source, index) => normalizeMigrationSource(source, index, migrationsInput.currentVersion ?? '1'))
  };
  const sourcePolicyInput = config.sourcePolicy ?? {};
  const sourcePolicyPreset = sourcePolicyInput.preset ?? 'adapter';
  const sourcePolicyDefaults = sourcePolicyPresetDefaults(sourcePolicyPreset, workspace, frontend, backend);
  const sourcePolicy = {
    enabled: sourcePolicyInput.enabled ?? true,
    preset: sourcePolicyPreset,
    enforcement: sourcePolicyInput.enforcement ?? sourcePolicyDefaults.enforcement,
    maxFrontierComponentsPerFile: sourcePolicyInput.maxFrontierComponentsPerFile ?? sourcePolicyDefaults.maxFrontierComponentsPerFile,
    maxLinesPerFile: sourcePolicyInput.maxLinesPerFile ?? sourcePolicyDefaults.maxLinesPerFile,
    maxCharsPerFile: sourcePolicyInput.maxCharsPerFile ?? sourcePolicyDefaults.maxCharsPerFile,
    localImportExtensions: sourcePolicyInput.localImportExtensions ?? sourcePolicyDefaults.localImportExtensions,
    businessLogic: sourcePolicyInput.businessLogic ?? sourcePolicyDefaults.businessLogic,
    businessLogicSeverity: sourcePolicyInput.businessLogicSeverity ?? 'error',
    sourceGraphFile: sourcePolicyInput.sourceGraphFile ?? frontend.evidenceDir + '/source-graph.json',
    sourceGraphRegistryFile: sourcePolicyInput.sourceGraphRegistryFile ?? frontend.evidenceDir + '/source-registry.json',
    frontendRouteRoots: [...(sourcePolicyInput.frontendRouteRoots ?? [joinAppPath(frontend.root, frontend.routesDir)])],
    frontendComponentRoots: [...(sourcePolicyInput.frontendComponentRoots ?? [joinAppPath(frontend.root, frontend.componentsDir)])],
    backendHandlerRoots: [...(sourcePolicyInput.backendHandlerRoots ?? [joinAppPath(backend.root, dirnameAppPath(backend.entry))])],
    domainRoots: [...(sourcePolicyInput.domainRoots ?? defaultDomainRoots(workspace))],
    generatedRoots: [...(sourcePolicyInput.generatedRoots ?? ['generated', 'dist', '.frontier-framework', '.frontier'])],
    forbiddenAdapterCalls: [...(sourcePolicyInput.forbiddenAdapterCalls ?? ['fetch', 'WebSocket', 'EventSource', 'BroadcastChannel', 'Worker', 'localStorage', 'sessionStorage', 'indexedDB', 'caches', 'navigator.clipboard', 'setTimeout', 'setInterval', 'Date.now', 'Math.random'])],
    allowedAdapterDeclarations: [...(sourcePolicyInput.allowedAdapterDeclarations ?? ['Page', 'Layout', 'Route', 'Component', 'default', 'handleFrontierRequest', 'loader', 'action', 'headers', 'meta', 'links'])],
    include: [...(sourcePolicyInput.include ?? sourcePolicyDefaults.include)],
    exclude: [...(sourcePolicyInput.exclude ?? defaultSourcePolicyExcludes())],
    runtimeModules: (sourcePolicyInput.runtimeModules ?? []).map((module) => defineRuntimeModule(module)),
    metadata: sourcePolicyInput.metadata ?? {}
  };
  const conformanceInput = config.conformance ?? {};
  const conformanceMode = conformanceInput.mode ?? 'strict';
  const conformanceEnabled = conformanceInput.enabled ?? conformanceMode !== 'off';
  const conformanceGeneratedDir = conformanceInput.generatedDir ?? frontend.evidenceDir;
  const conformanceIsMigration = conformanceMode === 'migration';
  const conformance = {
    enabled: conformanceEnabled,
    mode: conformanceMode,
    enforcement: conformanceInput.enforcement ?? (conformanceIsMigration ? 'warn' : 'error'),
    failOnViolation: conformanceInput.failOnViolation ?? conformanceMode === 'strict',
    generatedDir: conformanceGeneratedDir,
    reportFile: conformanceInput.reportFile ?? conformanceGeneratedDir + '/conformance.json',
    sarifFile: conformanceInput.sarifFile ?? conformanceGeneratedDir + '/conformance.sarif',
    requiredPackageUses: normalizeRequiredPackageUses(conformanceInput.requiredPackageUses ?? defaultRequiredPackageUses(frontend, backend, componentPreview, documentation, migrations, telemetry, auth)),
    metadata: conformanceInput.metadata ?? {}
  };
  const harnessInput = config.harness ?? {};
  const harnessMode = harnessInput.mode ?? (harnessInput.strict ? 'strict' : 'recommended');
  const harness = {
    mode: harnessMode,
    strict: harnessInput.strict ?? harnessMode === 'strict',
    failOnMissing: harnessInput.failOnMissing ?? harnessMode === 'strict',
    generatedDir: harnessInput.generatedDir ?? '.frontier-framework/harness',
    evidenceDir: harnessInput.evidenceDir ?? frontend.evidenceDir + '/harness',
    corpusDir: harnessInput.corpusDir ?? 'test/fixtures/frontier-framework-corpus',
    fixturesDir: harnessInput.fixturesDir ?? 'test/fixtures/frontier-framework',
    autoRun: harnessInput.autoRun ?? 'plan',
    replayFailures: harnessInput.replayFailures ?? true,
    minimizeCorpus: harnessInput.minimizeCorpus ?? true,
    browserTrace: harnessInput.browserTrace ?? 'retain-on-failure',
    tests: normalizeHarnessGate(harnessInput.tests, { command: 'npm test', required: true, tags: ['test'] }),
    fuzzers: normalizeHarnessGate(harnessInput.fuzzers, { command: 'npm run fuzz', required: harnessMode === 'strict', tags: ['fuzz'] }),
    benchmarks: normalizeHarnessGate(harnessInput.benchmarks, { command: 'npm run bench', required: harnessMode === 'strict', tags: ['benchmark'] }),
    browser: normalizeHarnessGate(harnessInput.browser, { command: 'npm run browser', required: harnessMode === 'strict', packages: ['@playwright/test', '@shapeshift-labs/frontier-playwright'], tags: ['browser', 'playwright', 'frontier-playwright'] }),
    agentKit: normalizeHarnessGate(harnessInput.agentKit, { command: 'frontier harness --agent', required: true, files: ['features/*.json'], tags: ['agent', 'evidence'] }),
    linter: normalizeHarnessGate(harnessInput.linter, { command: 'frontier lint', required: harnessMode === 'strict' || conformance.failOnViolation, packages: ['@shapeshift-labs/frontier-linter'], files: [conformance.reportFile], tags: ['lint', 'conformance'] }),
    hybrid: normalizeHarnessGate(harnessInput.hybrid, { command: 'frontier harness --hybrid', required: true, tags: ['hybrid', 'telemetry', 'agent'] }),
    commands: [...(harnessInput.commands ?? defaultHarnessCommands(harnessMode))]
  };
  const agentInput = config.agent ?? {};
  const agentGeneratedDir = agentInput.generatedDir ?? '.frontier-framework/agent';
  const agent = {
    enabled: agentInput.enabled ?? true,
    generatedDir: agentGeneratedDir,
    manifestDir: agentInput.manifestDir ?? 'features',
    runsDir: agentInput.runsDir ?? 'agent-runs',
    runbookFile: agentInput.runbookFile ?? agentGeneratedDir + '/AGENT-RUNBOOK.md',
    handoffFile: agentInput.handoffFile ?? agentGeneratedDir + '/HANDOFF.md',
    requireFeatureManifest: agentInput.requireFeatureManifest ?? true,
    requireEvidence: agentInput.requireEvidence ?? true,
    requireHarness: agentInput.requireHarness ?? true,
    requireProof: agentInput.requireProof ?? false,
    requireCleanScope: agentInput.requireCleanScope ?? false,
    handoffMode: agentInput.handoffMode ?? (harnessMode === 'strict' ? 'strict' : 'required'),
    maxOpenQuestions: agentInput.maxOpenQuestions ?? 3,
    checkpoints: normalizeAgentCheckpoints(agentInput.checkpoints)
  };
  const deploy = {
    frontend: [...(config.deploy?.frontend ?? [{
      id: 'frontend-static',
      kind: 'static',
      target: 'frontend',
      output: frontend.outDir,
      command: 'frontier build --target frontend',
      tags: ['frontend', 'static']
    }])],
    backend: [...(config.deploy?.backend ?? [{
      id: 'backend-fetch',
      kind: 'serverless',
      target: 'backend',
      output: backend.outDir,
      command: 'frontier build --target backend',
      adapter: 'fetch',
      tags: ['backend', 'fetch-handler']
    }])],
    evidence: [...(config.deploy?.evidence ?? [{
      id: 'frontier-evidence',
      kind: 'evidence',
      target: 'evidence',
      output: frontend.evidenceDir,
      command: 'frontier inspect --json',
      tags: ['evidence']
    }])]
  };
  return {
    ...config,
    id,
    name,
    workspace,
    frontend,
    routeScenarios,
    surfaces,
    componentPreview,
    documentation,
    backend,
    vite,
    devtools,
    telemetry,
    auth,
    migrations,
    sourcePolicy,
    conformance,
    harness,
    agent,
    deploy,
    features: [...(config.features ?? [])],
    packages: [...(config.packages ?? FRONTIER_FRAMEWORK_DEFAULT_PACKAGE_STACK)]
  };
}

export function createFrontierAuthManifest(config: FrontierFrameworkConfig = {}): FrontierAuthManifest {
  return createAuthManifestFromConfig(normalizeFrontierFrameworkConfig(config));
}

function createAuthManifestFromConfig(config: NormalizedFrontierFrameworkConfig): FrontierAuthManifest {
  return createAuthManifest({
    id: config.id + '.auth',
    name: config.name + ' auth',
    package: '@shapeshift-labs/frontier-auth',
    owner: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    providers: config.auth.providers,
    session: config.auth.session,
    profile: config.auth.profile,
    linking: config.auth.linking,
    gates: config.auth.gates,
    routeGuards: config.auth.routeGuards,
    capabilities: config.auth.capabilities,
    tokenContracts: config.auth.tokenContracts,
    runtimeGrants: config.auth.runtimeGrants,
    tags: ['frontier-framework', config.auth.enabled ? 'enabled' : 'disabled', ...config.auth.tags],
    metadata: {
      appId: config.id,
      enabled: config.auth.enabled,
      strict: config.auth.strict,
      failOnMissingGate: config.auth.failOnMissingGate,
      generatedDir: config.auth.generatedDir,
      manifestFile: config.auth.manifestFile,
      evidenceFile: config.auth.evidenceFile,
      ...config.auth.metadata
    }
  });
}

export function createFrontierFramework(config: FrontierFrameworkConfig = {}): FrontierFrameworkPlan {
  const normalized = normalizeFrontierFrameworkConfig(config);
  const agent = createAgentPlan(normalized);
  const auth = createAuthManifestFromConfig(normalized);
  const routeScenarios = createRouteScenarioManifestFromConfig(normalized);
  const routeScenarioPlaywright = createRouteScenarioPlaywrightPlanFromManifest(normalized, routeScenarios);
  const surfaces = createSurfaceRegistryFromConfig(normalized);
  const surfaceCoverage = createSurfaceCoverageReportFromInputs(normalized, surfaces, routeScenarios, routeScenarioPlaywright);
  const routeManifest = createRouteManifest({
    routes: createRouteEntries(normalized),
    metadata: {
      appId: normalized.id,
      framework: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      backend: 'fetch-handler',
      transports: normalized.backend.transports.map((transport) => transport.kind),
      vite: normalized.vite.enabled
    }
  });
  const viewManifest = createViewManifest({
    id: normalized.id + '.views',
    name: normalized.name + ' views',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    fields: [],
    representations: normalized.frontend.routes.map((route) => ({
      id: route.id ?? route.path,
      target: 'dom',
      source: { path: route.path },
      metadata: { file: route.file, feature: route.feature }
    })),
    metadata: { appId: normalized.id }
  });
  const manifest = createManifest({
    entries: createManifestEntries(normalized, agent),
    tasks: createManifestTasks(normalized),
    metadata: createFrameworkManifestMetadata(normalized)
  });
  const effects = createEffectManifest({
    effects: createEffectEntries(normalized),
    metadata: { appId: normalized.id }
  });
  const tools = createToolsManifest({
    id: normalized.id + '.cli',
    title: normalized.name + ' CLI',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    actions: [
      { id: 'frontier.init', title: 'Initialize Frontier framework', writes: ['package.json', 'frontier.config.mjs'], effects: ['filesystem.write'], tags: ['cli'] },
      { id: 'frontier.build', title: 'Build deployable artifacts', reads: ['frontier.config.mjs'], writes: [normalized.frontend.outDir, normalized.backend.outDir, normalized.frontend.evidenceDir, normalized.componentPreview.outDir, normalized.documentation.outDir, normalized.auth.generatedDir], effects: ['filesystem.write'], tags: ['cli', 'build'] },
      { id: 'frontier.component-preview.build', title: 'Generate component preview book and evidence', reads: ['frontier.config.mjs', ...normalized.componentPreview.include], writes: [normalized.componentPreview.outDir, normalized.frontend.evidenceDir + '/component-preview.json'], effects: ['component-preview.generate'], tags: ['cli', 'component-preview', normalized.componentPreview.enabled ? 'enabled' : 'disabled'] },
      { id: 'frontier.documentation.build', title: 'Generate documentation book, search records, and evidence', reads: ['frontier.config.mjs', ...normalized.documentation.include], writes: [normalized.documentation.outDir, normalized.frontend.evidenceDir + '/documentation.json'], effects: ['documentation.generate'], tags: ['cli', 'documentation', normalized.documentation.enabled ? 'enabled' : 'disabled'] },
      { id: 'frontier.vite.build', title: 'Run Vite frontend pipeline', reads: ['frontier.config.mjs', normalized.vite.configFile], writes: [normalized.vite.outDir], effects: ['build.bundle'], tags: ['cli', 'build', 'vite'], metadata: { strict: normalized.vite.strict, hmr: normalized.vite.hmr } },
      { id: 'frontier.inspect', title: 'Inspect app graph and deploy targets', reads: ['frontier.config.mjs'], tags: ['cli', 'evidence'] },
      { id: 'frontier.doctor', title: 'Validate framework config, source files, scripts, deploy split, source policy, and agent readiness', reads: ['frontier.config.mjs', 'package.json', 'features/*.json'], effects: ['diagnostic.read', 'source-policy.check'], tags: ['cli', 'doctor', 'diagnostics', 'source-policy'] },
      { id: 'frontier.config.validate', title: 'Validate framework config schema and semantic rules', reads: ['frontier.config.mjs'], writes: [normalized.frontend.evidenceDir + '/config-validation.json'], effects: ['diagnostic.read'], tags: ['cli', 'config', 'schema', 'diagnostics'] },
      { id: 'frontier.config.explain', title: 'Explain framework config paths, defaults, and suggested fixes', reads: ['frontier.config.mjs'], effects: ['diagnostic.read'], tags: ['cli', 'config', 'schema', 'explain'] },
      { id: 'frontier.source-graph', title: 'Emit AST source graph and business-logic placement evidence', reads: ['frontier.config.mjs', ...normalized.sourcePolicy.include], writes: [normalized.sourcePolicy.sourceGraphFile, normalized.sourcePolicy.sourceGraphRegistryFile], effects: ['source-graph.walk', 'source-policy.check'], tags: ['cli', 'source-graph', 'ast-walk', 'business-logic'] },
      { id: 'frontier.lint', title: 'Run Frontier conformance lint and SARIF export', reads: ['frontier.config.mjs', 'package.json', ...normalized.sourcePolicy.include], writes: [normalized.conformance.reportFile, normalized.conformance.sarifFile], effects: ['diagnostic.read', 'conformance.lint'], tags: ['cli', 'lint', 'conformance', normalized.conformance.enforcement] },
      { id: 'frontier.auth.inspect', title: 'Generate Frontier auth manifest, gates, token contracts, runtime grants, and evidence', reads: ['frontier.config.mjs'], writes: [normalized.auth.manifestFile, normalized.auth.evidenceFile], effects: ['auth.inspect'], tags: ['cli', 'auth', normalized.auth.enabled ? 'enabled' : 'disabled', normalized.auth.strict ? 'strict' : 'optional'] },
      { id: 'frontier.migrations.inspect', title: 'Inspect runtime data-source migration manifest', reads: ['frontier.config.mjs'], writes: [normalized.migrations.evidenceFile, normalized.migrations.runtimeBridgeFile], effects: ['migration.inspect'], tags: ['cli', 'migrations', 'runtime', 'state'] },
      { id: 'frontier.migrations.bridge', title: 'Generate app-state and data-source migration bridge', reads: ['frontier.config.mjs'], writes: [normalized.migrations.runtimeBridgeFile], effects: ['migration.bridge.generate'], tags: ['cli', 'migrations', 'state', 'cache', 'crdt'] },
      { id: 'frontier.devtools.open', title: 'Open floating inspect/debug/rewind devtools', reads: [normalized.frontend.evidenceDir], effects: ['devtools.inspect'], tags: ['devtools', 'inspect', 'rewind'] },
      { id: 'frontier.harness', title: 'Validate hybrid agent harness', reads: ['frontier.config.mjs', 'features/*.json'], writes: [normalized.harness.evidenceDir], effects: ['harness.validate'], tags: ['cli', 'harness', normalized.harness.mode] },
      { id: 'frontier.route-scenarios', title: 'Generate route scenario manifest and browser plan', reads: ['frontier.config.mjs'], writes: [normalized.routeScenarios.manifestFile, normalized.routeScenarios.playwrightPlanFile], effects: ['route-scenario.plan'], tags: ['cli', 'routes', 'scenario', normalized.routeScenarios.enabled ? 'enabled' : 'disabled'] },
      { id: 'frontier.surfaces', title: 'Generate surface status registry', reads: ['frontier.config.mjs', 'features/*.json'], writes: [normalized.surfaces.registryFile], effects: ['surface-status.plan'], tags: ['cli', 'surfaces', 'status', normalized.surfaces.enabled ? 'enabled' : 'disabled'] },
      { id: 'frontier.status', title: 'Query page, route, filter, feature, or app surface status', reads: ['frontier.config.mjs', normalized.surfaces.registryFile], effects: ['diagnostic.read'], tags: ['cli', 'surfaces', 'status', 'query', normalized.surfaces.enabled ? 'enabled' : 'disabled'] },
      { id: 'frontier.coverage', title: 'Report agent-facing surface render, state, and evidence coverage', reads: ['frontier.config.mjs', normalized.surfaces.registryFile, normalized.routeScenarios.manifestFile], writes: [normalized.surfaces.coverage.reportFile, normalized.surfaces.coverage.dashboardFile], effects: ['surface-coverage.plan'], tags: ['cli', 'surfaces', 'coverage', normalized.surfaces.coverage.enabled ? 'enabled' : 'disabled'] },
      { id: 'frontier.agent.loop', title: 'Summarize next surface work with status, coverage probes, and strict evidence gates', reads: ['frontier.config.mjs', normalized.surfaces.registryFile, normalized.surfaces.coverage.reportFile], writes: [normalized.agent.generatedDir + '/surface-loop.json', normalized.agent.generatedDir + '/surface-loop.md'], effects: ['surface-coverage.plan', 'agent.plan'], tags: ['cli', 'agent', 'surfaces', 'coverage'] },
      { id: 'frontier.fuzz', title: 'Run or validate configured fuzzers', reads: ['frontier.config.mjs'], writes: [normalized.harness.evidenceDir], effects: ['test.fuzz'], tags: ['cli', 'harness', 'fuzz'] },
      { id: 'frontier.bench', title: 'Run or validate configured benchmarks', reads: ['frontier.config.mjs'], writes: [normalized.harness.evidenceDir], effects: ['test.benchmark'], tags: ['cli', 'harness', 'benchmark'] },
      { id: 'frontier.sync.inspect', title: 'Inspect backend transport and sync adapters', reads: ['frontier.config.mjs'], routes: normalized.backend.transports.map(transportResource), effects: ['transport.inspect'], tags: ['cli', 'sync', 'transport'] },
      { id: 'frontier.agent', title: 'Generate agent manifest, runbook, readiness, and handoff bundle', reads: ['frontier.config.mjs', normalized.agent.manifestDir + '/*.json'], writes: [normalized.agent.generatedDir], effects: ['agent.plan', 'filesystem.write'], tags: ['cli', 'agent', normalized.agent.handoffMode], metadata: { checkpoints: agent.checkpoints.map((checkpoint) => checkpoint.id) } },
      { id: 'frontier.agent.handoff', title: 'Prepare an agent handoff from current evidence', reads: [normalized.frontend.evidenceDir, normalized.harness.evidenceDir], writes: [normalized.agent.handoffFile], effects: ['agent.handoff'], tags: ['cli', 'agent', 'handoff'] },
      { id: 'frontier.agent.mcp', title: 'Export MCP-compatible tool descriptors for agent clients', reads: [normalized.frontend.evidenceDir + '/tools.json'], writes: [normalized.agent.generatedDir + '/mcp-tools.json'], effects: ['agent.tools.export'], tags: ['cli', 'agent', 'mcp', 'tools'] },
      { id: 'frontier.agent.ci-gates', title: 'Export CI-ready evidence gates from the Frontier project graph', reads: [normalized.frontend.evidenceDir, normalized.harness.evidenceDir], writes: [normalized.agent.generatedDir + '/ci-evidence-gates.json'], effects: ['agent.gates.export'], tags: ['cli', 'agent', 'ci', 'evidence'] },
      { id: 'frontier.agent.lint', title: 'Export Frontier linter report and SARIF for agent handoff', reads: [normalized.frontend.evidenceDir, normalized.harness.evidenceDir], writes: [normalized.agent.generatedDir + '/frontier-agent-lint.json', normalized.agent.generatedDir + '/frontier-agent-lint.sarif'], effects: ['agent.lint.export'], tags: ['cli', 'agent', 'lint', 'sarif'] },
      { id: 'frontier.agent.workflow', title: 'Export Frontier workflow manifest for the agent evidence loop', reads: [normalized.agent.generatedDir + '/ci-evidence-gates.json'], writes: [normalized.agent.generatedDir + '/agent-workflow.json', normalized.agent.generatedDir + '/agent-workflow-proof.json'], effects: ['agent.workflow.export'], tags: ['cli', 'agent', 'workflow'] },
      { id: 'frontier.agent.replay', title: 'Replay generated CI evidence gates for another agent or CI job', reads: [normalized.agent.generatedDir + '/ci-evidence-gates.json'], writes: [normalized.agent.runsDir, normalized.agent.generatedDir + '/agent-replay.json'], effects: ['agent.replay'], tags: ['cli', 'agent', 'replay'] }
    ],
    routes: routeManifest.routes.map((route) => route.resource ?? route.pattern ?? route.id),
    resources: [normalized.frontend.outDir, normalized.backend.outDir, normalized.frontend.evidenceDir, normalized.harness.evidenceDir, normalized.vite.outDir, normalized.auth.generatedDir, normalized.migrations.generatedDir, normalized.componentPreview.outDir, normalized.documentation.outDir],
    tags: ['frontier-framework', normalized.workspace.kind, 'vite', 'harness', 'auth', 'migrations', 'component-preview', 'documentation']
  });
  const tests = createTestManifest({
    id: normalized.id + '.acceptance',
    title: normalized.name + ' acceptance',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    specs: [
      {
        id: 'frontier-framework.split-deploy',
        title: 'Frontend and backend deploy artifacts are separated',
        kind: 'unit',
        expect: { assertions: ['frontend-output', 'backend-output', 'evidence-output'] },
        artifacts: [normalized.frontend.outDir, normalized.backend.outDir, normalized.frontend.evidenceDir],
        tags: ['deploy']
      },
      {
        id: 'frontier-framework.backend-neutral',
        title: 'Backend remains adapter-owned',
        kind: 'unit',
        expect: { assertions: ['fetch-handler-contract'] },
        covers: ['backend.fetch-handler'],
        tags: ['backend']
      },
      {
        id: 'frontier-framework.vite-build',
        title: 'Frontend build uses Vite as the default bundler path',
        kind: 'unit',
        commands: ['frontier build --target frontend', 'vite build --config ' + normalized.vite.configFile],
        expect: { artifacts: [normalized.vite.outDir], assertions: ['vite-config-present', 'vite-plugin-installed', 'hmr-toggle-default-on'] },
        covers: ['build:vite'],
        artifacts: [normalized.vite.outDir],
        tags: ['frontend', 'vite', normalized.vite.strict ? 'strict' : 'optional']
      },
      {
        id: 'frontier-framework.component-preview',
        title: 'Component previews produce a standalone book and evidence manifest',
        kind: 'browser',
        commands: ['frontier build --target evidence'],
        expect: {
          artifacts: [
            normalized.componentPreview.outDir + '/' + normalized.componentPreview.htmlFileName,
            normalized.componentPreview.outDir + '/' + normalized.componentPreview.manifestFileName,
            normalized.frontend.evidenceDir + '/component-preview.json'
          ],
          assertions: ['preview-manifest-generated', 'preview-book-generated', 'preview-proof-generated']
        },
        covers: ['component-preview:book'],
        artifacts: [normalized.componentPreview.outDir, normalized.frontend.evidenceDir + '/component-preview.json'],
        tags: ['component-preview', 'frontend', normalized.componentPreview.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.documentation',
        title: 'Documentation produces a standalone book, search index, and evidence manifest',
        kind: 'browser',
        commands: ['frontier docs build --json', 'frontier build --target evidence'],
        expect: {
          artifacts: [
            normalized.documentation.outDir + '/' + normalized.documentation.htmlFileName,
            normalized.documentation.outDir + '/' + normalized.documentation.manifestFileName,
            normalized.documentation.outDir + '/' + normalized.documentation.searchFileName,
            normalized.documentation.outDir + '/' + normalized.documentation.jsonlFileName,
            normalized.frontend.evidenceDir + '/documentation.json'
          ],
          assertions: ['documentation-manifest-generated', 'documentation-book-generated', 'documentation-proof-generated', 'documentation-search-generated']
        },
        covers: ['documentation:book'],
        artifacts: [normalized.documentation.outDir, normalized.frontend.evidenceDir + '/documentation.json'],
        tags: ['documentation', 'frontend', normalized.documentation.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.sync-transports',
        title: 'Backend communication surfaces are transport-adapter neutral',
        kind: 'unit',
        routes: normalized.backend.transports.map(transportResource),
        effects: normalized.backend.transports.flatMap((transport) => transport.effects ?? []),
        expect: { assertions: ['crdt-sync', 'realtime-websocket', 'event-log', 'state-cache'] },
        covers: normalized.backend.transports.map((transport) => 'transport:' + transportId(transport)),
        tags: ['backend', 'sync', 'transport']
      },
      {
        id: 'frontier-framework.runtime-migrations',
        title: 'Runtime data sources migrate before state/cache/CRDT/event-log hydration',
        kind: 'unit',
        commands: ['frontier build --target evidence', 'frontier migrations --json'],
        expect: { artifacts: [normalized.migrations.evidenceFile, normalized.migrations.runtimeBridgeFile], assertions: ['state-source', 'query-cache-source', 'crdt-source', 'event-log-source', 'migration-bridge-generated'] },
        covers: ['migrations:runtime-data'],
        artifacts: [normalized.migrations.evidenceFile, normalized.migrations.runtimeBridgeFile],
        tags: ['migrations', 'runtime', 'state', normalized.migrations.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.auth',
        title: 'Auth providers, sessions, route gates, token contracts, runtime grants, and account linking are declared as Frontier evidence',
        kind: 'unit',
        commands: ['frontier auth --json', 'frontier build --target evidence'],
        expect: {
          artifacts: [normalized.auth.manifestFile, normalized.auth.evidenceFile],
          assertions: ['auth-manifest-generated', 'providers-declared', 'route-gates-declared', 'token-contracts-declared', 'runtime-grants-declared', 'account-linking-policy-declared']
        },
        covers: ['auth:manifest', ...auth.gates.map((gate) => 'auth-gate:' + gate.id)],
        artifacts: [normalized.auth.manifestFile, normalized.auth.evidenceFile],
        tags: ['auth', 'session', 'token', 'runtime', normalized.auth.enabled ? 'enabled' : 'disabled', normalized.auth.strict ? 'strict' : 'optional']
      },
      {
        id: 'frontier-framework.route-discovery',
        title: 'Filesystem routes produce normalized route and discovery evidence',
        kind: 'unit',
        commands: ['frontier inspect --json', 'frontier build --target evidence'],
        expect: { artifacts: [normalized.frontend.evidenceDir + '/route-discovery.json'], assertions: ['route-groups-hidden', 'flat-routes-normalized', 'splats-normalized', 'conflicts-rejected'] },
        covers: ['build:route-discovery'],
        artifacts: [normalized.frontend.evidenceDir + '/route-discovery.json'],
        tags: ['frontend', 'route-discovery', 'agent-evidence']
      },
      {
        id: 'frontier-framework.route-scenarios',
        title: 'Route scenario manifests declare app-owned fixtures and browser expectations',
        kind: 'browser',
        commands: ['frontier build --target evidence', 'node ' + normalized.harness.generatedDir + '/frontier-browser-smoke.mjs'],
        expect: {
          artifacts: [normalized.routeScenarios.manifestFile, normalized.routeScenarios.playwrightPlanFile],
          assertions: ['route-scenarios-normalized', 'fixtures-app-owned', 'redirects-declared', 'dom-roles-declared', 'playwright-plan-generated']
        },
        covers: ['route-scenarios:manifest'],
        artifacts: [normalized.routeScenarios.manifestFile, normalized.routeScenarios.playwrightPlanFile],
        tags: ['frontend', 'route-scenario', 'browser', normalized.routeScenarios.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.surfaces',
        title: 'Routes, pages, filters, features, and other app surfaces declare status and evidence links',
        kind: 'unit',
        commands: ['frontier build --target evidence'],
        expect: {
          artifacts: [normalized.surfaces.registryFile, normalized.frontend.evidenceDir + '/surfaces.json'],
          assertions: ['surface-status-registry-generated', 'surface-statuses-app-defined', 'route-surfaces-derived', 'evidence-links-preserved']
        },
        covers: ['surfaces:status-registry'],
        artifacts: [normalized.surfaces.registryFile, normalized.frontend.evidenceDir + '/surfaces.json'],
        tags: ['surfaces', 'status', 'evidence', normalized.surfaces.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.surface-coverage',
        title: 'Claimed app surfaces have generated render/state/evidence coverage probes',
        kind: 'unit',
        commands: ['frontier coverage --json', 'frontier build --target evidence'],
        expect: {
          artifacts: [normalized.surfaces.coverage.reportFile, normalized.surfaces.coverage.dashboardFile, normalized.frontend.evidenceDir + '/surface-coverage.json'],
          assertions: ['claimed-statuses-require-evidence', 'render-probes-generated', 'state-probes-linked', 'dashboard-by-kind-route-status']
        },
        covers: ['surfaces:coverage'],
        artifacts: [normalized.surfaces.coverage.reportFile, normalized.surfaces.coverage.dashboardFile, normalized.frontend.evidenceDir + '/surface-coverage.json'],
        tags: ['surfaces', 'coverage', 'agent', normalized.surfaces.coverage.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.agent-loop',
        title: 'Agents can run one loop to see the next missing route, page, filter, or action evidence',
        kind: 'unit',
        commands: ['frontier loop --json', 'frontier loop --strict --json'],
        expect: {
          artifacts: [normalized.agent.generatedDir + '/surface-loop.json', normalized.agent.generatedDir + '/surface-loop.md'],
          assertions: ['status-and-coverage-joined', 'focus-dashboard-by-kind', 'missing-probes-listed', 'strict-loop-fails-missing-coverage']
        },
        covers: ['agent:surface-loop', 'surfaces:coverage'],
        artifacts: [normalized.agent.generatedDir + '/surface-loop.json', normalized.agent.generatedDir + '/surface-loop.md'],
        tags: ['agent', 'surfaces', 'coverage', 'next-task']
      },
      {
        id: 'frontier-framework.source-policy',
        title: 'Source files follow configurable Frontier component, file-size, and runtime-module policy',
        kind: 'unit',
        commands: ['frontier doctor --json', 'frontier build --target evidence'],
        expect: { artifacts: [normalized.frontend.evidenceDir + '/source-policy.json', normalized.sourcePolicy.sourceGraphFile, normalized.sourcePolicy.sourceGraphRegistryFile], assertions: ['max-frontier-components-per-file', 'max-lines-per-file', 'max-chars-per-file', 'runtime-module-ownership', 'business-logic-placement', 'source-graph-emitted', 'source-policy-toggle'] },
        covers: ['source-policy:structure', 'source-graph:ast-walk'],
        artifacts: [normalized.frontend.evidenceDir + '/source-policy.json', normalized.sourcePolicy.sourceGraphFile, normalized.sourcePolicy.sourceGraphRegistryFile],
        tags: ['source-policy', 'lint', 'ast-walk', 'runtime-modules', normalized.sourcePolicy.enforcement, normalized.sourcePolicy.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.conformance',
        title: 'Frontend, state, sync, test, lint, and agent surfaces use their required Frontier packages',
        kind: 'unit',
        commands: ['frontier lint --json', 'frontier build --target evidence'],
        expect: { artifacts: [normalized.conformance.reportFile, normalized.conformance.sarifFile], assertions: ['frontier-design-used-by-frontend', 'frontier-linter-required', 'frontier-test-required', 'workflow-required', 'sarif-emitted'] },
        covers: ['conformance:package-use'],
        artifacts: [normalized.conformance.reportFile, normalized.conformance.sarifFile],
        tags: ['conformance', 'lint', 'agent', normalized.conformance.enforcement, normalized.conformance.enabled ? 'enabled' : 'disabled']
      },
      {
        id: 'frontier-framework.config-validation',
        title: 'Config schema validation emits actionable diagnostics and explain entries',
        kind: 'unit',
        commands: ['frontier config validate --json', 'frontier config explain --json'],
        expect: { artifacts: [normalized.frontend.evidenceDir + '/config-validation.json'], assertions: ['schema-backed-config', 'semantic-diagnostics', 'suggested-fixes', 'config-explain'] },
        covers: ['config:validation'],
        artifacts: [normalized.frontend.evidenceDir + '/config-validation.json'],
        tags: ['config', 'schema', 'doctor', 'agent']
      },
      {
        id: 'frontier-framework.devtools-overlay',
        title: 'Dev mode exposes floating inspect/debug/rewind controls and Frontier timeline channels',
        kind: 'browser',
        commands: ['frontier dev'],
        expect: { artifacts: [normalized.devtools.scriptPath, normalized.frontend.evidenceDir + '/devtools-bridge.json'], assertions: ['floating-button', 'inspect-panel', 'rewind-action', 'patch-channel', 'crdt-channel', 'event-log-channel', 'trace-channel', 'telemetry-channel'] },
        covers: ['devtools:floating-inspector'],
        artifacts: [normalized.devtools.scriptPath, normalized.frontend.evidenceDir + '/devtools-bridge.json'],
        tags: ['devtools', 'browser', 'rewind', 'telemetry']
      },
      {
        id: 'frontier-framework.hybrid-harness',
        title: 'Hybrid agent harness declares tests, fuzzers, benchmarks, and evidence gates',
        kind: 'unit',
        commands: normalized.harness.commands.map((command) => command.command),
        expect: { artifacts: [normalized.harness.evidenceDir], assertions: ['tests-declared', 'fuzzers-declared', 'benchmarks-declared', 'feature-manifest-declared'] },
        covers: ['harness:hybrid'],
        artifacts: [normalized.harness.evidenceDir],
        tags: ['harness', 'agent', normalized.harness.mode]
      },
      {
        id: 'frontier-framework.agent-first',
        title: 'Agent workflow emits capabilities, MCP tools, CI gates, SARIF, replay, readiness, and handoff artifacts',
        kind: 'unit',
        commands: ['frontier agent --json', ...agent.capabilities.map((capability) => capability.command)],
        expect: { artifacts: [normalized.agent.generatedDir, normalized.agent.runbookFile, normalized.agent.handoffFile, normalized.agent.generatedDir + '/mcp-tools.json', normalized.agent.generatedDir + '/tool-manifest.json', normalized.agent.generatedDir + '/ci-evidence-gates.json', normalized.agent.generatedDir + '/frontier-agent-lint.json', normalized.agent.generatedDir + '/frontier-agent-lint.sarif', normalized.agent.generatedDir + '/agent-workflow.json', normalized.agent.generatedDir + '/frontier-agent-replay.mjs'], assertions: ['agent-capabilities', 'agent-checkpoints', 'readiness-json', 'handoff-template', 'mcp-tool-descriptors', 'ci-evidence-gates', 'frontier-linter-report', 'sarif-output', 'frontier-workflow-manifest', 'agent-replay-script'] },
        covers: ['agent:plan', 'agent:handoff', 'agent:mcp-tools', 'agent:ci-gates', 'agent:lint-sarif', 'agent:workflow', 'agent:replay'],
        artifacts: [normalized.agent.generatedDir],
        tags: ['agent', 'handoff', 'mcp', 'ci', 'sarif', 'workflow', 'replay', normalized.agent.handoffMode]
      },
      {
        id: 'frontier-framework.doctor',
        title: 'Doctor report validates config, source paths, scripts, deploy split, and generated readiness',
        kind: 'unit',
        commands: ['frontier doctor --json'],
        expect: { assertions: ['config-present', 'route-sources-present', 'backend-entry-present', 'scripts-present', 'deploy-split'] },
        covers: ['frontier.doctor'],
        tags: ['doctor', 'diagnostics', 'agent']
      }
    ],
    coverageTargets: ['frontend routes', 'component previews', 'documentation books', 'backend endpoints', 'sync transports', 'auth gates and token contracts', 'Vite build', 'devtools overlay', 'source policy', 'config validation', 'evidence manifests', 'hybrid harness', 'agent workflow', 'doctor diagnostics']
  });
  const trace = createTrace({
    spans: [
      {
        id: 'frontier-framework.plan',
        name: 'Plan Frontier framework',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: 'frontier.config',
        writes: ['/frontier/config'],
        tags: ['build-plan']
      },
      {
        id: 'frontier-framework.frontend',
        name: 'Build frontend artifact',
        parentId: 'frontier-framework.plan',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: normalized.frontend.outDir,
        writes: [normalized.frontend.outDir, normalized.vite.outDir],
        tags: ['frontend', 'vite']
      },
      {
        id: 'frontier-framework.vite',
        name: 'Run Vite bundler integration',
        parentId: 'frontier-framework.frontend',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: normalized.vite.configFile,
        writes: [normalized.vite.outDir],
        tags: ['vite', normalized.vite.strict ? 'strict' : 'optional'],
        attributes: {
          plugin: normalized.vite.plugin,
          enabled: normalized.vite.enabled,
          hmr: normalized.vite.hmr
        }
      },
      {
        id: 'frontier-framework.component-preview',
        name: 'Generate component preview book',
        parentId: 'frontier-framework.frontend',
        package: '@shapeshift-labs/frontier-component-preview',
        feature: normalized.id,
        resource: normalized.componentPreview.outDir,
        writes: [normalized.componentPreview.outDir, normalized.frontend.evidenceDir + '/component-preview.json'],
        tags: ['component-preview', 'frontend', normalized.componentPreview.enabled ? 'enabled' : 'disabled'],
        attributes: {
          renderer: normalized.componentPreview.renderer,
          include: normalized.componentPreview.include,
          outDir: normalized.componentPreview.outDir
        }
      },
      {
        id: 'frontier-framework.documentation',
        name: 'Generate documentation book',
        parentId: 'frontier-framework.frontend',
        package: '@shapeshift-labs/frontier-documentation',
        feature: normalized.id,
        resource: normalized.documentation.outDir,
        writes: [normalized.documentation.outDir, normalized.frontend.evidenceDir + '/documentation.json'],
        tags: ['documentation', 'frontend', normalized.documentation.enabled ? 'enabled' : 'disabled'],
        attributes: {
          include: normalized.documentation.include,
          outDir: normalized.documentation.outDir
        }
      },
      {
        id: 'frontier-framework.backend',
        name: 'Build backend artifact',
        parentId: 'frontier-framework.plan',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: normalized.backend.outDir,
        writes: [normalized.backend.outDir],
        tags: ['backend', 'transport']
      },
      {
        id: 'frontier-framework.sync',
        name: 'Declare backend sync transports',
        parentId: 'frontier-framework.backend',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resources: normalized.backend.transports.map(transportResource),
        emits: normalized.backend.transports.flatMap((transport) => transport.effects ?? []),
        tags: ['sync', 'transport', 'crdt', 'realtime', 'event-log']
      },
      {
        id: 'frontier-framework.migrations',
        name: 'Generate runtime data-source migration manifest',
        parentId: 'frontier-framework.plan',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: normalized.migrations.evidenceFile,
        writes: [normalized.migrations.evidenceFile, normalized.migrations.runtimeBridgeFile],
        tags: ['migrations', 'runtime', 'state', normalized.migrations.enabled ? 'enabled' : 'disabled'],
        attributes: {
          registryId: normalized.migrations.registryId,
          currentVersion: normalized.migrations.currentVersion,
          sources: normalized.migrations.sources.map((source) => source.id)
        }
      },
      {
        id: 'frontier-framework.auth',
        name: 'Generate Frontier auth manifest and evidence',
        parentId: 'frontier-framework.plan',
        package: '@shapeshift-labs/frontier-auth',
        feature: normalized.id,
        resource: normalized.auth.evidenceFile,
        writes: [normalized.auth.manifestFile, normalized.auth.evidenceFile],
        tags: ['auth', 'session', 'gates', 'tokens', normalized.auth.enabled ? 'enabled' : 'disabled'],
        attributes: {
          providerCount: auth.summary.providerCount,
          gateCount: auth.summary.gateCount,
          tokenContractCount: auth.summary.tokenContractCount,
          runtimeGrantCount: auth.summary.runtimeGrantCount,
          strict: normalized.auth.strict
        }
      },
      {
        id: 'frontier-framework.harness',
        name: 'Validate hybrid agent harness',
        parentId: 'frontier-framework.plan',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: normalized.harness.evidenceDir,
        writes: [normalized.harness.evidenceDir],
        tags: ['harness', 'agent', normalized.harness.mode],
        attributes: {
          autoRun: normalized.harness.autoRun,
          failOnMissing: normalized.harness.failOnMissing
        }
      },
      {
        id: 'frontier-framework.agent',
        name: 'Generate agent-first runbook, readiness, MCP tools, SARIF, and replay bundle',
        parentId: 'frontier-framework.harness',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resource: normalized.agent.generatedDir,
        writes: [normalized.agent.generatedDir, normalized.agent.handoffFile, normalized.agent.generatedDir + '/mcp-tools.json', normalized.agent.generatedDir + '/ci-evidence-gates.json', normalized.agent.generatedDir + '/frontier-agent-lint.sarif', normalized.agent.generatedDir + '/agent-workflow.json'],
        tags: ['agent', 'handoff', 'mcp', 'ci', 'sarif', 'workflow', 'replay', normalized.agent.handoffMode],
        attributes: {
          manifestDir: normalized.agent.manifestDir,
          runsDir: normalized.agent.runsDir,
          requireEvidence: normalized.agent.requireEvidence,
          requireHarness: normalized.agent.requireHarness
        }
      },
      {
        id: 'frontier-framework.telemetry',
        name: 'Attach telemetry and inspection sinks',
        parentId: 'frontier-framework.plan',
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: normalized.id,
        resources: normalized.telemetry.sinks,
        tags: ['telemetry', 'logging', 'trace', 'inspect']
      },
      {
        id: 'frontier-framework.source-graph',
        name: 'Walk source graph and business-logic placement',
        parentId: 'frontier-framework.plan',
        package: '@shapeshift-labs/frontier-ast-walk',
        feature: normalized.id,
        resource: normalized.sourcePolicy.sourceGraphFile,
        writes: [normalized.sourcePolicy.sourceGraphFile, normalized.sourcePolicy.sourceGraphRegistryFile],
        tags: ['source-graph', 'ast-walk', 'business-logic', normalized.sourcePolicy.businessLogic ? 'enabled' : 'disabled'],
        attributes: {
          include: normalized.sourcePolicy.include,
          domainRoots: normalized.sourcePolicy.domainRoots
        }
      }
    ],
    metadata: { appId: normalized.id }
  });
  const application = createApplicationGraphFromManifestLike({
    entries: manifest.entries as unknown as readonly Record<string, unknown>[],
    tasks: manifest.tasks as unknown as readonly Record<string, unknown>[],
    metadata: { appId: normalized.id, package: FRONTIER_FRAMEWORK_PACKAGE_NAME }
  });
  const deployTargets = createDeployTargets(normalized);
  return {
    config: normalized,
    packages: normalized.packages,
    auth,
    routes: routeManifest,
    routeScenarios,
    routeScenarioPlaywright,
    surfaces,
    surfaceCoverage,
    views: viewManifest,
    manifest,
    manifestProof: createManifestProof(manifest),
    effects,
    tools,
    tests,
    trace,
    application,
    deployTargets,
    artifacts: createArtifactPlan(normalized),
    research: FRONTIER_FRAMEWORK_RESEARCH_INSIGHTS,
    runtimeAdapters: FRONTIER_FRAMEWORK_RUNTIME_ADAPTER_CATALOG,
    syncAdapters: FRONTIER_FRAMEWORK_SYNC_ADAPTER_CATALOG,
    agent
  };
}

export function createFrontierAgentPlan(config: FrontierFrameworkConfig = {}): FrontierFrameworkAgentPlan {
  return createAgentPlan(normalizeFrontierFrameworkConfig(config));
}

export function createFrontierDeployPlan(config: FrontierFrameworkConfig = {}): Pick<FrontierFrameworkPlan, 'config' | 'deployTargets' | 'artifacts' | 'manifestProof'> {
  const normalized = normalizeFrontierFrameworkConfig(config);
  const agent = createAgentPlan(normalized);
  const manifest = createManifest({
    entries: createManifestEntries(normalized, agent),
    tasks: createManifestTasks(normalized),
    metadata: createFrameworkManifestMetadata(normalized)
  });
  return {
    config: normalized,
    deployTargets: createDeployTargets(normalized),
    artifacts: createArtifactPlan(normalized),
    manifestProof: createManifestProof(manifest)
  };
}

function createDeployTargets(config: NormalizedFrontierFrameworkConfig): FrontierFrameworkDeployTarget[] {
  return [
    ...config.deploy.frontend,
    ...config.deploy.backend,
    ...config.deploy.evidence
  ];
}

function createFrameworkManifestMetadata(config: NormalizedFrontierFrameworkConfig): Record<string, unknown> {
  return {
    appId: config.id,
    workspace: config.workspace.kind,
    backendContract: 'fetch-handler',
    vite: config.vite,
    frontendCache: {
      incremental: config.frontend.incremental,
      cacheDir: config.frontend.cacheDir
    },
    componentPreview: config.componentPreview,
    documentation: config.documentation,
    routeScenarios: config.routeScenarios,
    surfaces: config.surfaces,
    surfaceCoverage: config.surfaces.coverage,
    configValidation: {
      schema: FRONTIER_FRAMEWORK_CONFIG_SCHEMA_ID,
      explainEntries: FRONTIER_FRAMEWORK_CONFIG_EXPLAIN.length
    },
    devtools: config.devtools,
    telemetry: config.telemetry,
    auth: config.auth,
    migrations: config.migrations,
    sourcePolicy: config.sourcePolicy,
    conformance: config.conformance,
    harness: {
      mode: config.harness.mode,
      autoRun: config.harness.autoRun,
      failOnMissing: config.harness.failOnMissing,
      generatedDir: config.harness.generatedDir,
      corpusDir: config.harness.corpusDir,
      browserTrace: config.harness.browserTrace
    },
    agent: {
      enabled: config.agent.enabled,
      generatedDir: config.agent.generatedDir,
      manifestDir: config.agent.manifestDir,
      runsDir: config.agent.runsDir,
      handoffMode: config.agent.handoffMode,
      requireFeatureManifest: config.agent.requireFeatureManifest,
      requireEvidence: config.agent.requireEvidence,
      requireHarness: config.agent.requireHarness,
      requireProof: config.agent.requireProof,
      requireCleanScope: config.agent.requireCleanScope
    },
    research: FRONTIER_FRAMEWORK_RESEARCH_INSIGHTS.map((item) => item.id),
    runtimeAdapters: FRONTIER_FRAMEWORK_RUNTIME_ADAPTER_CATALOG.map((item) => item.id),
    syncAdapters: FRONTIER_FRAMEWORK_SYNC_ADAPTER_CATALOG.map((item) => item.id)
  };
}

export interface FrontierFrameworkVitePlugin {
  name: string;
  enforce?: 'pre' | 'post';
  config?: () => unknown;
  resolveId?: (id: string) => string | undefined;
  load?: (id: string) => string | undefined;
  transformIndexHtml?: (html: string) => string;
}

export function frontierFrameworkVite(config: FrontierFrameworkConfig = {}): FrontierFrameworkVitePlugin {
  const normalized = normalizeFrontierFrameworkConfig(config);
  const virtualId = 'virtual:frontier-framework/devtools';
  const resolvedVirtualId = '\0' + virtualId;
  return {
    name: 'frontier-framework',
    enforce: 'pre',
    config: () => ({
      appType: 'mpa',
      server: {
        host: normalized.vite.devServer.host,
        port: normalized.vite.devServer.port,
        open: normalized.vite.devServer.open,
        hmr: normalized.vite.devServer.hmr
      },
      build: {
        outDir: normalized.vite.outDir,
        emptyOutDir: false,
        manifest: true
      }
    }),
    resolveId: (id) => id === virtualId ? resolvedVirtualId : undefined,
    load: (id) => id === resolvedVirtualId ? renderFrontierDevtoolsOverlayModule(normalized) : undefined,
    transformIndexHtml: (html) => {
      if (!normalized.devtools.enabled || !normalized.devtools.floatingButton) return html;
      if (html.includes(virtualId)) return html;
      const script = '<script type="module">import "' + virtualId + '";</script>';
      return html.includes('</body>') ? html.replace('</body>', script + '\n</body>') : html + '\n' + script;
    }
  };
}

export function renderFrontierDevtoolsOverlayModule(config: FrontierFrameworkConfig = {}): string {
  const normalized = normalizeFrontierFrameworkConfig(config);
  return renderNormalizedFrontierDevtoolsOverlayModule(normalized);
}

export function renderNormalizedFrontierDevtoolsOverlayModule(normalized: NormalizedFrontierFrameworkConfig): string {
  const devtools = {
    appId: normalized.id,
    globalName: normalized.devtools.globalName,
    bridgeGlobalName: normalized.devtools.bridgeGlobalName,
    floatingButton: normalized.devtools.floatingButton,
    rewind: normalized.devtools.rewind,
    timeline: normalized.devtools.timeline,
    telemetry: normalized.devtools.telemetry,
    stateSnapshots: normalized.devtools.stateSnapshots,
    patches: normalized.devtools.patches,
    crdt: normalized.devtools.crdt,
    eventLog: normalized.devtools.eventLog,
    traces: normalized.devtools.traces,
    autoBridge: normalized.devtools.autoBridge,
    maxRecords: normalized.devtools.maxRecords,
    evidencePath: '/' + normalized.frontend.evidenceDir.replace(/^dist\/frontend\/?/, '').replace(/^dist\//, '').replace(/^\/+/, '') + '/evidence.json'
  };
  return `
const config = ${JSON.stringify(devtools, null, 2)};
const records = {
  snapshots: [],
  patches: [],
  crdt: [],
  events: [],
  traces: [],
  telemetry: []
};
const snapshots = records.snapshots;
let currentState;
let hostBridge = readInitialBridge();

function readInitialBridge() {
  const candidate = globalThis[config.globalName] || globalThis.__FRONTIER_DOM_DEVTOOLS__;
  return candidate && candidate.kind !== 'frontier.framework.devtools.bridge' ? candidate : undefined;
}

function attachBridge(bridge) {
  hostBridge = bridge;
  return frameworkBridge;
}

function callHost(method, args) {
  if (!hostBridge || typeof hostBridge[method] !== 'function') return undefined;
  return hostBridge[method].apply(hostBridge, args || []);
}

function nowRecord(kind, payload, metadata) {
  return {
    kind,
    appId: config.appId,
    href: location.href,
    payload: sanitizePayload(payload),
    metadata: sanitizePayload(metadata || {}),
    capturedAt: new Date().toISOString()
  };
}

function sanitizePayload(value, depth) {
  const level = depth || 0;
  if (value === undefined) return undefined;
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.length > 4000 ? value.slice(0, 4000) + '...' : value;
  if (level > 5) return '[MaxDepth]';
  if (Array.isArray(value)) return value.slice(0, 80).map((item) => sanitizePayload(item, level + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).slice(0, 80)) out[key] = sanitizePayload(value[key], level + 1);
    return out;
  }
  return String(value);
}

function pushRecord(channel, record) {
  const list = records[channel];
  if (!list) return record;
  list.push(record);
  while (list.length > config.maxRecords) list.shift();
  return record;
}

function readState() {
  const hostState = callHost('getState') ?? callHost('state');
  if (hostState !== undefined) return hostState;
  if (currentState !== undefined) return currentState;
  if (globalThis.__FRONTIER_STATE__ !== undefined) return globalThis.__FRONTIER_STATE__;
  if (globalThis.__FRONTIER_APP_STATE__ !== undefined) return globalThis.__FRONTIER_APP_STATE__;
  return undefined;
}

function setState(value, metadata) {
  currentState = sanitizePayload(value);
  callHost('setState', [value, metadata]);
  if (config.telemetry) recordTelemetry({ type: 'state.set', summary: summarizeValue(value) }, metadata);
  return currentState;
}

function summarizeValue(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array(' + value.length + ')';
  if (typeof value === 'object') return 'object(' + Object.keys(value).length + ')';
  return typeof value;
}

function recordPatch(patch, metadata) {
  if (!config.patches) return undefined;
  callHost('recordPatch', [patch, metadata]);
  return pushRecord('patches', nowRecord('frontier.framework.devtools.patch', patch, metadata));
}

function recordCrdtUpdate(update, metadata) {
  if (!config.crdt) return undefined;
  callHost('recordCrdtUpdate', [update, metadata]);
  return pushRecord('crdt', nowRecord('frontier.framework.devtools.crdt-update', update, metadata));
}

function recordEventLogEntry(event, metadata) {
  if (!config.eventLog) return undefined;
  callHost('recordEventLogEntry', [event, metadata]);
  return pushRecord('events', nowRecord('frontier.framework.devtools.event-log-entry', event, metadata));
}

function recordTrace(trace, metadata) {
  if (!config.traces) return undefined;
  callHost('recordTrace', [trace, metadata]);
  return pushRecord('traces', nowRecord('frontier.framework.devtools.trace', trace, metadata));
}

function recordTelemetry(record, metadata) {
  if (!config.telemetry) return undefined;
  callHost('recordTelemetry', [record, metadata]);
  return pushRecord('telemetry', nowRecord('frontier.framework.devtools.telemetry', record, metadata));
}

function readTimeline() {
  const hostTimeline = callHost('timeline');
  return {
    kind: 'frontier.framework.devtools.timeline',
    appId: config.appId,
    host: hostTimeline,
    records: {
      snapshots: records.snapshots.slice(-20),
      patches: records.patches.slice(-40),
      crdt: records.crdt.slice(-40),
      events: records.events.slice(-40),
      traces: records.traces.slice(-40),
      telemetry: records.telemetry.slice(-40)
    }
  };
}

function inspect() {
  const hostInspect = callHost('inspect');
  return Promise.resolve(hostInspect).then((host) => ({
    kind: 'frontier.framework.devtools.inspect',
    appId: config.appId,
    href: location.href,
    title: document.title,
    bridge: {
      globalName: config.globalName,
      bridgeGlobalName: config.bridgeGlobalName,
      hostAttached: Boolean(hostBridge),
      autoBridge: config.autoBridge
    },
    state: config.stateSnapshots ? sanitizePayload(readState()) : undefined,
    build: sanitizePayload(globalThis.__FRONTIER_FRAMEWORK_BUILD__),
    host: sanitizePayload(host),
    counts: {
      snapshots: records.snapshots.length,
      patches: records.patches.length,
      crdt: records.crdt.length,
      events: records.events.length,
      traces: records.traces.length,
      telemetry: records.telemetry.length
    },
    latest: {
      snapshot: records.snapshots[records.snapshots.length - 1],
      patch: records.patches[records.patches.length - 1],
      crdt: records.crdt[records.crdt.length - 1],
      event: records.events[records.events.length - 1],
      trace: records.traces[records.traces.length - 1],
      telemetry: records.telemetry[records.telemetry.length - 1]
    }
  }));
}

function captureSnapshot(reason) {
  const hostSnapshot = callHost('snapshot', [reason]);
  const snapshot = hostSnapshot !== undefined
    ? sanitizePayload(hostSnapshot)
    : {
        kind: 'frontier.framework.devtools.snapshot',
        reason,
        appId: config.appId,
        href: location.href,
        title: document.title,
        state: config.stateSnapshots ? sanitizePayload(readState()) : undefined,
        timelineCounts: {
          patches: records.patches.length,
          crdt: records.crdt.length,
          events: records.events.length,
          traces: records.traces.length,
          telemetry: records.telemetry.length
        },
        bodyText: document.body ? document.body.innerText.slice(0, 4000) : '',
        capturedAt: new Date().toISOString()
      };
  return pushRecord('snapshots', snapshot);
}

function rewindOneStep() {
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : snapshots[0];
  if (previous) {
    callHost('rewind', [previous]);
    if (previous.state !== undefined) setState(previous.state, { reason: 'rewind' });
    recordTelemetry({ type: 'rewind', snapshot: previous.capturedAt || previous.reason }, { source: 'devtools' });
    return previous;
  }
  return captureSnapshot('rewind-placeholder');
}

async function loadEvidence() {
  if (!config.evidencePath || typeof fetch !== 'function') return { kind: 'frontier.framework.devtools.evidence', available: false };
  try {
    const response = await fetch(config.evidencePath, { cache: 'no-store' });
    if (!response.ok) return { kind: 'frontier.framework.devtools.evidence', available: false, status: response.status };
    return await response.json();
  } catch (error) {
    return { kind: 'frontier.framework.devtools.evidence', available: false, error: String(error && error.message || error) };
  }
}

const frameworkBridge = {
  kind: 'frontier.framework.devtools.bridge',
  version: 1,
  config,
  records,
  snapshots,
  attachBridge,
  inspect,
  snapshot: captureSnapshot,
  captureSnapshot,
  rewind: rewindOneStep,
  rewindOneStep,
  getState: readState,
  setState,
  recordPatch,
  recordCrdtUpdate,
  recordEventLogEntry,
  recordTrace,
  recordTelemetry,
  timeline: readTimeline,
  loadEvidence
};

function installBridge() {
  globalThis.__FRONTIER_FRAMEWORK_DEVTOOLS__ = frameworkBridge;
  if (config.autoBridge && globalThis[config.bridgeGlobalName] === undefined) globalThis[config.bridgeGlobalName] = frameworkBridge;
  if (config.autoBridge && config.globalName !== config.bridgeGlobalName && globalThis[config.globalName] === undefined) globalThis[config.globalName] = frameworkBridge;
}

function ensureOverlay() {
  if (!config.floatingButton || document.getElementById('frontier-framework-devtools')) return;
  const root = document.createElement('section');
  root.id = 'frontier-framework-devtools';
  root.setAttribute('aria-live', 'polite');
  root.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;font:12px/1.4 ui-sans-serif,system-ui,sans-serif;color:#111827';
  root.innerHTML = '<button type="button" data-frontier-toggle title="Frontier devtools" style="width:44px;height:44px;border-radius:999px;border:1px solid #111827;background:#111827;color:white;box-shadow:0 8px 22px rgba(0,0,0,.22);font-weight:700;cursor:pointer">F</button><div data-frontier-panel hidden style="width:min(440px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 88px));overflow:auto;margin-bottom:10px;padding:12px;border:1px solid #d1d5db;background:white;box-shadow:0 14px 38px rgba(0,0,0,.18)"><strong>Frontier</strong><div data-frontier-status style="margin:8px 0;color:#4b5563">Ready</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-frontier-inspect>Inspect</button><button type="button" data-frontier-snapshot>Snapshot</button><button type="button" data-frontier-timeline>Timeline</button><button type="button" data-frontier-state>State</button><button type="button" data-frontier-evidence>Evidence</button><button type="button" data-frontier-rewind>Rewind</button></div><pre data-frontier-output style="white-space:pre-wrap;max-height:420px;overflow:auto;margin:10px 0 0;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace"></pre></div>';
  const button = root.querySelector('[data-frontier-toggle]');
  const panel = root.querySelector('[data-frontier-panel]');
  const status = root.querySelector('[data-frontier-status]');
  const output = root.querySelector('[data-frontier-output]');
  const write = (value) => {
    if (status) status.textContent = snapshots.length + ' snapshots, ' + records.patches.length + ' patches, ' + records.crdt.length + ' CRDT, ' + records.events.length + ' events';
    if (output) output.textContent = JSON.stringify(value, null, 2);
  };
  button.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) write(captureSnapshot('open'));
  });
  root.querySelector('[data-frontier-inspect]').addEventListener('click', async () => {
    write(await inspect());
  });
  root.querySelector('[data-frontier-snapshot]').addEventListener('click', () => write(captureSnapshot('manual')));
  root.querySelector('[data-frontier-timeline]').addEventListener('click', () => write(readTimeline()));
  root.querySelector('[data-frontier-state]').addEventListener('click', () => write({ kind: 'frontier.framework.devtools.state', appId: config.appId, state: sanitizePayload(readState()) }));
  root.querySelector('[data-frontier-evidence]').addEventListener('click', async () => write(await loadEvidence()));
  root.querySelector('[data-frontier-rewind]').addEventListener('click', () => write(rewindOneStep()));
  document.body.appendChild(root);
}

installBridge();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureOverlay, { once: true });
else ensureOverlay();
`.trim() + '\n';
}

export function createFrontierFrameworkScaffold(options: FrontierFrameworkScaffoldOptions = {}): FrontierFrameworkScaffoldFile[] {
  const name = options.name ?? 'frontier-framework';
  const packageManager = options.packageManager ?? 'npm';
  const monorepo = options.monorepo !== false;
  const workspaceKind = monorepo ? 'monorepo' : 'single';
  const files: FrontierFrameworkScaffoldFile[] = [
    {
      path: 'package.json',
      content: JSON.stringify({
        name,
        private: true,
        type: 'module',
        workspaces: monorepo ? ['apps/*', 'packages/*'] : undefined,
        scripts: {
          build: 'frontier build',
          'build:web': 'frontier build --target frontend',
          'build:api': 'frontier build --target backend',
          preview: 'frontier build --target evidence',
          dev: 'frontier dev',
          test: 'frontier build --target evidence && node .frontier-framework/harness/frontier-smoke.mjs',
          inspect: 'frontier inspect --json',
          doctor: 'frontier doctor --json',
          docs: 'frontier docs build --json',
          lint: 'frontier lint --json',
          auth: 'frontier auth --json',
          migrations: 'frontier migrations --json',
          agent: 'frontier agent --json',
          loop: 'frontier loop --json',
          'agent:check': 'frontier build --target evidence && node .frontier-framework/agent/frontier-agent-check.mjs',
          'agent:replay': 'frontier build --target evidence && node .frontier-framework/agent/frontier-agent-replay.mjs --required-only',
          harness: 'frontier harness',
          fuzz: 'frontier build --target evidence && node .frontier-framework/harness/frontier-fuzz.mjs --cases 64',
          bench: 'frontier build --target evidence && node .frontier-framework/harness/frontier-bench.mjs --runs 5',
          browser: 'frontier build --target evidence && node .frontier-framework/harness/frontier-browser-smoke.mjs',
          'deploy:plan': 'frontier deploy-plan --json'
        },
        dependencies: {
          '@shapeshift-labs/frontier-framework': '^0.1.1',
          '@shapeshift-labs/frontier-ast-walk': '^0.1.0',
          '@shapeshift-labs/frontier-component-preview': '^0.1.2',
          '@shapeshift-labs/frontier-documentation': '^0.1.1',
          '@shapeshift-labs/frontier-design': '^0.1.0',
          '@shapeshift-labs/frontier-auth': '^0.1.0',
          '@shapeshift-labs/frontier-dom': '^0.1.0',
          '@shapeshift-labs/frontier-route': '^0.1.0',
          '@shapeshift-labs/frontier-view': '^0.1.0',
          '@shapeshift-labs/frontier-migrations': '^0.1.2',
          '@shapeshift-labs/frontier-state': '^0.1.1',
          '@shapeshift-labs/frontier-crdt-sync': '^0.1.0',
          '@shapeshift-labs/frontier-crdt-websocket': '^0.1.0',
          '@shapeshift-labs/frontier-event-log': '^0.1.0',
          '@shapeshift-labs/frontier-state-cache': '^0.1.0',
          '@shapeshift-labs/frontier-logging': '^0.1.0',
          '@shapeshift-labs/frontier-trace': '^0.1.0',
          '@shapeshift-labs/frontier-inspect': '^0.1.0',
          '@shapeshift-labs/frontier-test': '^0.1.0',
          '@shapeshift-labs/frontier-linter': '^0.1.0',
          '@shapeshift-labs/frontier-workflow': '^0.1.0'
        },
        devDependencies: {
          '@playwright/test': '^1.60.0',
          '@shapeshift-labs/frontier-linter': '^0.1.0',
          '@shapeshift-labs/frontier-playwright': '^0.1.0',
          'fast-check': '^4.8.0',
          typescript: '^6.0.3',
          vite: '^8.0.14'
        }
      }, null, 2) + '\n'
    },
    {
      path: 'frontier.config.mjs',
      content: renderConfig({ name, workspaceKind, packageManager })
    },
    {
      path: '.gitignore',
      content: "node_modules/\ndist/\n.frontier-framework/\nagent-runs/\n.env\n"
    },
    {
      path: 'AGENTS.md',
      content: "# Frontier App Agent Notes\n\n- Start with `npm run inspect` or `npm run agent` before broad edits.\n- Keep frontend, backend, contracts, harness, and evidence changes in their declared paths.\n- Update `features/*.json` when a change crosses routes, endpoints, state, tools, tests, or user-visible behavior.\n- Keep `conformance.mode: 'strict'` unless a human intentionally relaxes a rule with a documented config override.\n- Frontend JSX/TSX must use `@shapeshift-labs/frontier-dom` and `@shapeshift-labs/frontier-design`; missing usage should fail `npm run lint`.\n- Keep auth providers, route/resource gates, token contracts, runtime grants, and linking policy in `frontier.config.mjs`; run `npm run auth` when auth-sensitive surfaces change.\n- Keep business logic in declared domain modules, Frontier actions, effects, tools, workers, or workflows; route/component/API adapters should stay thin and `sourcePolicy.businessLogic` should remain enabled.\n- Keep runtime data-source migrations in the contracts package and wire `.frontier-framework/migrations/frontier-runtime-migrations.mjs` into app-state/cache hydration.\n- Use `.frontier-framework/agent/mcp-tools.json` and `.frontier-framework/agent/tool-manifest.json` when exposing project actions to agent clients.\n- Run `npm run docs` when docs, features, routes, components, backend endpoints, or package APIs change; it writes `.frontier-framework/documentation` and `dist/frontier/documentation.json`.\n- Run `npm run loop` before selecting the next page, route, filter, or action surface; it writes the agent-focused missing-evidence report.\n- Run `npm run lint`, `npm run harness`, and `npm run agent:check` before handoff when the change is intended for another agent or human.\n- Run `npm run agent:replay` before CI handoff when evidence gates need to be replayed locally.\n- Put replayable run artifacts under `agent-runs/` only when they are intentionally part of the handoff.\n"
    },
    {
      path: 'vite.config.ts',
      content: "import { frontierFrameworkVite } from '@shapeshift-labs/frontier-framework';\nimport frontierConfig from './frontier.config.mjs';\n\nexport default {\n  plugins: [frontierFrameworkVite(frontierConfig)]\n};\n"
    },
    {
      path: 'features/app-shell.json',
      content: JSON.stringify({
        id: 'app-shell',
        title: 'App Shell',
        packages: ['@shapeshift-labs/frontier-framework', '@shapeshift-labs/frontier-auth'],
        routes: ['/'],
        acceptance: [
          { id: 'vite-build', query: 'Vite build emits frontend assets and evidence.' },
          { id: 'component-preview', query: 'Component preview book and manifest are generated.' },
          { id: 'documentation', query: 'Documentation book, search records, JSONL, and evidence are generated.' },
          { id: 'hybrid-harness', query: 'Hybrid harness declares tests, fuzzers, benchmarks, and telemetry evidence.' },
          { id: 'auth', query: 'Frontier auth manifest declares providers, gates, token contracts, and runtime grants.' }
        ]
      }, null, 2) + '\n'
    },
    {
      path: 'turbo.json',
      content: JSON.stringify({
        tasks: {
          build: { dependsOn: ['^build'], outputs: ['dist/**'] },
          'build:web': { dependsOn: ['^build'], outputs: ['dist/frontend/**'] },
          'build:api': { dependsOn: ['^build'], outputs: ['dist/backend/**'] },
          preview: { dependsOn: ['build'], outputs: ['.frontier-framework/component-preview/**', '.frontier-framework/documentation/**', 'dist/frontier/component-preview.json', 'dist/frontier/documentation.json'] },
          docs: { dependsOn: ['build'], outputs: ['.frontier-framework/documentation/**', 'dist/frontier/documentation.json'] },
          inspect: { dependsOn: ['build'], outputs: ['dist/frontier/**'] },
          doctor: { dependsOn: ['build'], outputs: [] },
          lint: { dependsOn: ['build'], outputs: ['dist/frontier/conformance.json', 'dist/frontier/conformance.sarif', 'dist/frontier/source-graph.json', 'dist/frontier/source-registry.json'] },
          auth: { dependsOn: ['build'], outputs: ['.frontier-framework/auth/**', 'dist/frontier/auth.json'] },
          harness: { dependsOn: ['build'], outputs: ['dist/frontier/harness/**'] },
          agent: { dependsOn: ['build'], outputs: ['.frontier-framework/agent/**'] },
          'agent:check': { dependsOn: ['build'], outputs: ['.frontier-framework/agent/**'] },
          'agent:replay': { dependsOn: ['build'], outputs: ['.frontier-framework/agent/**', 'agent-runs/**'] },
          fuzz: { dependsOn: ['build'], outputs: ['dist/frontier/harness/**'] },
          bench: { dependsOn: ['build'], outputs: ['dist/frontier/harness/**'] },
          browser: { dependsOn: ['build'], outputs: ['dist/frontier/harness/**'] },
          'deploy:plan': { dependsOn: ['build'], outputs: [] }
        }
      }, null, 2) + '\n'
    },
    {
      path: 'tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          allowImportingTsExtensions: true,
          rewriteRelativeImportExtensions: true,
          jsx: 'react-jsx',
          jsxImportSource: '@shapeshift-labs/frontier-dom',
          strict: true,
          exactOptionalPropertyTypes: true,
          noUncheckedIndexedAccess: true,
          noImplicitOverride: true,
          skipLibCheck: true
        },
        include: ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts', 'packages/**/*.tsx']
      }, null, 2) + '\n'
    },
    {
      path: 'apps/web/src/routes/index.tsx',
      content: "import { tokenVar } from '@shapeshift-labs/frontier-design';\nimport { state } from '@shapeshift-labs/frontier-dom';\nimport { HomeView } from '../components/HomeView.tsx';\n\nconst routeState = state();\nvoid routeState;\n\nexport default function Page() {\n  return <HomeView accent={tokenVar('color.accent')} />;\n}\n"
    },
    {
      path: 'apps/web/src/components/HomeView.tsx',
      content: "import { tokenVar } from '@shapeshift-labs/frontier-design';\nimport { actions, state } from '@shapeshift-labs/frontier-dom';\n\nconst $ = state();\n\nexport function HomeView({ accent = tokenVar('color.accent') }: { accent?: string }) {\n  return (\n    <main class=\"shell\" style={{ '--frontier-accent': accent }}>\n      <h1>{$.title}</h1>\n      <p>{$.intro}</p>\n      <button onClick={actions.counter.increment({ id: $.counter.id })}>Increment</button>\n    </main>\n  );\n}\n"
    },
    {
      path: 'apps/web/src/runtime/dom-events.ts',
      content: "export function installDomEvents(target: Document = document): void {\n  target.addEventListener('click', () => undefined);\n}\n"
    },
    {
      path: 'apps/web/src/runtime/forms.ts',
      content: "export interface FormActionDraft {\n  id: string;\n  value: string;\n}\n\nexport function createFormAction(draft: FormActionDraft): FormActionDraft {\n  return { id: draft.id, value: draft.value };\n}\n"
    },
    {
      path: 'apps/web/src/runtime/tools.ts',
      content: "export interface ToolSurfaceAction {\n  id: string;\n}\n\nexport function createToolSurfaceAction(id: string): ToolSurfaceAction {\n  return { id };\n}\n"
    },
    {
      path: 'apps/web/src/runtime/offline.ts',
      content: "export interface OfflineSnapshotEnvelope {\n  kind: 'frontier.offline.snapshot';\n  capturedAt: string;\n}\n\nexport function createOfflineSnapshotEnvelope(capturedAt = new Date(0).toISOString()): OfflineSnapshotEnvelope {\n  return { kind: 'frontier.offline.snapshot', capturedAt };\n}\n"
    },
    {
      path: 'apps/web/src/runtime/test-api.ts',
      content: "export interface RuntimeTestApi {\n  ready: boolean;\n}\n\nexport function createRuntimeTestApi(): RuntimeTestApi {\n  return { ready: true };\n}\n"
    },
    {
      path: 'apps/web/public/styles.css',
      content: "body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #f7f8fa; color: #15171a; }\n.shell { min-height: 100vh; display: grid; align-content: center; gap: 16px; max-width: 720px; margin: 0 auto; padding: 48px 24px; }\nbutton { width: fit-content; border: 1px solid #15171a; background: #15171a; color: white; padding: 10px 14px; }\n"
    },
    {
      path: 'apps/api/src/handler.ts',
      content: "export async function handleFrontierRequest(request: Request): Promise<Response> {\n  const url = new URL(request.url);\n  if (url.pathname === '/api/health') {\n    return Response.json({ ok: true, service: 'frontier-api' });\n  }\n  return new Response('Not found', { status: 404 });\n}\n\nexport default { fetch: handleFrontierRequest };\n"
    },
    {
      path: 'packages/contracts/src/index.ts',
      content: "export * from './migrations';\n\nexport interface HealthResponse {\n  ok: boolean;\n  service: string;\n}\n"
    },
    {
      path: 'packages/contracts/src/migrations.ts',
      content: "import { createMigrationRegistry } from '@shapeshift-labs/frontier-migrations';\n\nexport const appDataMigrations = createMigrationRegistry({\n  id: 'app.migrations',\n  currentVersion: '1',\n  initialVersion: '1',\n  migrations: []\n});\n"
    },
    {
      path: 'packages/domain/src/index.ts',
      content: "export interface CounterState {\n  value: number;\n}\n\nexport function nextCounterState(state: CounterState): CounterState {\n  return { value: state.value + 1 };\n}\n"
    }
  ];
  if (!monorepo) {
    return files.filter((file) => file.path !== 'turbo.json').map((file) => ({
      ...file,
      path: file.path.replace(/^apps\/web\//, '').replace(/^apps\/api\//, 'server/').replace(/^packages\/contracts\//, 'contracts/').replace(/^packages\/domain\//, 'domain/')
    }));
  }
  return files;
}

function createRouteEntries(config: NormalizedFrontierFrameworkConfig): FrontierRouteEntry[] {
  const frontendRoutes = config.frontend.routes.length === 0
    ? [{ path: '/', file: joinAppPath(config.frontend.root, config.frontend.routesDir, 'index.tsx'), feature: 'home' }]
    : config.frontend.routes;
  const routes: FrontierRouteEntry[] = frontendRoutes.map((route) => ({
    id: route.id ?? 'route:' + route.path,
    kind: 'route',
    resource: route.path,
    pattern: route.path,
    title: route.title,
    feature: route.feature,
    owner: route.owner,
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    source: { file: route.file, package: FRONTIER_FRAMEWORK_PACKAGE_NAME },
    reads: route.reads,
    writes: route.writes,
    tags: ['frontend', ...(route.tags ?? [])],
    metadata: route.metadata
  }));
  for (const endpoint of config.backend.endpoints) {
    routes.push({
      id: endpoint.id ?? 'endpoint:' + (endpoint.method ?? 'GET') + ':' + endpoint.path,
      kind: 'endpoint',
      resource: endpoint.path,
      pattern: endpoint.path,
      title: endpoint.method ? endpoint.method + ' ' + endpoint.path : endpoint.path,
      feature: endpoint.feature,
      owner: endpoint.owner,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      source: endpoint.file ? { file: endpoint.file, package: FRONTIER_FRAMEWORK_PACKAGE_NAME } : undefined,
      reads: endpoint.reads,
      writes: endpoint.writes,
      emits: endpoint.effects,
      tags: ['backend', 'fetch-handler', ...(endpoint.tags ?? [])],
      metadata: { method: endpoint.method ?? 'GET', ...endpoint.metadata }
    });
  }
  for (const transport of config.backend.transports) {
    routes.push({
      id: 'transport:' + transportId(transport),
      kind: 'transport',
      resource: transportResource(transport),
      pattern: transport.path,
      title: transport.kind + ' transport',
      feature: transport.feature,
      owner: transport.owner,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      reads: transport.reads,
      writes: transport.writes,
      emits: transport.effects,
      tags: ['backend', 'transport', transport.kind, transport.protocol ?? 'custom', ...(transport.tags ?? [])],
      metadata: {
        protocol: transport.protocol ?? inferTransportProtocol(transport.kind),
        adapter: transport.adapter ?? '',
        package: transport.package ?? '',
        runtime: transport.runtime ?? '',
        required: transport.required === true,
        ...transport.metadata
      }
    });
  }
  return routes;
}

function normalizeRouteScenarioFixture(
  fixture: FrontierFrameworkRouteScenarioFixtureConfig
): FrontierFrameworkRouteScenarioFixture {
  const files = uniqueStrings([
    ...(fixture.files ?? []),
    ...(fixture.file ? [fixture.file] : [])
  ]);
  return {
    id: fixture.id,
    kind: fixture.kind ?? 'custom',
    title: fixture.title ?? fixture.id,
    source: fixture.source ?? fixture.file,
    files,
    data: fixture.data,
    tags: [...(fixture.tags ?? [])],
    metadata: fixture.metadata ?? {}
  };
}

function normalizeRouteScenario(
  scenario: FrontierFrameworkRouteScenarioConfig
): FrontierFrameworkRouteScenario {
  const fixtures = uniqueStrings([
    ...(scenario.fixtures ?? []),
    ...(scenario.authFixture ? [scenario.authFixture] : []),
    ...(scenario.sessionFixture ? [scenario.sessionFixture] : []),
    ...(scenario.stateFixture ? [scenario.stateFixture] : [])
  ]);
  return {
    id: scenario.id,
    title: scenario.title ?? scenario.id,
    route: scenario.route,
    path: scenario.path ?? scenario.route,
    authFixture: scenario.authFixture,
    sessionFixture: scenario.sessionFixture,
    stateFixture: scenario.stateFixture,
    fixtures,
    feature: scenario.feature,
    owner: scenario.owner,
    expected: normalizeRouteScenarioExpected(scenario.expected),
    tags: [...(scenario.tags ?? [])],
    metadata: scenario.metadata ?? {}
  };
}

function normalizeRouteScenarioExpected(
  expected: FrontierFrameworkRouteScenarioExpectation = {}
): FrontierFrameworkRouteScenarioExpected {
  return {
    redirectTo: expected.redirectTo,
    finalPath: expected.finalPath,
    status: expected.status,
    domRoles: (expected.domRoles ?? []).map((role) => ({
      role: role.role,
      name: role.name,
      selector: role.selector,
      required: role.required ?? true,
      count: role.count,
      tags: [...(role.tags ?? [])],
      metadata: role.metadata ?? {}
    })),
    selectors: (expected.selectors ?? []).map((selector) => ({
      selector: selector.selector,
      text: selector.text,
      required: selector.required ?? true,
      count: selector.count,
      tags: [...(selector.tags ?? [])],
      metadata: selector.metadata ?? {}
    })),
    text: [...(expected.text ?? [])],
    statePaths: [...(expected.statePaths ?? [])],
    consoleErrors: expected.consoleErrors ?? 'fail',
    scroll: expected.scroll ?? 'optional',
    metadata: expected.metadata ?? {}
  };
}

function createRouteScenarioManifestFromConfig(
  config: NormalizedFrontierFrameworkConfig
): FrontierFrameworkRouteScenarioManifest {
  const enabled = config.routeScenarios.enabled;
  const scenarios = enabled ? config.routeScenarios.scenarios : [];
  const fixtures = enabled ? config.routeScenarios.fixtures : [];
  return {
    kind: 'frontier.framework.route-scenario.manifest',
    version: 1,
    appId: config.id,
    enabled,
    fixtures,
    scenarios,
    summary: {
      fixtureCount: fixtures.length,
      scenarioCount: scenarios.length,
      redirectCount: scenarios.filter((scenario) => Boolean(scenario.expected.redirectTo)).length,
      domAssertionCount: scenarios.reduce((sum, scenario) => (
        sum
        + scenario.expected.domRoles.length
        + scenario.expected.selectors.length
        + scenario.expected.text.length
        + scenario.expected.statePaths.length
      ), 0)
    },
    tags: [...config.routeScenarios.tags],
    metadata: config.routeScenarios.metadata
  };
}

function createRouteScenarioPlaywrightPlanFromConfig(
  config: NormalizedFrontierFrameworkConfig,
  options: FrontierFrameworkRouteScenarioPlaywrightPlanOptions = {}
): FrontierFrameworkRouteScenarioPlaywrightPlan {
  return createRouteScenarioPlaywrightPlanFromManifest(
    config,
    createRouteScenarioManifestFromConfig(config),
    options
  );
}

function createRouteScenarioPlaywrightPlanFromManifest(
  config: NormalizedFrontierFrameworkConfig,
  manifest: FrontierFrameworkRouteScenarioManifest,
  options: FrontierFrameworkRouteScenarioPlaywrightPlanOptions = {}
): FrontierFrameworkRouteScenarioPlaywrightPlan {
  const baseUrl = options.baseUrl ?? '/';
  const probes = [
    'route-current',
    'route-final-path',
    'dom-roles',
    'selectors',
    'text-content',
    'console-errors',
    'scroll-policy',
    'state-paths',
    'loaded-assets',
    'hydration-status'
  ];
  return {
    kind: 'frontier.framework.route-scenario.playwright-plan',
    version: 1,
    appId: config.id,
    baseUrl,
    manifest,
    cases: manifest.scenarios.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      route: scenario.route,
      path: scenario.path,
      url: joinUrlPath(baseUrl, scenario.path),
      authFixture: scenario.authFixture,
      sessionFixture: scenario.sessionFixture,
      stateFixture: scenario.stateFixture,
      fixtures: [...scenario.fixtures],
      expected: scenario.expected,
      steps: createRouteScenarioSteps(scenario),
      probes,
      tags: [...scenario.tags],
      metadata: scenario.metadata
    })),
    probes,
    artifacts: [
      config.routeScenarios.manifestFile,
      config.routeScenarios.playwrightPlanFile,
      config.harness.evidenceDir + '/browser-harness.json'
    ],
    metadata: {
      generatedDir: config.routeScenarios.generatedDir,
      fixtureCount: manifest.summary.fixtureCount,
      scenarioCount: manifest.summary.scenarioCount
    }
  };
}

function createRouteScenarioSteps(scenario: FrontierFrameworkRouteScenario): string[] {
  const steps = ['apply-fixtures', 'navigate', 'capture-dom', 'capture-layout', 'capture-console'];
  if (scenario.expected.redirectTo || scenario.expected.finalPath) steps.push('assert-final-route');
  if (scenario.expected.domRoles.length) steps.push('assert-dom-roles');
  if (scenario.expected.selectors.length) steps.push('assert-selectors');
  if (scenario.expected.text.length) steps.push('assert-text');
  if (scenario.expected.statePaths.length) steps.push('assert-state-paths');
  if (scenario.expected.scroll !== 'optional') steps.push('assert-scroll-policy');
  return steps;
}

function normalizeSurfaceIntentConfigs(
  input: readonly FrontierFrameworkSurfaceIntentConfig[] | undefined
): FrontierFrameworkSurfaceIntentConfig[] {
  return (input ?? []).map((intent) => ({
    ...intent,
    id: intent.id.trim(),
    kind: intent.kind.trim(),
    title: intent.title?.trim() || undefined,
    status: intent.status?.trim() || undefined,
    aliases: uniqueStrings([...(intent.aliases ?? [])]),
    route: intent.route ? ensureLeadingSlash(intent.route.trim()) : undefined,
    feature: intent.feature?.trim() || undefined,
    owner: intent.owner?.trim() || undefined,
    files: uniqueStrings([...(intent.files ?? [])]),
    evidence: uniqueStrings([...(intent.evidence ?? [])]),
    dependsOn: uniqueStrings([...(intent.dependsOn ?? [])]),
    coverage: uniqueStrings([...(intent.coverage ?? [])]),
    scenario: normalizeSurfaceIntentScenario(intent.scenario),
    tags: uniqueStrings(['surface-intent', ...(intent.tags ?? [])]),
    metadata: intent.metadata ?? {}
  }));
}

function normalizeSurfaceIntentScenario(
  scenario: boolean | FrontierFrameworkSurfaceIntentScenarioConfig | undefined
): boolean | FrontierFrameworkSurfaceIntentScenarioConfig | undefined {
  if (scenario === undefined || typeof scenario === 'boolean') return scenario;
  return {
    ...scenario,
    id: scenario.id?.trim() || undefined,
    title: scenario.title?.trim() || undefined,
    path: scenario.path ? ensureLeadingSlash(scenario.path.trim()) : undefined,
    authFixture: scenario.authFixture?.trim() || undefined,
    sessionFixture: scenario.sessionFixture?.trim() || undefined,
    stateFixture: scenario.stateFixture?.trim() || undefined,
    fixtures: uniqueStrings([...(scenario.fixtures ?? [])]),
    expected: scenario.expected,
    tags: uniqueStrings([...(scenario.tags ?? [])]),
    metadata: scenario.metadata ?? {}
  };
}

function createSurfaceIntentRouteScenarios(
  intents: readonly FrontierFrameworkSurfaceIntentConfig[],
  configured: readonly FrontierFrameworkRouteScenario[]
): FrontierFrameworkRouteScenario[] {
  const existingIds = new Set(configured.map((scenario) => scenario.id));
  const generated: FrontierFrameworkRouteScenario[] = [];
  for (const intent of intents) {
    if (!surfaceIntentWantsRouteScenario(intent) || !intent.route) continue;
    const scenarioInput = surfaceIntentScenarioInput(intent);
    const id = scenarioInput.id ?? 'surface-' + slugify(intent.id);
    if (existingIds.has(id)) continue;
    existingIds.add(id);
    generated.push(normalizeRouteScenario({
      id,
      title: scenarioInput.title ?? 'Surface intent for ' + (intent.title ?? intent.id),
      route: intent.route,
      path: scenarioInput.path ?? intent.route,
      authFixture: scenarioInput.authFixture,
      sessionFixture: scenarioInput.sessionFixture,
      stateFixture: scenarioInput.stateFixture,
      fixtures: scenarioInput.fixtures,
      feature: intent.feature,
      owner: intent.owner,
      expected: {
        finalPath: scenarioInput.expected?.redirectTo ? undefined : (scenarioInput.expected?.finalPath ?? scenarioInput.path ?? intent.route),
        consoleErrors: 'fail',
        scroll: 'optional',
        ...scenarioInput.expected
      },
      tags: uniqueStrings(['generated', 'surface-intent', intent.kind, ...(intent.tags ?? []), ...(scenarioInput.tags ?? [])]),
      metadata: { surfaceId: intent.id, generatedFrom: 'surfaces.intents', ...(scenarioInput.metadata ?? {}) }
    }));
  }
  return generated;
}

function surfaceIntentWantsRouteScenario(intent: FrontierFrameworkSurfaceIntentConfig): boolean {
  if (!intent.route || intent.scenario === false) return false;
  if (intent.scenario !== undefined) return true;
  return ['route', 'page', 'view', 'component'].includes(intent.kind);
}

function surfaceIntentScenarioInput(
  intent: FrontierFrameworkSurfaceIntentConfig
): FrontierFrameworkSurfaceIntentScenarioConfig {
  return typeof intent.scenario === 'object' && intent.scenario !== null ? intent.scenario : {};
}

function surfaceRecordFromIntent(intent: FrontierFrameworkSurfaceIntentConfig): FrontierFrameworkSurfaceConfig {
  return {
    id: intent.id,
    kind: intent.kind,
    title: intent.title,
    status: intent.status,
    aliases: intent.aliases,
    route: intent.route,
    feature: intent.feature,
    owner: intent.owner,
    files: intent.files,
    evidence: intent.evidence,
    dependsOn: intent.dependsOn,
    coverage: intent.coverage,
    contracts: intent.contracts,
    tags: uniqueStrings(['surface-intent', ...(intent.tags ?? [])]),
    metadata: { generatedFrom: 'surfaces.intents', ...(intent.metadata ?? {}) }
  };
}

function normalizeSurfacesConfig(
  input: FrontierFrameworkSurfacesConfig,
  defaults: {
    appId: string;
    generatedDir: string;
    frontendRoutes: readonly FrontierFrontendRouteConfig[];
    features: readonly FrontierFrameworkFeatureConfig[];
    intents: readonly FrontierFrameworkSurfaceIntentConfig[];
  }
): NormalizedFrontierFrameworkConfig['surfaces'] {
  const defaultStatus = input.defaultStatus ?? 'untracked';
  const statuses = normalizeSurfaceStatuses(input.statuses, defaultStatus);
  const intentSurfaces = defaults.intents.map((intent) => normalizeSurfaceRecord(surfaceRecordFromIntent(intent), 'config', defaultStatus));
  const configured = [
    ...(input.surfaces ?? []).map((surface) => normalizeSurfaceRecord(surface, 'config', defaultStatus)),
    ...intentSurfaces
  ];
  const generated: FrontierFrameworkSurfaceRecord[] = [];
  if (input.deriveRoutes ?? true) {
    for (const route of defaults.frontendRoutes) {
      const id = 'route:' + route.path;
      if (configured.some((surface) => surfaceRepresentsDerivedRoute(surface, route.path))) continue;
      generated.push({
        id,
        kind: 'route',
        title: route.title ?? route.path,
        status: defaultStatus,
        aliases: surfaceAliasesForRoute(route.path),
        route: route.path,
        feature: route.feature,
        owner: route.owner,
        files: [route.file],
        evidence: [],
        dependsOn: [],
        coverage: [],
        contracts: [],
        source: 'route',
        tags: ['derived', 'route', ...(route.tags ?? [])],
        metadata: route.metadata ?? {}
      });
    }
  }
  if (input.deriveFeatures ?? true) {
    for (const feature of defaults.features) {
      const id = 'feature:' + feature.id;
      if (configured.some((surface) => surfaceRepresentsDerivedFeature(surface, feature.id))) continue;
      generated.push({
        id,
        kind: 'feature',
        title: feature.title ?? feature.id,
        status: defaultStatus,
        aliases: [feature.id],
        feature: feature.id,
        owner: feature.owner,
        files: [],
        evidence: [],
        dependsOn: [],
        coverage: [],
        contracts: [],
        source: 'feature',
        tags: ['derived', 'feature', ...(feature.tags ?? [])],
        metadata: feature.metadata ?? {}
      });
    }
  }
  return {
    enabled: input.enabled ?? true,
    generatedDir: defaults.generatedDir,
    registryFile: input.registryFile ?? defaults.generatedDir + '/registry.json',
    defaultStatus,
    statuses,
    surfaces: [...configured, ...generated],
    intents: [...defaults.intents],
    deriveRoutes: input.deriveRoutes ?? true,
    deriveFeatures: input.deriveFeatures ?? true,
    coverage: normalizeSurfaceCoverageConfig(input.coverage, defaults.generatedDir),
    tags: [...(input.tags ?? [])],
    metadata: input.metadata ?? {}
  };
}

function normalizeSurfaceCoverageConfig(
  input: FrontierFrameworkSurfaceCoverageConfig | undefined,
  generatedDir: string
): NormalizedFrontierFrameworkConfig['surfaces']['coverage'] {
  return {
    enabled: input?.enabled ?? true,
    reportFile: input?.reportFile ?? generatedDir + '/coverage.json',
    dashboardFile: input?.dashboardFile ?? generatedDir + '/dashboard.md',
    failOnMissing: input?.failOnMissing ?? false,
    verifyEvidenceFiles: input?.verifyEvidenceFiles ?? false,
    verifyEvidenceFreshness: input?.verifyEvidenceFreshness ?? false,
    verifyEvidenceProbeKinds: input?.verifyEvidenceProbeKinds ?? false,
    evidenceRoots: uniqueStrings([...(input?.evidenceRoots ?? ['.'])]),
    evidenceProbeTokens: normalizeSurfaceProbeRequirementMap(input?.evidenceProbeTokens),
    focusKinds: uniqueStrings([...(input?.focusKinds ?? ['route', 'page', 'filter', 'action'])]),
    requireEvidenceForStatuses: uniqueStrings([...(input?.requireEvidenceForStatuses ?? ['verified'])]),
    requireRenderForKinds: uniqueStrings([...(input?.requireRenderForKinds ?? ['page', 'route', 'view', 'component'])]),
    requireStateForKinds: uniqueStrings([...(input?.requireStateForKinds ?? ['state'])]),
    requireProbesForKinds: normalizeSurfaceProbeRequirementMap(input?.requireProbesForKinds)
  };
}

function normalizeSurfaceProbeRequirementMap(
  input: Record<string, readonly FrontierFrameworkSurfaceCoverageProbeKind[]> | undefined
): Record<string, string[]> {
  const normalized: Record<string, string[]> = {};
  if (!input) return normalized;
  for (const [kind, probes] of Object.entries(input)) {
    const normalizedKind = kind.trim();
    if (!normalizedKind) continue;
    normalized[normalizedKind] = uniqueStrings([...(probes ?? [])].filter((probe) => typeof probe === 'string' && probe.trim()).map((probe) => probe.trim()));
  }
  return normalized;
}

function surfaceRepresentsDerivedRoute(surface: FrontierFrameworkSurfaceRecord, path: string): boolean {
  const route = ensureLeadingSlash(path);
  return surface.id === 'route:' + route || (surface.kind === 'route' && surface.route === route);
}

function surfaceRepresentsDerivedFeature(surface: FrontierFrameworkSurfaceRecord, featureId: string): boolean {
  return surface.id === 'feature:' + featureId || (surface.kind === 'feature' && surface.feature === featureId);
}

function normalizeSurfaceStatuses(
  input: readonly (string | FrontierFrameworkSurfaceStatusConfig)[] | undefined,
  defaultStatus: string
): FrontierFrameworkSurfaceStatusDefinition[] {
  const statusInputs = input && input.length > 0 ? input : defaultSurfaceStatuses();
  const byId = new Map<string, FrontierFrameworkSurfaceStatusDefinition>();
  for (const status of statusInputs) {
    const normalized = typeof status === 'string'
      ? normalizeSurfaceStatusDefinition({ id: status })
      : normalizeSurfaceStatusDefinition(status);
    byId.set(normalized.id, normalized);
  }
  if (!byId.has(defaultStatus)) byId.set(defaultStatus, normalizeSurfaceStatusDefinition({ id: defaultStatus }));
  return Array.from(byId.values());
}

function normalizeSurfaceStatusDefinition(
  status: FrontierFrameworkSurfaceStatusConfig
): FrontierFrameworkSurfaceStatusDefinition {
  return {
    id: status.id,
    title: status.title ?? titleFromId(status.id),
    description: status.description,
    terminal: status.terminal ?? ['verified', 'deprecated'].includes(status.id),
    tags: [...(status.tags ?? [])],
    metadata: status.metadata ?? {}
  };
}

function normalizeSurfaceRecord(
  surface: FrontierFrameworkSurfaceConfig,
  source: FrontierFrameworkSurfaceRecord['source'],
  defaultStatus: FrontierFrameworkSurfaceStatus
): FrontierFrameworkSurfaceRecord {
  return {
    id: surface.id,
    kind: surface.kind,
    title: surface.title ?? surface.id,
    status: surface.status ?? defaultStatus,
    aliases: uniqueStrings([...(surface.aliases ?? [])]),
    route: surface.route,
    feature: surface.feature,
    owner: surface.owner,
    files: [...(surface.files ?? [])],
    evidence: [...(surface.evidence ?? [])],
    dependsOn: [...(surface.dependsOn ?? [])],
    coverage: uniqueStrings([...(surface.coverage ?? [])].map((probe) => probe.trim()).filter(Boolean)),
    contracts: normalizeSurfaceContracts(surface.id, surface.contracts),
    source,
    tags: [...(surface.tags ?? [])],
    metadata: surface.metadata ?? {}
  };
}

function normalizeSurfaceContracts(
  surfaceId: string,
  contracts: readonly FrontierFrameworkSurfaceContractConfig[] | undefined
): FrontierFrameworkSurfaceContract[] {
  return (contracts ?? []).map((contract, index) => {
    const kind = String(contract.kind ?? 'evidence-ok').trim() || 'evidence-ok';
    return {
      id: String(contract.id ?? surfaceId + ':contract:' + kind + ':' + (index + 1)).trim(),
      kind,
      artifact: contract.artifact?.trim() || undefined,
      route: contract.route ? ensureLeadingSlash(contract.route) : undefined,
      samplePath: contract.samplePath ? ensureLeadingSlash(contract.samplePath) : undefined,
      scenario: contract.scenario?.trim() || undefined,
      required: contract.required !== false,
      tags: uniqueStrings([...(contract.tags ?? [])]),
      metadata: contract.metadata ?? {}
    };
  }).filter((contract) => contract.id);
}

function surfaceAliasesForRoute(path: string): string[] {
  const route = ensureLeadingSlash(path);
  const slug = route === '/' ? 'root' : route.slice(1).replace(/\/+/g, '.').replace(/[:*]/g, '').replace(/\.+/g, '.');
  return uniqueStrings(slug ? [route, slug] : [route]);
}

function createSurfaceRegistryFromConfig(config: NormalizedFrontierFrameworkConfig): FrontierFrameworkSurfaceRegistry {
  const enabled = config.surfaces.enabled;
  const surfaces = enabled ? config.surfaces.surfaces : [];
  const summary = createSurfaceStatusSummary(surfaces, new Map(config.surfaces.statuses.map((status) => [status.id, status])));
  return {
    kind: 'frontier.framework.surface-status.registry',
    version: 1,
    appId: config.id,
    enabled,
    statuses: enabled ? config.surfaces.statuses : [],
    surfaces,
    summary: {
      surfaceCount: summary.matchCount,
      statusCounts: summary.statusCounts,
      kindCounts: summary.kindCounts,
      verifiedCount: summary.verifiedCount,
      evidenceLinkedCount: summary.evidenceLinkedCount
    },
    tags: [...config.surfaces.tags],
    metadata: config.surfaces.metadata
  };
}

function createSurfaceStatusSummary(
  surfaces: readonly FrontierFrameworkSurfaceRecord[],
  statuses: ReadonlyMap<string, FrontierFrameworkSurfaceStatusDefinition>
): FrontierFrameworkSurfaceStatusReport['summary'] {
  const statusCounts: Record<string, number> = {};
  const kindCounts: Record<string, number> = {};
  let terminalCount = 0;
  let evidenceLinkedCount = 0;
  for (const surface of surfaces) {
    statusCounts[surface.status] = (statusCounts[surface.status] ?? 0) + 1;
    kindCounts[surface.kind] = (kindCounts[surface.kind] ?? 0) + 1;
    if (statuses.get(surface.status)?.terminal) terminalCount += 1;
    if (surface.evidence.length > 0) evidenceLinkedCount += 1;
  }
  return {
    matchCount: surfaces.length,
    statusCounts,
    kindCounts,
    verifiedCount: statusCounts.verified ?? 0,
    terminalCount,
    untrackedCount: statusCounts.untracked ?? 0,
    evidenceLinkedCount
  };
}

function normalizeSurfaceStatusQuery(
  query: FrontierFrameworkSurfaceStatusQuery
): FrontierFrameworkSurfaceStatusQuery {
  const ref = query.ref ? normalizeSurfaceRef(query.ref) : undefined;
  return {
    ref: ref || undefined,
    id: query.id,
    kind: query.kind,
    route: query.route ? ensureLeadingSlash(query.route) : undefined,
    feature: query.feature,
    owner: query.owner,
    status: query.status,
    tags: uniqueStrings([...(query.tags ?? [])])
  };
}

function surfaceMatchesSurfaceStatusQuery(
  surface: FrontierFrameworkSurfaceRecord,
  query: FrontierFrameworkSurfaceStatusQuery
): boolean {
  if (query.ref && !surfaceMatchesRef(surface, query.ref)) return false;
  if (query.id && surface.id !== query.id) return false;
  if (query.kind && surface.kind !== query.kind) return false;
  if (query.route && surface.route !== query.route) return false;
  if (query.feature && surface.feature !== query.feature) return false;
  if (query.owner && surface.owner !== query.owner) return false;
  if (query.status && surface.status !== query.status) return false;
  if (query.tags?.length && !query.tags.every((tag) => surface.tags.includes(tag))) return false;
  return true;
}

function normalizeSurfaceRef(ref: string): string {
  const trimmed = ref.trim();
  return trimmed.startsWith('/') ? ensureLeadingSlash(trimmed) : trimmed;
}

function surfaceMatchesRef(surface: FrontierFrameworkSurfaceRecord, ref: string): boolean {
  if (surface.id === ref) return true;
  if (surface.kind + ':' + surface.id === ref) return true;
  if (surface.route && (surface.route === ref || 'route:' + surface.route === ref)) return true;
  if (surface.feature && (surface.feature === ref || 'feature:' + surface.feature === ref)) return true;
  if (surface.owner && (surface.owner === ref || 'owner:' + surface.owner === ref)) return true;
  if (surface.aliases.includes(ref)) return true;
  if (surface.aliases.some((alias) => surface.kind + ':' + alias === ref)) return true;
  return false;
}

interface SurfaceCoverageContext {
  reportFile: string;
  requiredStatuses: ReadonlySet<string>;
  renderKinds: ReadonlySet<string>;
  stateKinds: ReadonlySet<string>;
  probesForKinds: Readonly<Record<string, readonly string[]>>;
  routeScenarios: FrontierFrameworkRouteScenarioManifest;
  routeScenarioPlaywright: FrontierFrameworkRouteScenarioPlaywrightPlan;
}

function createSurfaceCoverageRecord(
  surface: FrontierFrameworkSurfaceRecord,
  context: SurfaceCoverageContext
): FrontierFrameworkSurfaceCoverageRecord {
  const required: string[] = [];
  const covered: string[] = [];
  const missing: string[] = [];
  const probes: FrontierFrameworkSurfaceCoverageProbe[] = [];
  const nextProbes: FrontierFrameworkSurfaceCoverageProbePlan[] = [];
  const hints: string[] = [];
  const contractProofs = surface.contracts.map((contract) => createPlannedSurfaceContractProof(surface, contract));
  const explicitProbeKinds = surfaceExplicitProbeKinds(surface, context);
  const statusRequiresCoverage = context.requiredStatuses.has(surface.status);
  const claimRequiresCoverage = statusRequiresCoverage || explicitProbeKinds.length > 0 || surface.contracts.some((contract) => contract.required);
  if (!claimRequiresCoverage) {
    probes.push(createPlannedSurfaceProbe(surface, 'evidence', 'Surface status "' + surface.status + '" is not configured as a coverage claim.'));
    return { surface, required, covered, missing, probes, nextProbes, contracts: surface.contracts, contractProofs, ok: true, hints };
  }
  const requiredProbeKinds = surfaceRequiredProbeKinds(surface, context, explicitProbeKinds);
  for (const probeKind of requiredProbeKinds) {
    required.push(probeKind);
    const result = resolveSurfaceRequiredProbe(surface, probeKind, context);
    probes.push(...result.probes);
    if (result.covered) covered.push(probeKind);
    else {
      missing.push(probeKind);
      hints.push(result.hint);
      nextProbes.push(createSurfaceProbePlan(surface, probeKind, result.probes, result.hint, result.command));
    }
  }
  const missingRequiredContracts = contractProofs.filter((proof) => proof.required && proof.status !== 'passed');
  if (missingRequiredContracts.length > 0) hints.push(missingRequiredContracts[0].message);
  return {
    surface,
    required,
    covered,
    missing,
    probes,
    nextProbes,
    contracts: surface.contracts,
    contractProofs,
    ok: missing.length === 0 && missingRequiredContracts.length === 0,
    hints
  };
}

function createPlannedSurfaceContractProof(
  surface: FrontierFrameworkSurfaceRecord,
  contract: FrontierFrameworkSurfaceContract
): FrontierFrameworkSurfaceContractProof {
  const artifact = contract.artifact ?? surface.evidence[0];
  return {
    id: surface.id + ':' + contract.id + ':contract-proof',
    contractId: contract.id,
    kind: contract.kind,
    status: 'planned',
    required: contract.required,
    artifact,
    route: contract.route ?? surface.route,
    samplePath: contract.samplePath,
    scenario: contract.scenario,
    message: 'Surface contract "' + contract.id + '" has not been verified against evidence yet.',
    tags: uniqueStrings(['surface-contract', 'planned', contract.kind, surface.kind, surface.status, ...contract.tags])
  };
}

function surfaceRequiredProbeKinds(
  surface: FrontierFrameworkSurfaceRecord,
  context: SurfaceCoverageContext,
  explicitProbeKinds: readonly string[]
): string[] {
  const requirements = ['evidence'];
  if (context.renderKinds.has(surface.kind)) requirements.push('render');
  if (context.stateKinds.has(surface.kind)) requirements.push('state');
  requirements.push(...explicitProbeKinds);
  return uniqueStrings(requirements.map((probe) => probe.trim()).filter(Boolean));
}

function surfaceExplicitProbeKinds(
  surface: FrontierFrameworkSurfaceRecord,
  context: SurfaceCoverageContext
): string[] {
  return uniqueStrings([...(context.probesForKinds[surface.kind] ?? []), ...surface.coverage].map((probe) => probe.trim()).filter(Boolean));
}

function resolveSurfaceRequiredProbe(
  surface: FrontierFrameworkSurfaceRecord,
  probeKind: string,
  context: SurfaceCoverageContext
): { covered: boolean; probes: FrontierFrameworkSurfaceCoverageProbe[]; hint: string; command: string } {
  if (probeKind === 'evidence') {
    if (surface.evidence.length > 0) {
      return {
        covered: true,
        probes: surface.evidence.map((artifact) => createCoveredSurfaceProbe(surface, 'evidence', 'surface-evidence', artifact)),
        hint: '',
        command: 'inspect'
      };
    }
    return {
      covered: false,
      probes: [createMissingSurfaceProbe(surface, 'evidence')],
      hint: 'Attach an evidence run path to surfaces.surfaces for ' + surface.id + '.',
      command: 'attach-evidence'
    };
  }
  if (probeKind === 'render') {
    const routeProbe = routeScenarioProbeForSurface(surface, context);
    if (routeProbe || surface.evidence.length > 0) {
      return {
        covered: true,
        probes: [routeProbe ?? createCoveredSurfaceProbe(surface, 'render', 'surface-evidence', surface.evidence[0])],
        hint: '',
        command: 'inspect'
      };
    }
    return {
      covered: false,
      probes: [createMissingSurfaceProbe(surface, 'render')],
      hint: 'Add a route scenario, browser harness case, or evidence link for render coverage of ' + surface.id + '.',
      command: surface.route ? 'add-route-scenario' : 'add-render-evidence'
    };
  }
  if (probeKind === 'state') {
    const stateProbe = stateProbeForSurface(surface, context);
    if ((stateProbe && stateProbe.status === 'covered') || surface.evidence.length > 0) {
      return {
        covered: true,
        probes: [stateProbe ?? createCoveredSurfaceProbe(surface, 'state', 'surface-evidence', surface.evidence[0])],
        hint: '',
        command: 'inspect'
      };
    }
    return {
      covered: false,
      probes: [stateProbe ?? createMissingSurfaceProbe(surface, 'state')],
      hint: 'Declare a state path probe through routeScenarios.expected.statePaths or attach state evidence for ' + surface.id + '.',
      command: 'add-state-probe'
    };
  }
  if (surface.evidence.length > 0) {
    return {
      covered: true,
      probes: [createCoveredSurfaceProbe(surface, probeKind, 'surface-evidence', surface.evidence[0])],
      hint: '',
      command: 'inspect'
    };
  }
  return {
    covered: false,
    probes: [createMissingSurfaceProbe(surface, probeKind)],
    hint: 'Attach evidence for required "' + probeKind + '" coverage on ' + surface.id + '.',
    command: 'attach-' + probeKind + '-evidence'
  };
}

function createSurfaceProbePlan(
  surface: FrontierFrameworkSurfaceRecord,
  kind: FrontierFrameworkSurfaceCoverageProbeKind,
  probes: readonly FrontierFrameworkSurfaceCoverageProbe[],
  reason: string,
  command: string
): FrontierFrameworkSurfaceCoverageProbePlan {
  const planned = probes.find((probe) => probe.status === 'planned');
  const probe = planned ?? probes[0];
  return {
    id: surface.id + ':' + kind + ':next',
    surfaceId: surface.id,
    kind,
    status: planned ? 'planned' : 'missing',
    command,
    reason,
    route: probe?.route ?? surface.route,
    artifact: probe?.artifact,
    statePath: probe?.statePath,
    tags: uniqueStrings(['surface-coverage', 'next-probe', kind, command, surface.kind, surface.status])
  };
}

function createPlannedSurfaceProbe(
  surface: FrontierFrameworkSurfaceRecord,
  kind: FrontierFrameworkSurfaceCoverageProbeKind,
  detail: string
): FrontierFrameworkSurfaceCoverageProbe {
  return {
    id: surface.id + ':' + kind,
    kind,
    status: 'planned',
    source: 'generated-plan',
    route: surface.route,
    tags: ['surface-coverage', 'planned', surface.kind, surface.status, detail]
  };
}

function createCoveredSurfaceProbe(
  surface: FrontierFrameworkSurfaceRecord,
  kind: FrontierFrameworkSurfaceCoverageProbeKind,
  source: FrontierFrameworkSurfaceCoverageProbe['source'],
  artifact?: string
): FrontierFrameworkSurfaceCoverageProbe {
  return {
    id: surface.id + ':' + kind,
    kind,
    status: 'covered',
    source,
    route: surface.route,
    artifact,
    tags: ['surface-coverage', 'covered', surface.kind, surface.status]
  };
}

function createMissingSurfaceProbe(
  surface: FrontierFrameworkSurfaceRecord,
  kind: FrontierFrameworkSurfaceCoverageProbeKind
): FrontierFrameworkSurfaceCoverageProbe {
  return {
    id: surface.id + ':' + kind,
    kind,
    status: 'missing',
    source: 'none',
    route: surface.route,
    tags: ['surface-coverage', 'missing', surface.kind, surface.status]
  };
}

function routeScenarioProbeForSurface(
  surface: FrontierFrameworkSurfaceRecord,
  context: SurfaceCoverageContext
): FrontierFrameworkSurfaceCoverageProbe | undefined {
  if (!surface.route) return undefined;
  const route = ensureLeadingSlash(surface.route);
  const scenario = context.routeScenarios.scenarios.find((item) => routeCoverageMatches(item.route, route) || routeCoverageMatches(item.path, route));
  const testCase = context.routeScenarioPlaywright.cases.find((item) => routeCoverageMatches(item.route, route) || routeCoverageMatches(item.path, route));
  if (!scenario && !testCase) return undefined;
  return {
    id: surface.id + ':render',
    kind: 'render',
    status: 'covered',
    source: 'route-scenario',
    route,
    artifact: context.reportFile,
    tags: ['surface-coverage', 'covered', 'render', scenario?.id ?? testCase?.id ?? route]
  };
}

function stateProbeForSurface(
  surface: FrontierFrameworkSurfaceRecord,
  context: SurfaceCoverageContext
): FrontierFrameworkSurfaceCoverageProbe | undefined {
  const statePaths = surface.dependsOn.filter((item) => item.startsWith('/'));
  for (const scenario of context.routeScenarios.scenarios) {
    const matchedPath = scenario.expected.statePaths.find((path) => statePaths.includes(path));
    if (matchedPath) {
      return {
        id: surface.id + ':state',
        kind: 'state',
        status: 'covered',
        source: 'route-scenario',
        route: surface.route,
        statePath: matchedPath,
        artifact: context.reportFile,
        tags: ['surface-coverage', 'covered', 'state', scenario.id]
      };
    }
  }
  if (statePaths.length > 0) {
    return {
      id: surface.id + ':state',
      kind: 'state',
      status: 'planned',
      source: 'state-path',
      route: surface.route,
      statePath: statePaths[0],
      tags: ['surface-coverage', 'planned', 'state']
    };
  }
  return undefined;
}

function routeCoverageMatches(candidate: string, route: string): boolean {
  const normalized = ensureLeadingSlash(candidate);
  return normalized === route || normalized.replace(/\/:[^/]+[*]?/g, '/:param') === route.replace(/\/:[^/]+[*]?/g, '/:param');
}

function createSurfaceCoverageSummary(
  records: readonly FrontierFrameworkSurfaceCoverageRecord[]
): FrontierFrameworkSurfaceCoverageReport['summary'] {
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

function createSurfaceCoverageDashboard(
  records: readonly FrontierFrameworkSurfaceCoverageRecord[]
): FrontierFrameworkSurfaceCoverageReport['dashboard'] {
  const byKind: FrontierFrameworkSurfaceCoverageReport['dashboard']['byKind'] = {};
  const byStatus: FrontierFrameworkSurfaceCoverageReport['dashboard']['byStatus'] = {};
  const byProbe: FrontierFrameworkSurfaceCoverageReport['dashboard']['byProbe'] = {};
  const byContract: FrontierFrameworkSurfaceCoverageReport['dashboard']['byContract'] = {};
  const routeBuckets = new Map<string, { route: string; total: number; ok: number; missing: number; surfaces: string[] }>();
  for (const record of records) {
    updateSurfaceCoverageBucket(byKind, record.surface.kind, record);
    updateSurfaceCoverageBucket(byStatus, record.surface.status, record);
    for (const probe of record.probes) updateSurfaceProbeBucket(byProbe, probe, record.surface.id);
    for (const proof of record.contractProofs) updateSurfaceContractBucket(byContract, proof, record.surface.id);
    if (record.surface.route) {
      const route = ensureLeadingSlash(record.surface.route);
      const bucket = routeBuckets.get(route) ?? { route, total: 0, ok: 0, missing: 0, surfaces: [] };
      bucket.total += 1;
      if (record.ok) bucket.ok += 1;
      else bucket.missing += 1;
      bucket.surfaces.push(record.surface.id);
      routeBuckets.set(route, bucket);
    }
  }
  return {
    byKind,
    byStatus,
    byRoute: Array.from(routeBuckets.values()).sort((left, right) => left.route.localeCompare(right.route)),
    byProbe,
    byContract
  };
}

function updateSurfaceCoverageBucket(
  buckets: Record<string, { total: number; ok: number; missing: number; evidenceLinked: number }>,
  key: string,
  record: FrontierFrameworkSurfaceCoverageRecord
): void {
  const bucket = buckets[key] ?? { total: 0, ok: 0, missing: 0, evidenceLinked: 0 };
  bucket.total += 1;
  if (record.ok) bucket.ok += 1;
  else bucket.missing += 1;
  if (record.surface.evidence.length > 0) bucket.evidenceLinked += 1;
  buckets[key] = bucket;
}

function updateSurfaceProbeBucket(
  buckets: Record<string, { total: number; covered: number; missing: number; planned: number; surfaces: string[] }>,
  probe: FrontierFrameworkSurfaceCoverageProbe,
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

function updateSurfaceContractBucket(
  buckets: Record<string, { total: number; passed: number; failed: number; missing: number; planned: number; surfaces: string[] }>,
  proof: FrontierFrameworkSurfaceContractProof,
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

function createAgentLoopReportFromInputs(
  config: NormalizedFrontierFrameworkConfig,
  registry: FrontierFrameworkSurfaceRegistry,
  coverage: FrontierFrameworkSurfaceCoverageReport,
  query: FrontierFrameworkSurfaceStatusQuery = {}
): FrontierFrameworkAgentLoopReport {
  const normalizedQuery = normalizeSurfaceStatusQuery(query);
  const status = createSurfaceStatusReportFromRegistry(registry, normalizedQuery);
  const matchedIds = new Set(status.surfaces.map((surface) => surface.id));
  const records = coverage.records.filter((record) => matchedIds.has(record.surface.id));
  const missing = records.filter((record) => !record.ok).map(createAgentLoopSurface);
  const next = records
    .filter((record) => !record.ok || record.probes.some((probe) => probe.status === 'planned'))
    .map(createAgentLoopSurface)
    .sort(agentLoopSurfaceSort)
    .slice(0, 12);
  const workQueue = createAgentLoopWorkQueue(records);
  const focusKinds = config.surfaces.coverage.focusKinds;
  return {
    kind: 'frontier.framework.agent-loop.report',
    version: 1,
    appId: config.id,
    generatedAt: new Date().toISOString(),
    ok: missing.length === 0 && coverage.ok,
    strict: config.surfaces.coverage.failOnMissing,
    query: normalizedQuery,
    focusKinds,
    status,
    coverage,
    dashboard: {
      byKind: coverage.dashboard.byKind,
      byStatus: coverage.dashboard.byStatus,
      byRoute: coverage.dashboard.byRoute,
      focus: createAgentLoopFocusDashboard(records, focusKinds)
    },
    next,
    missing,
    workQueue,
    commands: createAgentLoopCommands(config),
    artifacts: {
      registry: config.surfaces.registryFile,
      coverage: config.surfaces.coverage.reportFile,
      dashboard: config.surfaces.coverage.dashboardFile,
      loop: config.agent.generatedDir + '/surface-loop.json',
      loopDashboard: config.agent.generatedDir + '/surface-loop.md'
    },
    summary: {
      matchedSurfaces: status.summary.matchCount,
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

function createAgentLoopSurface(record: FrontierFrameworkSurfaceCoverageRecord): FrontierFrameworkAgentLoopSurface {
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

function agentLoopSurfaceSort(left: FrontierFrameworkAgentLoopSurface, right: FrontierFrameworkAgentLoopSurface): number {
  if (left.ok !== right.ok) return left.ok ? 1 : -1;
  if (left.route && !right.route) return -1;
  if (!left.route && right.route) return 1;
  return left.id.localeCompare(right.id);
}

function agentLoopNextCommand(record: FrontierFrameworkSurfaceCoverageRecord): string {
  if (record.nextProbes[0]) return record.nextProbes[0].command;
  if (record.missing.includes('evidence')) return 'attach-evidence';
  if (record.missing.includes('render')) return record.surface.route ? 'add-route-scenario' : 'add-render-evidence';
  if (record.missing.includes('state')) return 'add-state-probe';
  if (record.missing.length > 0) return 'attach-' + record.missing[0] + '-evidence';
  if (record.probes.some((probe) => probe.status === 'planned')) return 'complete-planned-probe';
  return 'inspect';
}

function createAgentLoopWorkQueue(
  records: readonly FrontierFrameworkSurfaceCoverageRecord[]
): FrontierFrameworkAgentLoopWorkItem[] {
  const work: FrontierFrameworkAgentLoopWorkItem[] = [];
  for (const record of records) {
    const plannedKinds = new Set(record.nextProbes.map((probe) => probe.kind));
    for (const probe of record.nextProbes) work.push(createAgentLoopProbeWork(record, probe, work.length));
    for (const probe of record.probes) {
      if (probe.status !== 'planned' || plannedKinds.has(probe.kind)) continue;
      work.push(createAgentLoopPlannedWork(record, probe, work.length));
    }
    if (!record.ok && record.nextProbes.length === 0) work.push(createAgentLoopInspectionWork(record, work.length));
  }
  return work.sort(agentLoopWorkSort).map((item, index) => ({ ...item, priority: index + 1 }));
}

function createAgentLoopProbeWork(
  record: FrontierFrameworkSurfaceCoverageRecord,
  probe: FrontierFrameworkSurfaceCoverageProbePlan,
  index: number
): FrontierFrameworkAgentLoopWorkItem {
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
    artifacts: agentLoopProbeArtifacts(record, probe),
    acceptance: agentLoopProbeAcceptance(record, probe),
    tags: uniqueStrings(['agent-loop', 'work-queue', ...probe.tags, record.surface.kind, record.surface.status])
  };
}

function createAgentLoopPlannedWork(
  record: FrontierFrameworkSurfaceCoverageRecord,
  probe: FrontierFrameworkSurfaceCoverageProbe,
  index: number
): FrontierFrameworkAgentLoopWorkItem {
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

function createAgentLoopInspectionWork(
  record: FrontierFrameworkSurfaceCoverageRecord,
  index: number
): FrontierFrameworkAgentLoopWorkItem {
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

function agentLoopProbeArtifacts(
  record: FrontierFrameworkSurfaceCoverageRecord,
  probe: FrontierFrameworkSurfaceCoverageProbePlan
): string[] {
  return uniqueStrings([probe.artifact, ...record.surface.evidence].filter((item): item is string => Boolean(item)));
}

function agentLoopProbeAcceptance(
  record: FrontierFrameworkSurfaceCoverageRecord,
  probe: FrontierFrameworkSurfaceCoverageProbePlan
): string[] {
  const acceptance = [
    'Surface ' + record.surface.id + ' covers ' + probe.kind + '.',
    'Rerun frontier loop --json after updating the surface or evidence.'
  ];
  if (probe.route) acceptance.push('Route ' + probe.route + ' has render/state/evidence coverage when that probe is required.');
  if (probe.statePath) acceptance.push('State path ' + probe.statePath + ' is covered by a scenario or evidence artifact.');
  return acceptance;
}

function agentLoopWorkSort(left: FrontierFrameworkAgentLoopWorkItem, right: FrontierFrameworkAgentLoopWorkItem): number {
  if (left.required !== right.required) return left.required ? -1 : 1;
  const leftCommand = agentLoopCommandPriority(left.command);
  const rightCommand = agentLoopCommandPriority(right.command);
  if (leftCommand !== rightCommand) return leftCommand - rightCommand;
  const leftKind = agentLoopSurfaceKindPriority(left.surfaceKind);
  const rightKind = agentLoopSurfaceKindPriority(right.surfaceKind);
  if (leftKind !== rightKind) return leftKind - rightKind;
  if (left.route && !right.route) return -1;
  if (!left.route && right.route) return 1;
  return left.id.localeCompare(right.id);
}

function agentLoopCommandPriority(command: string): number {
  if (command === 'add-route-scenario') return 10;
  if (command === 'add-render-evidence') return 20;
  if (command === 'add-state-probe') return 30;
  if (command.startsWith('attach-') && command.endsWith('-evidence')) return 40;
  if (command === 'attach-evidence') return 50;
  if (command === 'refresh-evidence') return 60;
  if (command === 'complete-planned-probe') return 80;
  return 90;
}

function agentLoopSurfaceKindPriority(kind: string): number {
  if (kind === 'route') return 10;
  if (kind === 'page') return 20;
  if (kind === 'action') return 30;
  if (kind === 'filter') return 40;
  if (kind === 'feature') return 50;
  return 90;
}

function createAgentLoopFocusDashboard(
  records: readonly FrontierFrameworkSurfaceCoverageRecord[],
  focusKinds: readonly string[]
): FrontierFrameworkAgentLoopReport['dashboard']['focus'] {
  const dashboard: FrontierFrameworkAgentLoopReport['dashboard']['focus'] = {};
  for (const kind of focusKinds) dashboard[kind] = { total: 0, ok: 0, missing: 0, next: [] };
  for (const record of records) {
    if (!focusKinds.includes(record.surface.kind)) continue;
    const bucket = dashboard[record.surface.kind] ?? { total: 0, ok: 0, missing: 0, next: [] };
    bucket.total += 1;
    if (record.ok) bucket.ok += 1;
    else {
      bucket.missing += 1;
      bucket.next.push(record.surface.id);
    }
    dashboard[record.surface.kind] = bucket;
  }
  return dashboard;
}

function createAgentLoopCommands(
  config: NormalizedFrontierFrameworkConfig
): FrontierFrameworkAgentLoopReport['commands'] {
  return [
    {
      id: 'declare-surfaces',
      command: 'frontier surfaces --json',
      required: true,
      produces: [config.surfaces.registryFile],
      tags: ['surfaces', 'status']
    },
    {
      id: 'check-coverage',
      command: 'frontier coverage --strict --json',
      required: config.surfaces.coverage.failOnMissing,
      produces: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile],
      tags: ['surfaces', 'coverage', 'strict']
    },
    {
      id: 'agent-loop',
      command: 'frontier loop --json',
      required: true,
      produces: [config.agent.generatedDir + '/surface-loop.json', config.agent.generatedDir + '/surface-loop.md'],
      tags: ['agent', 'loop', 'dashboard']
    }
  ];
}

function createAgentPlan(config: NormalizedFrontierFrameworkConfig): FrontierFrameworkAgentPlan {
  const capabilities: FrontierFrameworkAgentCapability[] = [
    {
      id: 'agent.orient',
      title: 'Read config, app graph, package stack, routes, transports, and deploy targets',
      command: 'frontier inspect --json',
      reads: ['frontier.config.mjs', config.frontend.evidenceDir],
      writes: [],
      requires: ['config'],
      produces: ['application-graph', 'manifest-proof'],
      tags: ['agent', 'orient']
    },
    {
      id: 'agent.build',
      title: 'Build deployable frontend/backend artifacts and Frontier evidence',
      command: 'frontier build --json',
      reads: ['frontier.config.mjs', config.frontend.root, config.backend.root],
      writes: [config.frontend.outDir, config.backend.outDir, config.frontend.evidenceDir, config.componentPreview.outDir, config.documentation.outDir],
      requires: ['feature-manifest'],
      produces: ['frontend-artifact', 'backend-artifact', 'evidence', 'component-preview', 'documentation'],
      tags: ['agent', 'build', 'vite', 'component-preview', 'documentation']
    },
    {
      id: 'agent.documentation',
      title: 'Inspect generated documentation sources, search records, and proof evidence',
      command: 'frontier docs --json',
      reads: ['frontier.config.mjs', ...config.documentation.include],
      writes: [config.documentation.outDir, config.frontend.evidenceDir + '/documentation.json'],
      requires: ['feature-manifest'],
      produces: ['documentation-book', 'documentation-evidence', 'documentation-jsonl'],
      tags: ['agent', 'documentation', config.documentation.enabled ? 'enabled' : 'disabled']
    },
    {
      id: 'agent.surface-coverage',
      title: 'Check claimed surface render, state, and evidence coverage before picking the next task',
      command: 'frontier coverage --strict --json',
      reads: ['frontier.config.mjs', config.surfaces.registryFile, config.routeScenarios.manifestFile],
      writes: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile],
      requires: ['evidence'],
      produces: ['surface-coverage-report', 'surface-coverage-dashboard'],
      tags: ['agent', 'surfaces', 'coverage', config.surfaces.coverage.enabled ? 'enabled' : 'disabled']
    },
    {
      id: 'agent.loop',
      title: 'Read the next route, page, filter, or action surface with missing evidence',
      command: 'frontier loop --json',
      reads: ['frontier.config.mjs', config.surfaces.registryFile, config.surfaces.coverage.reportFile],
      writes: [config.agent.generatedDir + '/surface-loop.json', config.agent.generatedDir + '/surface-loop.md'],
      requires: ['surface-coverage-report'],
      produces: ['agent-loop-report', 'agent-loop-dashboard'],
      tags: ['agent', 'surfaces', 'coverage', 'next-task']
    },
    {
      id: 'agent.harness',
      title: 'Validate tests, fuzzers, benchmarks, browser probes, linter, and hybrid gates',
      command: 'frontier harness --json',
      reads: ['frontier.config.mjs', config.agent.manifestDir + '/*.json'],
      writes: [config.harness.evidenceDir, config.harness.generatedDir],
      requires: ['evidence'],
      produces: ['harness-validation', 'generated-harness'],
      tags: ['agent', 'harness', config.harness.mode]
    },
    {
      id: 'agent.fuzz',
      title: 'Run deterministic generated route/transport fuzzing with replayable failures',
      command: 'npm run fuzz',
      reads: [config.harness.generatedDir, config.harness.corpusDir],
      writes: [config.harness.evidenceDir],
      requires: ['generated-harness'],
      produces: ['fuzz-summary'],
      tags: ['agent', 'fuzz']
    },
    {
      id: 'agent.bench',
      title: 'Run lightweight generated framework benchmark evidence',
      command: 'npm run bench',
      reads: [config.harness.generatedDir],
      writes: [config.harness.evidenceDir],
      requires: ['generated-harness'],
      produces: ['benchmark-summary'],
      tags: ['agent', 'benchmark']
    },
    {
      id: 'agent.browser',
      title: 'Record browser/Playwright trace readiness and devtools probe support',
      command: 'node ' + config.harness.generatedDir + '/frontier-browser-smoke.mjs',
      reads: [config.frontend.outDir, config.devtools.scriptPath],
      writes: [config.harness.evidenceDir],
      requires: ['frontend-artifact'],
      produces: ['browser-harness'],
      tags: ['agent', 'browser', 'devtools']
    },
    {
      id: 'agent.mcp-tools',
      title: 'Export MCP-compatible tool descriptors from Frontier tools',
      command: 'frontier agent --json',
      reads: [config.frontend.evidenceDir + '/tools.json', config.agent.generatedDir + '/tool-manifest.json'],
      writes: [config.agent.generatedDir + '/mcp-tools.json'],
      requires: ['application-graph'],
      produces: ['mcp-tool-descriptors'],
      tags: ['agent', 'mcp', 'tools']
    },
    {
      id: 'agent.ci-gates',
      title: 'Export CI-ready evidence gates from the project graph',
      command: 'frontier agent --json',
      reads: [config.frontend.evidenceDir, config.harness.evidenceDir],
      writes: [config.agent.generatedDir + '/ci-evidence-gates.json'],
      requires: ['harness-validation'],
      produces: ['ci-evidence-gates'],
      tags: ['agent', 'ci', 'evidence']
    },
    {
      id: 'agent.sarif',
      title: 'Export Frontier linter report and SARIF for agent diagnostics',
      command: 'frontier agent --json',
      reads: [config.frontend.evidenceDir, config.harness.evidenceDir, config.agent.generatedDir + '/ci-evidence-gates.json'],
      writes: [config.agent.generatedDir + '/frontier-agent-lint.json', config.agent.generatedDir + '/frontier-agent-lint.sarif'],
      requires: ['agent-readiness'],
      produces: ['frontier-linter-report', 'sarif-output'],
      tags: ['agent', 'lint', 'sarif']
    },
    {
      id: 'agent.replay',
      title: 'Replay generated CI evidence gates for another agent or CI job',
      command: 'node ' + config.agent.generatedDir + '/frontier-agent-replay.mjs --required-only',
      reads: [config.agent.generatedDir + '/ci-evidence-gates.json', config.frontend.evidenceDir, config.harness.evidenceDir],
      writes: [config.agent.runsDir, config.agent.generatedDir + '/agent-replay.json'],
      requires: ['agent-readiness'],
      produces: ['agent-replay-record'],
      tags: ['agent', 'replay', 'ci', 'evidence']
    },
    {
      id: 'agent.issue-handoff',
      title: 'Prepare an issue-ready handoff bundle from evidence gates',
      command: 'frontier agent --json',
      reads: [config.agent.generatedDir + '/ci-evidence-gates.json', config.agent.generatedDir + '/frontier-agent-lint.sarif'],
      writes: [config.agent.generatedDir + '/ISSUE-HANDOFF.md'],
      requires: ['agent-readiness'],
      produces: ['issue-handoff'],
      tags: ['agent', 'issue', 'handoff']
    },
    {
      id: 'agent.pr-handoff',
      title: 'Prepare a PR-ready handoff bundle from evidence gates',
      command: 'frontier agent --json',
      reads: [config.agent.generatedDir + '/ci-evidence-gates.json', config.agent.generatedDir + '/frontier-agent-lint.sarif'],
      writes: [config.agent.generatedDir + '/PR-HANDOFF.md'],
      requires: ['agent-readiness'],
      produces: ['pr-handoff'],
      tags: ['agent', 'pr', 'handoff']
    },
    {
      id: 'agent.handoff',
      title: 'Generate an agent handoff with evidence, gates, and open-question policy',
      command: 'frontier agent --json',
      reads: [config.frontend.evidenceDir, config.harness.evidenceDir],
      writes: [config.agent.generatedDir, config.agent.handoffFile],
      requires: ['harness-validation'],
      produces: ['agent-readiness', 'handoff'],
      tags: ['agent', 'handoff', config.agent.handoffMode],
      metadata: {
        maxOpenQuestions: config.agent.maxOpenQuestions,
        requireProof: config.agent.requireProof,
        requireCleanScope: config.agent.requireCleanScope
      }
    }
  ];
  return {
    kind: 'frontier.framework.agent.plan',
    appId: config.id,
    enabled: config.agent.enabled,
    generatedDir: config.agent.generatedDir,
    manifestDir: config.agent.manifestDir,
    runsDir: config.agent.runsDir,
    runbookFile: config.agent.runbookFile,
    handoffFile: config.agent.handoffFile,
    handoffMode: config.agent.handoffMode,
    requirements: {
      featureManifest: config.agent.requireFeatureManifest,
      evidence: config.agent.requireEvidence,
      harness: config.agent.requireHarness,
      proof: config.agent.requireProof,
      cleanScope: config.agent.requireCleanScope,
      maxOpenQuestions: config.agent.maxOpenQuestions
    },
    capabilities,
    checkpoints: config.agent.checkpoints
  };
}

function createManifestEntries(
  config: NormalizedFrontierFrameworkConfig,
  agent: FrontierFrameworkAgentPlan
): FrontierManifestEntryInput[] {
  const entries: FrontierManifestEntryInput[] = [];
  const authManifest = createAuthManifestFromConfig(config);
  const authRegistry = createAuthRegistryGraph(authManifest);
  for (const pkg of config.packages) {
    entries.push({
      id: 'package:' + pkg.name,
      kind: 'package',
      name: pkg.name,
      package: pkg.name,
      tags: pkg.tags,
      metadata: { purpose: pkg.purpose, optional: pkg.optional === true }
    });
  }
  for (const feature of config.features) {
    entries.push({
      id: 'feature:' + feature.id,
      kind: 'feature',
      name: feature.title ?? feature.id,
      feature: feature.id,
      owner: feature.owner,
      routes: feature.routes,
      actions: feature.actions,
      states: feature.state,
      tags: feature.tags,
      metadata: feature.metadata
    });
  }
  for (const route of config.frontend.routes) {
    entries.push({
      id: route.id ?? 'route:' + route.path,
      kind: 'route',
      name: route.title ?? route.path,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      feature: route.feature,
      owner: route.owner,
      files: [route.file],
      routes: [route.path],
      reads: route.reads,
      writes: route.writes,
      tags: ['frontend', ...(route.tags ?? [])],
      metadata: route.metadata
    });
  }
  if (config.routeScenarios.enabled) {
    entries.push({
      id: 'route-scenarios:manifest',
      kind: 'test-plan',
      name: 'Route scenario manifest',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      files: [config.routeScenarios.manifestFile, config.routeScenarios.playwrightPlanFile],
      tags: ['route-scenario', 'browser', 'playwright'],
      metadata: {
        fixtureCount: config.routeScenarios.fixtures.length,
        scenarioCount: config.routeScenarios.scenarios.length,
        generatedDir: config.routeScenarios.generatedDir
      }
    });
    for (const fixture of config.routeScenarios.fixtures) {
      entries.push({
        id: 'route-scenario-fixture:' + fixture.id,
        kind: 'test-fixture',
        name: fixture.title,
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        files: fixture.files,
        tags: ['route-scenario', 'fixture', fixture.kind, ...fixture.tags],
        metadata: {
          source: fixture.source ?? '',
          data: fixture.data,
          ...fixture.metadata
        }
      });
    }
    for (const scenario of config.routeScenarios.scenarios) {
      entries.push({
        id: 'route-scenario:' + scenario.id,
        kind: 'test',
        name: scenario.title,
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: scenario.feature,
        owner: scenario.owner,
        routes: [scenario.route],
        resources: scenario.fixtures.map((fixture) => 'route-scenario-fixture:' + fixture),
        tags: ['route-scenario', 'browser', ...scenario.tags],
        metadata: {
          path: scenario.path,
          authFixture: scenario.authFixture ?? '',
          sessionFixture: scenario.sessionFixture ?? '',
          stateFixture: scenario.stateFixture ?? '',
          expected: scenario.expected,
          ...scenario.metadata
        }
      });
    }
  }
  if (config.surfaces.enabled) {
    entries.push({
      id: 'surfaces:status-registry',
      kind: 'evidence',
      name: 'Surface status registry',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      files: [config.surfaces.registryFile],
      tags: ['surfaces', 'status', 'evidence'],
      metadata: {
        surfaceCount: config.surfaces.surfaces.length,
        statusCount: config.surfaces.statuses.length,
        generatedDir: config.surfaces.generatedDir
      }
    });
    entries.push({
      id: 'surfaces:coverage',
      kind: 'evidence',
      name: 'Surface coverage report',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      files: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile],
      tags: ['surfaces', 'coverage', 'evidence', config.surfaces.coverage.enabled ? 'enabled' : 'disabled'],
      metadata: {
        failOnMissing: config.surfaces.coverage.failOnMissing,
        focusKinds: config.surfaces.coverage.focusKinds,
        requiredStatuses: config.surfaces.coverage.requireEvidenceForStatuses,
        renderKinds: config.surfaces.coverage.requireRenderForKinds,
        stateKinds: config.surfaces.coverage.requireStateForKinds,
        requiredProbes: config.surfaces.coverage.requireProbesForKinds
      }
    });
    entries.push({
      id: 'agent:surface-loop',
      kind: 'evidence',
      name: 'Agent surface loop report',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      files: [config.agent.generatedDir + '/surface-loop.json', config.agent.generatedDir + '/surface-loop.md'],
      tags: ['agent', 'surfaces', 'coverage', 'next-task'],
      metadata: {
        focusKinds: config.surfaces.coverage.focusKinds,
        strict: config.surfaces.coverage.failOnMissing
      }
    });
    for (const surface of config.surfaces.surfaces) {
      entries.push({
        id: 'surface:' + surface.id,
        kind: surface.kind,
        name: surface.title,
        package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
        feature: surface.feature,
        owner: surface.owner,
        files: surface.files,
        routes: surface.route ? [surface.route] : [],
        resources: surface.dependsOn,
        tags: ['surface', surface.status, surface.kind, surface.source, ...surface.tags],
        metadata: {
          status: surface.status,
          aliases: surface.aliases,
          evidence: surface.evidence,
          source: surface.source,
          ...surface.metadata
        }
      });
    }
  }
  for (const endpoint of config.backend.endpoints) {
    entries.push({
      id: endpoint.id ?? 'endpoint:' + (endpoint.method ?? 'GET') + ':' + endpoint.path,
      kind: 'route',
      name: endpoint.path,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      feature: endpoint.feature,
      owner: endpoint.owner,
      files: endpoint.file ? [endpoint.file] : [joinAppPath(config.backend.root, config.backend.entry)],
      routes: [endpoint.path],
      reads: endpoint.reads,
      writes: endpoint.writes,
      emits: endpoint.effects,
      tags: ['backend', 'fetch-handler', ...(endpoint.tags ?? [])],
      metadata: { method: endpoint.method ?? 'GET', ...endpoint.metadata }
    });
  }
  for (const transport of config.backend.transports) {
    entries.push({
      id: 'transport:' + transportId(transport),
      kind: 'resource',
      name: transport.kind + ' transport',
      package: transport.package ?? FRONTIER_FRAMEWORK_PACKAGE_NAME,
      feature: transport.feature,
      owner: transport.owner,
      routes: transport.path ? [transport.path] : [],
      reads: transport.reads,
      writes: transport.writes,
      emits: transport.effects,
      resources: [transportResource(transport)],
      tags: ['backend', 'transport', transport.kind, transport.protocol ?? 'custom', ...(transport.tags ?? [])],
      metadata: {
        protocol: transport.protocol ?? inferTransportProtocol(transport.kind),
        adapter: transport.adapter ?? '',
        runtime: transport.runtime ?? '',
        required: transport.required === true,
        ...transport.metadata
      }
    });
  }
  for (const adapter of FRONTIER_FRAMEWORK_RUNTIME_ADAPTER_CATALOG) {
    entries.push({
      id: 'runtime-adapter:' + adapter.id,
      kind: 'resource',
      name: adapter.id,
      package: adapter.package ?? FRONTIER_FRAMEWORK_PACKAGE_NAME,
      produces: adapter.deployTargets,
      tags: ['runtime-adapter', adapter.contract, ...(adapter.tags ?? [])],
      metadata: adapter
    });
  }
  for (const adapter of FRONTIER_FRAMEWORK_SYNC_ADAPTER_CATALOG) {
    entries.push({
      id: 'sync-adapter:' + adapter.id,
      kind: 'resource',
      name: adapter.id,
      package: adapter.package ?? FRONTIER_FRAMEWORK_PACKAGE_NAME,
      resources: [adapter.protocol],
      tags: ['sync-adapter', adapter.contract, ...(adapter.tags ?? [])],
      metadata: adapter
    });
  }
  for (const insight of FRONTIER_FRAMEWORK_RESEARCH_INSIGHTS) {
    entries.push({
      id: 'research:' + insight.id,
      kind: 'resource',
      name: insight.title,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['research', insight.decision, ...(insight.tags ?? [])],
      metadata: insight
    });
  }
  entries.push({
    id: 'build:vite',
    kind: 'resource',
    name: 'Vite build pipeline',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    files: [config.vite.configFile],
    produces: [config.vite.outDir],
    tags: ['build', 'vite', config.vite.enabled ? 'enabled' : 'disabled'],
    metadata: {
      enabled: config.vite.enabled,
      hmr: config.vite.hmr,
      plugin: config.vite.plugin,
      strict: config.vite.strict
    }
  });
  entries.push({
    id: 'build:frontend-cache',
    kind: 'resource',
    name: 'Incremental frontend route cache',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.frontend.cacheDir],
    tags: ['build', 'frontend', 'cache', config.frontend.incremental ? 'enabled' : 'disabled'],
    metadata: {
      enabled: config.frontend.incremental,
      cacheDir: config.frontend.cacheDir
    }
  });
  entries.push({
    id: 'component-preview:book',
    kind: 'resource',
    name: 'Frontier component preview book',
    package: '@shapeshift-labs/frontier-component-preview',
    files: config.componentPreview.include,
    produces: [
      config.componentPreview.outDir + '/' + config.componentPreview.htmlFileName,
      config.componentPreview.outDir + '/' + config.componentPreview.manifestFileName,
      config.componentPreview.outDir + '/proof.json',
      config.frontend.evidenceDir + '/component-preview.json'
    ],
    tags: ['component-preview', 'frontend', config.componentPreview.renderer, config.componentPreview.enabled ? 'enabled' : 'disabled'],
    metadata: config.componentPreview as unknown as JsonObject
  });
  entries.push({
    id: 'documentation:book',
    kind: 'resource',
    name: 'Frontier documentation book',
    package: '@shapeshift-labs/frontier-documentation',
    files: config.documentation.include,
    produces: [
      config.documentation.outDir + '/' + config.documentation.htmlFileName,
      config.documentation.outDir + '/' + config.documentation.manifestFileName,
      config.documentation.outDir + '/' + config.documentation.searchFileName,
      config.documentation.outDir + '/' + config.documentation.jsonlFileName,
      config.documentation.outDir + '/proof.json',
      config.frontend.evidenceDir + '/documentation.json'
    ],
    tags: ['documentation', 'frontend', config.documentation.enabled ? 'enabled' : 'disabled'],
    metadata: config.documentation as unknown as JsonObject
  });
  entries.push({
    id: 'devtools:floating-inspector',
    kind: 'resource',
    name: 'Floating Frontier devtools inspector and structural bridge',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.devtools.scriptPath],
    tags: ['devtools', 'inspect', 'rewind', 'state', 'patches', 'crdt', 'event-log', 'trace', 'telemetry', config.devtools.enabled ? 'enabled' : 'disabled'],
    metadata: config.devtools
  });
  entries.push({
    id: 'telemetry:frontier',
    kind: 'resource',
    name: 'Frontier telemetry and inspection sinks',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: config.telemetry.sinks,
    tags: ['telemetry', 'logging', 'trace', 'inspect'],
    metadata: config.telemetry
  });
  entries.push({
    id: 'auth:manifest',
    kind: 'resource',
    name: 'Frontier auth manifest and evidence',
    package: '@shapeshift-labs/frontier-auth',
    files: ['frontier.config.mjs'],
    produces: [config.auth.manifestFile, config.auth.evidenceFile],
    resources: authManifest.gates.map((gate) => gate.resource),
    tags: ['auth', 'session', 'gates', 'tokens', 'runtime-grants', config.auth.enabled ? 'enabled' : 'disabled', config.auth.strict ? 'strict' : 'optional'],
    metadata: {
      summary: authManifest.summary,
      registryEntries: authRegistry.summary.entries,
      registryEdges: authRegistry.summary.edges,
      lintResources: createAuthLintResources(authManifest).length,
      failOnMissingGate: config.auth.failOnMissingGate
    } as unknown as JsonObject
  });
  for (const gate of authManifest.gates) {
    entries.push({
      id: 'auth-gate:' + gate.id,
      kind: gate.route ? 'route' : 'resource',
      name: gate.id,
      package: '@shapeshift-labs/frontier-auth',
      routes: gate.route ? [gate.route] : [],
      resources: [gate.resource],
      emits: gate.effect ? [gate.effect] : [],
      produces: [config.auth.evidenceFile],
      tags: ['auth', 'gate', gate.required ? 'required' : 'optional', ...(gate.tags ?? [])],
      metadata: {
        required: gate.required,
        profile: gate.profile,
        roles: gate.roles,
        access: gate.access,
        legal: gate.legal,
        status: gate.status
      } as unknown as JsonObject
    });
  }
  entries.push({
    id: 'migrations:runtime-data',
    kind: 'resource',
    name: 'Runtime data-source migration bridge',
    package: '@shapeshift-labs/frontier-migrations',
    files: ['frontier.config.mjs'],
    produces: [config.migrations.evidenceFile, config.migrations.runtimeBridgeFile],
    resources: config.migrations.sources.map((source) => source.source),
    tags: ['migrations', 'runtime', 'state', 'cache', 'crdt', 'event-log', config.migrations.enabled ? 'enabled' : 'disabled'],
    metadata: {
      registryId: config.migrations.registryId,
      currentVersion: config.migrations.currentVersion,
      initialVersion: config.migrations.initialVersion,
      strict: config.migrations.strict,
      failOnMissingVersion: config.migrations.failOnMissingVersion,
      autoMigrateState: config.migrations.autoMigrateState,
      autoMigrateCache: config.migrations.autoMigrateCache,
      sources: config.migrations.sources
    } as unknown as JsonObject
  });
  entries.push({
    id: 'source-policy:structure',
    kind: 'test',
    name: 'Configurable source structure policy',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    files: config.sourcePolicy.include,
    produces: [config.frontend.evidenceDir + '/source-policy.json', config.sourcePolicy.sourceGraphFile, config.sourcePolicy.sourceGraphRegistryFile],
    tags: ['source-policy', 'lint', 'ast-walk', config.sourcePolicy.enabled ? 'enabled' : 'disabled', config.sourcePolicy.enforcement],
    metadata: config.sourcePolicy as unknown as JsonObject
  });
  for (const runtimeModule of config.sourcePolicy.runtimeModules) {
    entries.push({
      id: 'runtime-module:' + runtimeModule.id,
      kind: 'resource',
      name: runtimeModule.title ?? runtimeModule.id,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      owner: runtimeModule.owner,
      files: runtimeModule.files?.length ? runtimeModule.files : runtimeModule.file ? [runtimeModule.file] : [],
      reads: runtimeModule.reads,
      writes: runtimeModule.writes,
      emits: runtimeModule.effects,
      actions: runtimeModule.actions,
      produces: runtimeModule.evidence,
      tags: ['runtime-module', ...(runtimeModule.owns ?? []), ...(runtimeModule.tags ?? [])],
      metadata: {
        kind: runtimeModule.kind,
        owns: runtimeModule.owns,
        bindings: runtimeModule.bindings,
        capabilities: runtimeModule.capabilities,
        evidence: runtimeModule.evidence,
        metadata: runtimeModule.metadata
      } as unknown as JsonObject
    });
  }
  entries.push({
    id: 'source-graph:ast-walk',
    kind: 'resource',
    name: 'Frontier AST source graph and business-logic evidence',
    package: '@shapeshift-labs/frontier-ast-walk',
    files: config.sourcePolicy.include,
    produces: [config.sourcePolicy.sourceGraphFile, config.sourcePolicy.sourceGraphRegistryFile],
    tags: ['source-graph', 'ast-walk', 'imports', 'business-logic', config.sourcePolicy.businessLogic ? 'business-logic-enabled' : 'business-logic-disabled'],
    metadata: {
      frontendRouteRoots: config.sourcePolicy.frontendRouteRoots,
      frontendComponentRoots: config.sourcePolicy.frontendComponentRoots,
      backendHandlerRoots: config.sourcePolicy.backendHandlerRoots,
      domainRoots: config.sourcePolicy.domainRoots
    } as JsonObject
  });
  entries.push({
    id: 'conformance:package-use',
    kind: 'test',
    name: 'Strict Frontier package-use conformance',
    package: '@shapeshift-labs/frontier-linter',
    files: ['frontier.config.mjs', 'package.json', ...config.sourcePolicy.include],
    produces: [config.conformance.reportFile, config.conformance.sarifFile],
    tags: ['conformance', 'lint', 'package-use', config.conformance.enabled ? 'enabled' : 'disabled', config.conformance.enforcement],
    metadata: config.conformance as unknown as JsonObject
  });
  entries.push({
    id: 'config:validation',
    kind: 'test',
    name: 'Schema-backed Frontier framework config validation',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    files: ['frontier.config.mjs'],
    produces: [config.frontend.evidenceDir + '/config-validation.json'],
    tags: ['config', 'schema', 'diagnostics', 'agent'],
    metadata: {
      schema: FRONTIER_FRAMEWORK_CONFIG_SCHEMA_ID,
      explainEntries: FRONTIER_FRAMEWORK_CONFIG_EXPLAIN.length
    }
  });
  entries.push({
    id: 'harness:hybrid',
    kind: 'test',
    name: 'Hybrid Frontier agent harness',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    tests: config.harness.commands.map((command) => command.id),
    produces: [config.harness.evidenceDir],
    tags: ['harness', 'agent', 'evidence', config.harness.mode],
    metadata: {
      mode: config.harness.mode,
      autoRun: config.harness.autoRun,
      failOnMissing: config.harness.failOnMissing
    }
  });
  entries.push({
    id: 'agent:plan',
    kind: 'resource',
    name: 'Agent-first workflow plan',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.agent.generatedDir, config.agent.runbookFile, config.agent.handoffFile, config.agent.generatedDir + '/mcp-tools.json', config.agent.generatedDir + '/ci-evidence-gates.json', config.agent.generatedDir + '/frontier-agent-lint.sarif', config.agent.generatedDir + '/agent-workflow.json', config.agent.generatedDir + '/frontier-agent-replay.mjs'],
    tags: ['agent', 'handoff', 'mcp', 'ci', 'sarif', 'workflow', 'replay', config.agent.handoffMode, config.agent.enabled ? 'enabled' : 'disabled'],
    metadata: agent as unknown as JsonObject
  });
  entries.push({
    id: 'agent:mcp-tools',
    kind: 'tool',
    name: 'MCP-compatible agent tool descriptors',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    files: [config.frontend.evidenceDir + '/tools.json'],
    produces: [config.agent.generatedDir + '/mcp-tools.json', config.agent.generatedDir + '/tool-manifest.json'],
    tags: ['agent', 'mcp', 'tools', 'frontier-tools'],
    metadata: { source: '@shapeshift-labs/frontier-tools' } as JsonObject
  });
  entries.push({
    id: 'agent:ci-gates',
    kind: 'test',
    name: 'CI-ready agent evidence gates',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    tests: ['node ' + config.agent.generatedDir + '/frontier-agent-replay.mjs --dry-run --required-only'],
    produces: [config.agent.generatedDir + '/ci-evidence-gates.json', config.agent.generatedDir + '/frontier-agent-replay.mjs'],
    tags: ['agent', 'ci', 'evidence', 'replay', 'frontier-test'],
    metadata: { source: '@shapeshift-labs/frontier-test' } as JsonObject
  });
  entries.push({
    id: 'agent:lint-sarif',
    kind: 'test',
    name: 'Frontier linter report and SARIF output for agents',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    tests: ['frontier agent --json'],
    produces: [config.agent.generatedDir + '/frontier-agent-lint.json', config.agent.generatedDir + '/frontier-agent-lint.sarif'],
    tags: ['agent', 'lint', 'sarif', 'frontier-linter'],
    metadata: { source: '@shapeshift-labs/frontier-linter' } as JsonObject
  });
  entries.push({
    id: 'agent:workflow',
    kind: 'resource',
    name: 'Frontier workflow manifest for agent evidence replay',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.agent.generatedDir + '/agent-workflow.json', config.agent.generatedDir + '/agent-workflow-proof.json'],
    tags: ['agent', 'workflow', 'frontier-workflow', 'replay'],
    metadata: { source: '@shapeshift-labs/frontier-workflow' } as JsonObject
  });
  entries.push({
    id: 'agent:issue-pr-handoff',
    kind: 'resource',
    name: 'Issue and PR handoff bundles',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.agent.generatedDir + '/ISSUE-HANDOFF.md', config.agent.generatedDir + '/PR-HANDOFF.md'],
    tags: ['agent', 'issue', 'pr', 'handoff'],
    metadata: { generatedFrom: 'frontier.framework.agent.plan' } as JsonObject
  });
  for (const capability of agent.capabilities) {
    entries.push({
      id: 'agent-capability:' + capability.id,
      kind: 'tool',
      name: capability.title,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      files: [...capability.reads],
      produces: [...capability.produces],
      tags: capability.tags,
      metadata: capability as unknown as JsonObject
    });
  }
  for (const checkpoint of agent.checkpoints) {
    entries.push({
      id: 'agent-checkpoint:' + checkpoint.id,
      kind: 'test',
      name: checkpoint.title,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tests: checkpoint.command ? [checkpoint.command] : [],
      produces: checkpoint.artifacts,
      tags: ['agent', 'checkpoint', checkpoint.required ? 'required' : 'optional', ...checkpoint.tags],
      metadata: checkpoint as unknown as JsonObject
    });
  }
  entries.push({
    id: 'deploy:frontend',
    kind: 'resource',
    name: 'Frontend deploy output',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.frontend.outDir],
    tags: ['deploy', 'frontend']
  });
  entries.push({
    id: 'deploy:backend',
    kind: 'resource',
    name: 'Backend deploy output',
    package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
    produces: [config.backend.outDir],
    tags: ['deploy', 'backend']
  });
  return entries;
}

function createManifestTasks(config: NormalizedFrontierFrameworkConfig): FrontierManifestTaskInput[] {
  return [
    {
      id: 'build:frontend',
      command: 'frontier build --target frontend',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      outputs: [config.frontend.outDir, config.vite.outDir],
      cache: true,
      tags: ['frontend', 'build', 'vite']
    },
    {
      id: 'build:vite',
      command: 'vite build --config ' + config.vite.configFile,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: [config.vite.configFile],
      outputs: [config.vite.outDir],
      cache: true,
      tags: ['frontend', 'build', 'vite', config.vite.strict ? 'strict' : 'optional']
    },
    {
      id: 'build:component-preview',
      command: 'frontier build --target evidence',
      package: '@shapeshift-labs/frontier-component-preview',
      inputs: ['frontier.config.mjs', ...config.componentPreview.include],
      outputs: [config.componentPreview.outDir, config.frontend.evidenceDir + '/component-preview.json'],
      cache: true,
      tags: ['component-preview', 'frontend', config.componentPreview.enabled ? 'enabled' : 'disabled']
    },
    {
      id: 'build:documentation',
      command: 'frontier docs build --json',
      package: '@shapeshift-labs/frontier-documentation',
      inputs: ['frontier.config.mjs', ...config.documentation.include],
      outputs: [config.documentation.outDir, config.frontend.evidenceDir + '/documentation.json'],
      cache: true,
      tags: ['documentation', 'frontend', config.documentation.enabled ? 'enabled' : 'disabled']
    },
    {
      id: 'build:backend',
      command: 'frontier build --target backend',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      outputs: [config.backend.outDir],
      cache: true,
      tags: ['backend', 'build', 'transport']
    },
    {
      id: 'inspect:evidence',
      command: 'frontier inspect --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      outputs: [config.frontend.evidenceDir],
      cache: true,
      tags: ['evidence']
    },
    {
      id: 'doctor:framework',
      command: 'frontier doctor --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs', 'package.json', 'features/*.json'],
      cache: false,
      tags: ['doctor', 'diagnostics', 'agent']
    },
    {
      id: 'config:validate',
      command: 'frontier config validate --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs'],
      outputs: [config.frontend.evidenceDir + '/config-validation.json'],
      cache: false,
      tags: ['config', 'schema', 'diagnostics']
    },
    {
      id: 'lint:conformance',
      command: 'frontier lint --json',
      package: '@shapeshift-labs/frontier-linter',
      inputs: ['frontier.config.mjs', 'package.json', ...config.sourcePolicy.include],
      outputs: [config.conformance.reportFile, config.conformance.sarifFile],
      cache: false,
      tags: ['lint', 'conformance', 'package-use', config.conformance.enforcement]
    },
    {
      id: 'auth:inspect',
      command: 'frontier auth --json',
      package: '@shapeshift-labs/frontier-auth',
      inputs: ['frontier.config.mjs'],
      outputs: [config.auth.manifestFile, config.auth.evidenceFile],
      cache: true,
      tags: ['auth', 'session', 'gates', 'tokens', config.auth.strict ? 'strict' : 'optional']
    },
    {
      id: 'migrations:inspect',
      command: 'frontier migrations --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs'],
      outputs: [config.migrations.evidenceFile, config.migrations.runtimeBridgeFile],
      cache: true,
      tags: ['migrations', 'runtime', 'state', config.migrations.strict ? 'strict' : 'optional']
    },
    {
      id: 'harness:hybrid',
      command: 'frontier harness',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs', 'features/*.json'],
      outputs: [config.harness.evidenceDir, config.harness.generatedDir],
      cache: false,
      tags: ['harness', 'agent', config.harness.mode]
    },
    {
      id: 'surfaces:status-registry',
      command: 'frontier build --target evidence',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs', 'features/*.json'],
      outputs: [config.surfaces.registryFile, config.frontend.evidenceDir + '/surfaces.json'],
      cache: true,
      tags: ['surfaces', 'status', config.surfaces.enabled ? 'enabled' : 'disabled']
    },
    {
      id: 'surfaces:coverage',
      command: 'frontier coverage --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs', config.surfaces.registryFile, config.routeScenarios.manifestFile],
      outputs: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile, config.frontend.evidenceDir + '/surface-coverage.json'],
      cache: true,
      tags: ['surfaces', 'coverage', config.surfaces.coverage.enabled ? 'enabled' : 'disabled']
    },
    {
      id: 'agent:surface-loop',
      command: 'frontier loop --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs', config.surfaces.registryFile, config.surfaces.coverage.reportFile],
      outputs: [config.agent.generatedDir + '/surface-loop.json', config.agent.generatedDir + '/surface-loop.md'],
      cache: false,
      tags: ['agent', 'surfaces', 'coverage', 'next-task']
    },
    {
      id: 'agent:bundle',
      command: 'frontier agent --json',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: ['frontier.config.mjs', config.agent.manifestDir + '/*.json', config.frontend.evidenceDir],
      outputs: [config.agent.generatedDir, config.agent.runbookFile, config.agent.handoffFile, config.agent.generatedDir + '/mcp-tools.json', config.agent.generatedDir + '/tool-manifest.json', config.agent.generatedDir + '/ci-evidence-gates.json', config.agent.generatedDir + '/frontier-agent-lint.json', config.agent.generatedDir + '/frontier-agent-lint.sarif', config.agent.generatedDir + '/agent-workflow.json', config.agent.generatedDir + '/agent-workflow-proof.json', config.agent.generatedDir + '/frontier-agent-replay.mjs', config.agent.generatedDir + '/ISSUE-HANDOFF.md', config.agent.generatedDir + '/PR-HANDOFF.md'],
      cache: false,
      tags: ['agent', 'handoff', 'workflow', config.agent.handoffMode]
    },
    {
      id: 'agent:replay',
      command: 'node ' + config.agent.generatedDir + '/frontier-agent-replay.mjs --required-only',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      inputs: [config.agent.generatedDir + '/ci-evidence-gates.json'],
      outputs: [config.agent.generatedDir + '/agent-replay.json', config.agent.runsDir],
      cache: false,
      tags: ['agent', 'replay', 'ci', 'evidence']
    },
    ...config.harness.commands.map((command) => ({
      id: 'harness:' + command.id,
      command: command.command,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      outputs: [config.harness.evidenceDir, config.harness.generatedDir],
      cache: command.kind !== 'browser',
      tags: ['harness', command.kind, ...(command.tags ?? [])],
      metadata: { required: command.required === true, ...command.metadata }
    }))
  ];
}

function createEffectEntries(config: NormalizedFrontierFrameworkConfig) {
  return [
    {
      id: 'effect:build.frontend',
      kind: 'filesystem',
      mode: 'build',
      operation: 'write',
      resource: config.frontend.outDir,
      produces: [config.frontend.outDir, config.vite.outDir, config.devtools.scriptPath],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['frontend', 'build', 'vite', 'devtools']
    },
    {
      id: 'effect:build.vite',
      kind: 'build',
      mode: 'build',
      operation: 'bundle',
      resource: config.vite.configFile,
      produces: [config.vite.outDir],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['frontend', 'vite', config.vite.strict ? 'strict' : 'optional'],
      metadata: config.vite as unknown as JsonValue
    },
    {
      id: 'effect:build.frontend-cache',
      kind: 'build',
      mode: 'build',
      operation: 'cache',
      resource: config.frontend.cacheDir,
      produces: [config.frontend.cacheDir],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['frontend', 'build', 'cache', config.frontend.incremental ? 'enabled' : 'disabled'],
      metadata: {
        enabled: config.frontend.incremental,
        cacheDir: config.frontend.cacheDir
      } as JsonValue
    },
    {
      id: 'effect:component-preview.generate',
      kind: 'build',
      mode: 'build',
      operation: 'component-preview',
      resource: config.componentPreview.outDir,
      produces: [config.componentPreview.outDir, config.frontend.evidenceDir + '/component-preview.json'],
      package: '@shapeshift-labs/frontier-component-preview',
      tags: ['component-preview', 'frontend', config.componentPreview.enabled ? 'enabled' : 'disabled'],
      metadata: config.componentPreview as unknown as JsonValue
    },
    {
      id: 'effect:documentation.generate',
      kind: 'build',
      mode: 'build',
      operation: 'documentation',
      resource: config.documentation.outDir,
      produces: [config.documentation.outDir, config.frontend.evidenceDir + '/documentation.json'],
      package: '@shapeshift-labs/frontier-documentation',
      tags: ['documentation', 'frontend', config.documentation.enabled ? 'enabled' : 'disabled'],
      metadata: config.documentation as unknown as JsonValue
    },
    {
      id: 'effect:route-scenario.plan',
      kind: 'test-plan',
      mode: 'build',
      operation: 'route-scenarios',
      resource: config.routeScenarios.manifestFile,
      produces: [config.routeScenarios.manifestFile, config.routeScenarios.playwrightPlanFile],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['route-scenario', 'browser', config.routeScenarios.enabled ? 'enabled' : 'disabled'],
      metadata: {
        fixtureCount: config.routeScenarios.fixtures.length,
        scenarioCount: config.routeScenarios.scenarios.length,
        generatedDir: config.routeScenarios.generatedDir
      } as JsonValue
    },
    {
      id: 'effect:surface-status.plan',
      kind: 'evidence',
      mode: 'build',
      operation: 'surfaces',
      resource: config.surfaces.registryFile,
      produces: [config.surfaces.registryFile, config.frontend.evidenceDir + '/surfaces.json'],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['surfaces', 'status', config.surfaces.enabled ? 'enabled' : 'disabled'],
      metadata: {
        surfaceCount: config.surfaces.surfaces.length,
        statusCount: config.surfaces.statuses.length,
        generatedDir: config.surfaces.generatedDir
      } as JsonValue
    },
    {
      id: 'effect:surface-coverage.plan',
      kind: 'evidence',
      mode: 'build',
      operation: 'surface-coverage',
      resource: config.surfaces.coverage.reportFile,
      produces: [config.surfaces.coverage.reportFile, config.surfaces.coverage.dashboardFile, config.frontend.evidenceDir + '/surface-coverage.json'],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['surfaces', 'coverage', config.surfaces.coverage.enabled ? 'enabled' : 'disabled'],
      metadata: {
        failOnMissing: config.surfaces.coverage.failOnMissing,
        requiredStatuses: config.surfaces.coverage.requireEvidenceForStatuses,
        renderKinds: config.surfaces.coverage.requireRenderForKinds,
        stateKinds: config.surfaces.coverage.requireStateForKinds
      } as JsonValue
    },
    {
      id: 'effect:build.backend',
      kind: 'filesystem',
      mode: 'build',
      operation: 'write',
      resource: config.backend.outDir,
      produces: [config.backend.outDir],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['backend', 'build']
    },
    ...config.backend.transports.map((transport) => ({
      id: 'effect:transport.' + transportId(transport),
      kind: 'transport',
      mode: 'runtime',
      operation: transport.kind,
      resource: transportResource(transport),
      package: transport.package ?? FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['backend', 'transport', transport.kind, transport.protocol ?? 'custom', ...(transport.tags ?? [])],
      metadata: {
        protocol: transport.protocol,
        adapter: transport.adapter,
        runtime: transport.runtime,
        required: transport.required === true
      } as JsonValue
    })),
    {
      id: 'effect:devtools.overlay',
      kind: 'devtools',
      mode: 'dev',
      operation: 'inspect-rewind-timeline',
      resource: config.devtools.scriptPath,
      produces: [config.devtools.scriptPath],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['devtools', 'inspect', 'rewind', 'state', 'patches', 'crdt', 'event-log', 'trace', 'telemetry', config.devtools.enabled ? 'enabled' : 'disabled'],
      metadata: config.devtools as unknown as JsonValue
    },
    {
      id: 'effect:harness.hybrid',
      kind: 'harness',
      mode: config.harness.mode,
      operation: 'validate',
      resource: config.harness.evidenceDir,
      produces: [config.harness.evidenceDir, config.harness.generatedDir, config.harness.corpusDir],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['harness', 'agent', 'evidence', config.harness.mode],
      metadata: {
        autoRun: config.harness.autoRun,
        failOnMissing: config.harness.failOnMissing,
        generatedDir: config.harness.generatedDir,
        corpusDir: config.harness.corpusDir,
        replayFailures: config.harness.replayFailures,
        minimizeCorpus: config.harness.minimizeCorpus,
        browserTrace: config.harness.browserTrace
      } as JsonValue
    },
    {
      id: 'effect:agent.bundle',
      kind: 'agent',
      mode: config.agent.handoffMode,
      operation: 'plan-handoff-tools-gates-workflow-replay',
      resource: config.agent.generatedDir,
      produces: [config.agent.generatedDir, config.agent.runbookFile, config.agent.handoffFile, config.agent.generatedDir + '/mcp-tools.json', config.agent.generatedDir + '/tool-manifest.json', config.agent.generatedDir + '/ci-evidence-gates.json', config.agent.generatedDir + '/frontier-agent-lint.json', config.agent.generatedDir + '/frontier-agent-lint.sarif', config.agent.generatedDir + '/agent-workflow.json', config.agent.generatedDir + '/agent-workflow-proof.json', config.agent.generatedDir + '/frontier-agent-replay.mjs', config.agent.generatedDir + '/ISSUE-HANDOFF.md', config.agent.generatedDir + '/PR-HANDOFF.md'],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['agent', 'handoff', 'mcp', 'ci', 'sarif', 'workflow', 'replay', config.agent.enabled ? 'enabled' : 'disabled'],
      metadata: {
        manifestDir: config.agent.manifestDir,
        runsDir: config.agent.runsDir,
        requireFeatureManifest: config.agent.requireFeatureManifest,
        requireEvidence: config.agent.requireEvidence,
        requireHarness: config.agent.requireHarness,
        requireProof: config.agent.requireProof,
        requireCleanScope: config.agent.requireCleanScope,
        maxOpenQuestions: config.agent.maxOpenQuestions
      } as JsonValue
    },
    {
      id: 'effect:doctor.report',
      kind: 'diagnostic',
      mode: 'dev',
      operation: 'validate',
      resource: 'frontier.config.mjs',
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['doctor', 'diagnostics', 'agent'],
      metadata: {
        routes: config.frontend.routes.length,
        endpoints: config.backend.endpoints.length,
        transports: config.backend.transports.length,
        deployTargets: config.deploy.frontend.length + config.deploy.backend.length + config.deploy.evidence.length
      } as JsonValue
    },
    {
      id: 'effect:config.validation',
      kind: 'diagnostic',
      mode: 'dev',
      operation: 'schema-validate',
      resource: 'frontier.config.mjs',
      produces: [config.frontend.evidenceDir + '/config-validation.json'],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['config', 'schema', 'diagnostics'],
      metadata: {
        schema: FRONTIER_FRAMEWORK_CONFIG_SCHEMA_ID,
        explainEntries: FRONTIER_FRAMEWORK_CONFIG_EXPLAIN.length
      } as JsonValue
    },
    {
      id: 'effect:source-policy.check',
      kind: 'diagnostic',
      mode: 'dev',
      operation: 'source-policy',
      resource: config.sourcePolicy.include.join(','),
      produces: [config.frontend.evidenceDir + '/source-policy.json', config.sourcePolicy.sourceGraphFile, config.sourcePolicy.sourceGraphRegistryFile],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['source-policy', 'lint', 'ast-walk', config.sourcePolicy.enabled ? 'enabled' : 'disabled', config.sourcePolicy.enforcement],
      metadata: config.sourcePolicy as unknown as JsonValue
    },
    {
      id: 'effect:source-graph.walk',
      kind: 'diagnostic',
      mode: 'dev',
      operation: 'source-graph',
      resource: config.sourcePolicy.sourceGraphFile,
      produces: [config.sourcePolicy.sourceGraphFile, config.sourcePolicy.sourceGraphRegistryFile],
      package: '@shapeshift-labs/frontier-ast-walk',
      tags: ['source-graph', 'ast-walk', 'business-logic'],
      metadata: {
        businessLogic: config.sourcePolicy.businessLogic,
        domainRoots: config.sourcePolicy.domainRoots
      } as JsonValue
    },
    {
      id: 'effect:conformance.lint',
      kind: 'diagnostic',
      mode: 'dev',
      operation: 'frontier-conformance',
      resource: config.conformance.reportFile,
      produces: [config.conformance.reportFile, config.conformance.sarifFile],
      package: '@shapeshift-labs/frontier-linter',
      tags: ['conformance', 'lint', 'package-use', config.conformance.enabled ? 'enabled' : 'disabled', config.conformance.enforcement],
      metadata: config.conformance as unknown as JsonValue
    },
    {
      id: 'effect:telemetry.frontier',
      kind: 'telemetry',
      mode: 'runtime',
      operation: 'record',
      resource: config.telemetry.sinks.join(','),
      produces: config.telemetry.sinks,
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['telemetry', 'logging', 'trace', 'inspect'],
      metadata: config.telemetry as unknown as JsonValue
    },
    {
      id: 'effect:auth.manifest',
      kind: 'auth',
      mode: 'build',
      operation: 'emit-auth-manifest',
      resource: config.auth.evidenceFile,
      produces: [config.auth.manifestFile, config.auth.evidenceFile],
      package: '@shapeshift-labs/frontier-auth',
      tags: ['auth', 'session', 'gates', 'tokens', 'runtime-grants', config.auth.enabled ? 'enabled' : 'disabled', config.auth.strict ? 'strict' : 'optional'],
      metadata: config.auth as unknown as JsonValue
    },
    {
      id: 'effect:migrations.runtime-data',
      kind: 'migration',
      mode: 'runtime',
      operation: 'normalize-before-hydrate',
      resource: config.migrations.evidenceFile,
      produces: [config.migrations.evidenceFile, config.migrations.runtimeBridgeFile],
      package: '@shapeshift-labs/frontier-migrations',
      tags: ['migrations', 'state', 'cache', 'crdt', 'event-log', config.migrations.enabled ? 'enabled' : 'disabled'],
      metadata: config.migrations as unknown as JsonValue
    },
    ...config.deploy.frontend.map((target) => ({
      id: 'effect:deploy.' + target.id,
      kind: 'deploy',
      mode: 'deploy',
      operation: 'publish',
      resource: target.output ?? target.id,
      produces: target.output ? [target.output] : [],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['deploy', 'frontend', ...(target.tags ?? [])],
      metadata: target as unknown as JsonValue
    })),
    ...config.deploy.backend.map((target) => ({
      id: 'effect:deploy.' + target.id,
      kind: 'deploy',
      mode: 'deploy',
      operation: 'publish',
      resource: target.output ?? target.id,
      produces: target.output ? [target.output] : [],
      package: FRONTIER_FRAMEWORK_PACKAGE_NAME,
      tags: ['deploy', 'backend', ...(target.tags ?? [])],
      metadata: target as unknown as JsonValue
    }))
  ];
}

function createArtifactPlan(config: NormalizedFrontierFrameworkConfig): FrontierFrameworkArtifactPlan[] {
  return [
    {
      id: 'frontend',
      kind: 'frontend',
      path: config.frontend.outDir,
      deployTarget: config.deploy.frontend[0]?.id,
      description: 'Static frontend artifact compiled from Frontier TSX route files and Vite-managed client assets.'
    },
    {
      id: 'vite-assets',
      kind: 'frontend',
      path: config.vite.outDir,
      deployTarget: config.deploy.frontend[0]?.id,
      description: 'Vite output for client assets, virtual devtools imports, and bundler-managed frontend modules.'
    },
    {
      id: 'frontend-cache',
      kind: 'evidence',
      path: config.frontend.cacheDir,
      description: 'Incremental route/component fingerprint cache for repeated unchanged frontend builds.'
    },
    {
      id: 'component-preview',
      kind: 'frontend',
      path: config.componentPreview.outDir,
      deployTarget: config.deploy.frontend[0]?.id,
      description: 'Standalone Frontier component preview book with discovered component manifest, preview module, proof, harness plan, fuzz cases, and browser evidence plan.'
    },
    {
      id: 'component-preview-evidence',
      kind: 'evidence',
      path: config.frontend.evidenceDir + '/component-preview.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Compact framework evidence summary for generated component previews, diagnostics, proof, and artifact paths.'
    },
    {
      id: 'documentation',
      kind: 'frontend',
      path: config.documentation.outDir,
      deployTarget: config.deploy.frontend[0]?.id,
      description: 'Standalone Frontier documentation book with discovered documentation manifest, search index, proof, JSONL, harness plan, fuzz cases, and browser evidence plan.'
    },
    {
      id: 'documentation-evidence',
      kind: 'evidence',
      path: config.frontend.evidenceDir + '/documentation.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Compact framework evidence summary for generated documentation pages, diagnostics, proof, search records, and artifact paths.'
    },
    {
      id: 'route-discovery',
      kind: 'evidence',
      path: config.frontend.evidenceDir + '/route-discovery.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Agent-readable configured/filesystem route discovery summary with route paths, files, and conflict signatures.'
    },
    {
      id: 'route-scenarios',
      kind: 'evidence',
      path: config.routeScenarios.manifestFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'App-defined route scenario manifest with fixture references, expected redirects, DOM roles, selectors, scroll policy, console policy, and route-state metadata.'
    },
    {
      id: 'route-scenario-playwright',
      kind: 'evidence',
      path: config.routeScenarios.playwrightPlanFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Generated browser-plan records for route scenarios; app adapters provide fixture setup while Frontier provides stable probes and assertions.'
    },
    {
      id: 'surfaces',
      kind: 'evidence',
      path: config.surfaces.registryFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Generic surface status registry for app-owned pages, routes, filters, features, actions, resources, evidence links, and workflow status.'
    },
    {
      id: 'surface-coverage',
      kind: 'evidence',
      path: config.surfaces.coverage.reportFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Agent-facing report that joins surface status records to required evidence links, generated render probes, route scenarios, and state probes.'
    },
    {
      id: 'surface-dashboard',
      kind: 'evidence',
      path: config.surfaces.coverage.dashboardFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Compact route/page/filter/action coverage dashboard for agents to decide the next surface to work on.'
    },
    {
      id: 'devtools-overlay',
      kind: 'frontend',
      path: config.devtools.scriptPath,
      deployTarget: config.deploy.frontend[0]?.id,
      description: 'Development overlay script with floating inspect/debug/rewind controls and Frontier timeline bridge methods.'
    },
    {
      id: 'devtools-bridge',
      kind: 'evidence',
      path: config.frontend.evidenceDir + '/devtools-bridge.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Agent-readable devtools bridge summary for state snapshots, patches, CRDT updates, event-log entries, traces, telemetry, and rewind.'
    },
    {
      id: 'source-policy',
      kind: 'evidence',
      path: config.frontend.evidenceDir + '/source-policy.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Configurable source-structure policy report for component/file limits, character limits, runtime-module ownership, business-logic placement, include/exclude paths, and enforcement mode.'
    },
    {
      id: 'source-graph',
      kind: 'evidence',
      path: config.sourcePolicy.sourceGraphFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'frontier-ast-walk import/declaration/call graph used by linter resources, docs, fuzzers, benchmarks, and agent impact analysis.'
    },
    {
      id: 'source-registry',
      kind: 'evidence',
      path: config.sourcePolicy.sourceGraphRegistryFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Registry-style source graph entries and import edges generated from frontier-ast-walk.'
    },
    {
      id: 'config-validation',
      kind: 'evidence',
      path: config.frontend.evidenceDir + '/config-validation.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Schema-backed config validation report with semantic diagnostics, suggested fixes, and explain entries.'
    },
    {
      id: 'auth-manifest',
      kind: 'evidence',
      path: config.auth.manifestFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Frontier auth manifest with app-owned provider declarations, session config, route/resource gates, token contracts, runtime grants, and linking policy.'
    },
    {
      id: 'auth-evidence',
      kind: 'evidence',
      path: config.auth.evidenceFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Auth evidence bundle with registry graph and lint resources for sessions, protected routes, backend endpoints, sync transports, runtime rooms, and service tokens.'
    },
    {
      id: 'runtime-migrations',
      kind: 'evidence',
      path: config.migrations.evidenceFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Runtime data-source migration manifest for app state, query-cache, CRDT snapshots, event-log snapshots, and old data-source hydration.'
    },
    {
      id: 'runtime-migration-bridge',
      kind: 'evidence',
      path: config.migrations.runtimeBridgeFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Generated bridge that wires @shapeshift-labs/frontier-migrations into state initializers and cache/storage hydration callbacks.'
    },
    {
      id: 'backend',
      kind: 'backend',
      path: config.backend.outDir,
      deployTarget: config.deploy.backend[0]?.id,
      description: 'Backend Fetch-handler adapter contract, deploy metadata, endpoint map, and sync transport declarations.'
    },
    {
      id: 'evidence',
      kind: 'evidence',
      path: config.frontend.evidenceDir,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Frontier manifest, route, view, application, tools, effects, tests, trace, and compact evidence JSON.'
    },
    {
      id: 'conformance',
      kind: 'evidence',
      path: config.conformance.reportFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Frontier linter conformance report that enforces required package usage across source, harness, telemetry, and agent workflow surfaces.'
    },
    {
      id: 'conformance-sarif',
      kind: 'evidence',
      path: config.conformance.sarifFile,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'SARIF output for Frontier conformance failures so CI and agents can annotate missing package/tool usage.'
    },
    {
      id: 'hybrid-harness',
      kind: 'evidence',
      path: config.harness.evidenceDir,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Hybrid harness plan for agent-operable tests, fuzzers, benchmarks, browser probes, and telemetry gates.'
    },
    {
      id: 'generated-harness',
      kind: 'evidence',
      path: config.harness.generatedDir,
      description: 'Generated smoke, property-fuzz, benchmark, browser, corpus, and replay harness templates.'
    },
    {
      id: 'fuzz-corpus',
      kind: 'evidence',
      path: config.harness.corpusDir,
      description: 'Seed corpus and replay fixtures for generated Frontier framework fuzzers.'
    },
    {
      id: 'agent-bundle',
      kind: 'evidence',
      path: config.agent.generatedDir,
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Agent-first manifest, runbook, readiness, capability map, MCP/tool descriptors, CI gates, workflow manifest, linter/SARIF output, replay script, and handoff templates.'
    },
    {
      id: 'agent-surface-loop',
      kind: 'evidence',
      path: config.agent.generatedDir + '/surface-loop.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Compact agent loop report joining surface status, render/state/evidence coverage, missing probes, and next surface commands.'
    },
    {
      id: 'agent-mcp-tools',
      kind: 'evidence',
      path: config.agent.generatedDir + '/mcp-tools.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'MCP-compatible tool descriptors generated from the Frontier tools manifest for agent clients.'
    },
    {
      id: 'agent-ci-gates',
      kind: 'evidence',
      path: config.agent.generatedDir + '/ci-evidence-gates.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'CI-ready evidence gates derived from the framework build, schema, doctor, harness, linter, and handoff graph.'
    },
    {
      id: 'agent-linter-report',
      kind: 'evidence',
      path: config.agent.generatedDir + '/frontier-agent-lint.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Frontier linter report for agent readiness and CI gate diagnostics.'
    },
    {
      id: 'agent-sarif',
      kind: 'evidence',
      path: config.agent.generatedDir + '/frontier-agent-lint.sarif',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'SARIF output generated through frontier-linter for CI annotations and code-scanning style agent review.'
    },
    {
      id: 'agent-workflow',
      kind: 'evidence',
      path: config.agent.generatedDir + '/agent-workflow.json',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Frontier workflow manifest and proof for the agent orient/build/validate/handoff/replay process.'
    },
    {
      id: 'agent-replay-script',
      kind: 'evidence',
      path: config.agent.generatedDir + '/frontier-agent-replay.mjs',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Replay script that runs the generated CI evidence gates and writes replay records for agents.'
    },
    {
      id: 'agent-handoff-bundles',
      kind: 'evidence',
      path: config.agent.generatedDir + '/ISSUE-HANDOFF.md',
      deployTarget: config.deploy.evidence[0]?.id,
      description: 'Issue and PR handoff templates generated from readiness checks and evidence gates.'
    }
  ];
}

function renderConfig(input: { name: string; workspaceKind: string; packageManager: string }): string {
  return `/** @type {import('@shapeshift-labs/frontier-framework').FrontierFrameworkConfig} */
export default {
  id: ${JSON.stringify(slugify(input.name))},
  name: ${JSON.stringify(input.name)},
  workspace: {
    kind: ${JSON.stringify(input.workspaceKind)},
    packageManager: ${JSON.stringify(input.packageManager)},
    taskRunner: 'turbo'
  },
  frontend: {
    root: 'apps/web',
    routesDir: 'src/routes',
    componentsDir: 'src/components',
    outDir: 'dist/frontend',
    evidenceDir: 'dist/frontier',
    cacheDir: '.frontier-framework/cache/frontend',
    incremental: true,
    shell: {
      title: ${JSON.stringify(input.name)}
    }
  },
  routeScenarios: {
    enabled: true,
    fixtures: [
      { id: 'guest-session', kind: 'auth', data: { authenticated: false } },
      { id: 'default-state', kind: 'state', data: { counter: 0 } }
    ],
    scenarios: [
      {
        id: 'guest-root',
        route: '/',
        authFixture: 'guest-session',
        stateFixture: 'default-state',
        expected: {
          finalPath: '/',
          domRoles: [{ role: 'main' }],
          selectors: [{ selector: '#frontier-framework' }],
          consoleErrors: 'fail',
          scroll: 'optional'
        }
      }
    ]
  },
  surfaces: {
    enabled: true,
    statuses: [
      'untracked',
      'planned',
      'in-progress',
      'implemented',
      { id: 'verified', terminal: true }
    ],
    surfaces: [
      {
        id: 'page.root',
        kind: 'page',
        title: 'Root page',
        route: '/',
        aliases: ['root', 'home'],
        status: 'implemented',
        evidence: ['dist/frontier/evidence.json'],
        tags: ['page', 'root']
      },
      {
        id: 'filter.counter-default',
        kind: 'filter',
        title: 'Default counter state',
        aliases: ['counter-default', 'default-counter'],
        status: 'planned',
        evidence: ['dist/frontier/surfaces.json'],
        tags: ['filter', 'state']
      }
    ]
  },
  backend: {
    root: 'apps/api',
    entry: 'src/handler.ts',
    outDir: 'dist/backend',
    handlerExport: 'handleFrontierRequest',
    adapters: ['node', 'edge', 'serverless', 'custom'],
    endpoints: [
      { path: '/api/health', method: 'GET', feature: 'system' }
    ],
    transports: [
      { kind: 'fetch', protocol: 'http', path: '/api/*', adapter: 'fetch-handler', required: true },
      { kind: 'crdt-websocket', protocol: 'websocket', path: '/sync/:documentId', package: '@shapeshift-labs/frontier-crdt-websocket' },
      { kind: 'event-log', protocol: 'sse', path: '/events/:streamId', package: '@shapeshift-labs/frontier-event-log' },
      { kind: 'state-cache', protocol: 'http', path: '/cache/:queryKey', package: '@shapeshift-labs/frontier-state-cache' }
    ]
  },
  vite: {
    enabled: true,
    hmr: true,
    configFile: 'vite.config.ts',
    plugin: 'frontier-framework',
    strict: false
  },
  componentPreview: {
    enabled: true,
    include: ['apps/web/src/components'],
    outDir: '.frontier-framework/component-preview',
    title: ${JSON.stringify(input.name)} + ' Component Previews'
  },
  documentation: {
    enabled: true,
    include: ['README.md', 'docs', 'features', 'apps/web/src/routes', 'apps/web/src/components', 'apps/api', 'packages'],
    outDir: '.frontier-framework/documentation',
    title: ${JSON.stringify(input.name)} + ' Documentation'
  },
  devtools: {
    enabled: true,
    floatingButton: true,
    rewind: true
  },
  telemetry: {
    enabled: true,
    logging: true,
    trace: true,
    inspect: true
  },
  auth: {
    enabled: true,
    generatedDir: '.frontier-framework/auth',
    manifestFile: '.frontier-framework/auth/auth-manifest.json',
    evidenceFile: 'dist/frontier/auth.json',
    sessionStrategy: 'jwt',
    strict: false,
    failOnMissingGate: false,
    providers: [
      { id: 'frontier-session', kind: 'bearer', claims: ['sub', 'email', 'provider', 'role', 'username'] },
      { id: 'frontier-service-token', kind: 'service-token', claims: ['sub', 'aud', 'iss', 'role'] },
      { id: 'frontier-dev-credentials', kind: 'credentials', tags: ['dev-only'] }
    ],
    profile: {
      requireSubject: true,
      fields: ['username'],
      access: ['granted_access'],
      legal: ['accepted_terms_of_use', 'accepted_privacy_policy']
    },
    linking: {
      providerFirst: true,
      allowEmailFallback: true,
      allowRelink: false,
      attachProviderAccount: true
    }
  },
  migrations: {
    enabled: true,
    currentVersion: '1',
    initialVersion: '1',
    registryId: ${JSON.stringify(slugify(input.name))} + '.migrations',
    generatedDir: '.frontier-framework/migrations',
    autoMigrateState: true,
    autoMigrateCache: true,
    failOnMissingVersion: true,
    sources: [
      { id: 'app-state', kind: 'state', source: 'frontier.state.initial', required: true, versionPath: '/$version' },
      { id: 'query-cache', kind: 'query-cache', source: 'frontier.state-cache.persistence', dataVersionPaths: ['/metadata/dataVersion', '/dataVersion'] },
      { id: 'crdt-snapshots', kind: 'crdt-snapshot', source: 'frontier.crdt.snapshot' },
      { id: 'event-log', kind: 'event-log-snapshot', source: 'frontier.event-log.snapshot' }
    ]
  },
  sourcePolicy: {
    enabled: true,
    preset: 'strict-app',
    enforcement: 'error',
    maxFrontierComponentsPerFile: 1,
    maxLinesPerFile: 320,
    maxCharsPerFile: 24000,
    localImportExtensions: 'source',
    businessLogic: true,
    businessLogicSeverity: 'error',
    sourceGraphFile: 'dist/frontier/source-graph.json',
    sourceGraphRegistryFile: 'dist/frontier/source-registry.json',
    domainRoots: ['packages/domain/src', 'packages/contracts/src'],
    runtimeModules: [
      {
        id: 'runtime.dom-events',
        file: 'apps/web/src/runtime/dom-events.ts',
        owner: 'frontend-runtime',
        bindings: [{ kind: 'dom-events', target: 'document', events: ['click'], capabilities: ['dom.events'], evidence: ['dist/frontier/source-policy.json'] }]
      },
      {
        id: 'runtime.forms',
        file: 'apps/web/src/runtime/forms.ts',
        owner: 'frontend-runtime',
        bindings: [{ kind: 'form-actions', actions: ['form.submit'], writes: ['/ui/forms'], capabilities: ['forms.dispatch'] }]
      },
      {
        id: 'runtime.tools',
        file: 'apps/web/src/runtime/tools.ts',
        owner: 'frontend-runtime',
        bindings: [{ kind: 'tool-surface', tools: ['counter.increment'], writes: ['/tools'], capabilities: ['tools.surface'] }]
      },
      {
        id: 'runtime.offline',
        file: 'apps/web/src/runtime/offline.ts',
        owner: 'frontend-runtime',
        bindings: [{ kind: 'offline-snapshot', snapshots: ['app-state'], reads: ['/state'], capabilities: ['offline.snapshot'], evidence: ['dist/frontier/evidence.json'] }]
      },
      {
        id: 'runtime.test-api',
        file: 'apps/web/src/runtime/test-api.ts',
        owner: 'frontend-runtime',
        bindings: [{ kind: 'test-api', tests: ['smoke'], reads: ['/state'], capabilities: ['test.api'] }]
      }
    ]
  },
  conformance: {
    enabled: true,
    mode: 'strict',
    enforcement: 'error',
    failOnViolation: true
  },
  harness: {
    mode: 'recommended',
    autoRun: 'plan',
    generatedDir: '.frontier-framework/harness',
    corpusDir: 'test/fixtures/frontier-framework-corpus',
    replayFailures: true,
    minimizeCorpus: true,
    browserTrace: 'retain-on-failure',
    agentKit: { files: ['features/*.json'], required: true },
    fuzzers: { command: 'npm run fuzz', required: false },
    benchmarks: { command: 'npm run bench', required: false }
  },
  agent: {
    enabled: true,
    generatedDir: '.frontier-framework/agent',
    manifestDir: 'features',
    runsDir: 'agent-runs',
    requireFeatureManifest: true,
    requireEvidence: true,
    requireHarness: true,
    requireProof: false,
    requireCleanScope: false,
    handoffMode: 'required',
    maxOpenQuestions: 3
  },
  deploy: {
    frontend: [
      { id: 'web-static', kind: 'static', target: 'frontend', output: 'dist/frontend' }
    ],
    backend: [
      { id: 'api-fetch', kind: 'serverless', target: 'backend', adapter: 'fetch', output: 'dist/backend' }
    ]
  },
  features: [
    { id: 'home', title: 'Home', routes: ['/'] },
    { id: 'system', title: 'System API', endpoints: ['/api/health'] }
  ]
};
`;
}

function normalizeTransport(transport: FrontierFrameworkBackendTransportConfig, index: number): FrontierFrameworkBackendTransportConfig {
  const protocol = transport.protocol ?? inferTransportProtocol(transport.kind);
  const id = transport.id ?? slugify([transport.kind, protocol, transport.path ?? transport.package ?? String(index)].filter(Boolean).join('-'));
  return {
    ...transport,
    id,
    protocol,
    required: transport.required ?? transport.kind === 'fetch',
    tags: [...(transport.tags ?? [])]
  };
}

function normalizeMigrationSource(
  source: FrontierFrameworkMigrationSourceConfig,
  index: number,
  targetVersion: string
): Required<FrontierFrameworkMigrationSourceConfig> {
  const id = source.id ?? slugify([source.kind, source.source ?? String(index)].filter(Boolean).join('-'));
  return {
    id,
    kind: source.kind,
    source: source.source ?? id,
    required: source.required ?? false,
    versionPath: source.versionPath ?? '/$version',
    dataVersionPaths: [...(source.dataVersionPaths ?? [])],
    writeDataVersionPaths: [...(source.writeDataVersionPaths ?? [])],
    payloadPath: source.payloadPath ?? false,
    payloadPaths: [...(source.payloadPaths ?? [])],
    targetVersion: source.targetVersion ?? targetVersion,
    metadata: source.metadata ?? {}
  };
}

function defaultAuthProviders(): FrontierAuthProviderInput[] {
  return [
    {
      id: 'frontier-session',
      kind: 'bearer',
      claims: ['sub', 'email', 'provider', 'role', 'username'],
      runtime: ['browser', 'node', 'edge', 'serverless'],
      tags: ['session', 'bearer']
    },
    {
      id: 'frontier-service-token',
      kind: 'service-token',
      claims: ['sub', 'aud', 'iss', 'role'],
      runtime: ['node', 'edge', 'serverless', 'worker', 'cli'],
      tags: ['service', 'runtime']
    },
    {
      id: 'frontier-dev-credentials',
      kind: 'credentials',
      claims: ['sub', 'email', 'role', 'username'],
      runtime: ['node'],
      tags: ['dev-only', 'credentials'],
      metadata: { production: false }
    }
  ];
}

function defaultAuthProfileRequirement(): FrontierAuthProfileRequirementInput {
  return {
    requireSubject: true,
    fields: ['username'],
    access: ['granted_access'],
    legal: ['accepted_terms_of_use', 'accepted_privacy_policy'],
    tags: ['profile', 'access', 'legal']
  };
}

function defaultAuthLinkingPolicy(): FrontierAuthLinkingPolicyInput {
  return {
    providerFirst: true,
    allowEmailFallback: true,
    allowRelink: false,
    attachProviderAccount: true,
    identityKeys: ['provider', 'providerAccountId'],
    fallbackKeys: ['email'],
    reservedUsernames: ['admin', 'root', 'system'],
    reservedEmails: []
  };
}

function defaultAuthRouteGuards(
  frontend: Required<Omit<FrontierFrameworkFrontendConfig, 'routes' | 'shell'>> & { routes: FrontierFrontendRouteConfig[] },
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>> & {
    endpoints: FrontierBackendEndpointConfig[];
    transports: FrontierFrameworkBackendTransportConfig[];
  }
): FrontierAuthGateInput[] {
  const guards: FrontierAuthGateInput[] = [];
  const frontendRoutes = frontend.routes.length > 0 ? frontend.routes : [{ path: '/', file: joinAppPath(frontend.root, frontend.routesDir, 'index.tsx') }];
  for (const route of frontendRoutes) {
    const protectedRoute = route.tags?.some((tag) => /auth|private|protected|admin/.test(tag)) === true;
    guards.push({
      id: 'frontend-route-' + authGuardSlug(route.id ?? route.path),
      resource: route.path,
      route: route.path,
      required: protectedRoute,
      profile: protectedRoute,
      redirectTo: protectedRoute ? '/login' : undefined,
      tags: ['frontend', 'route', protectedRoute ? 'protected' : 'public', ...(route.tags ?? [])],
      metadata: { file: route.file, feature: route.feature ?? '' }
    });
  }
  for (const endpoint of backend.endpoints) {
    const path = endpoint.path;
    const publicEndpoint = isPublicAuthEndpoint(path, endpoint.tags);
    guards.push({
      id: 'backend-endpoint-' + authGuardSlug((endpoint.method ?? 'GET') + '-' + path),
      resource: path,
      route: path,
      effect: endpoint.effects?.[0] ?? 'backend.request',
      required: !publicEndpoint,
      profile: !publicEndpoint,
      status: 401,
      tags: ['backend', 'endpoint', publicEndpoint ? 'public' : 'protected', ...(endpoint.tags ?? [])],
      metadata: { method: endpoint.method ?? 'GET', feature: endpoint.feature ?? '' }
    });
  }
  for (const transport of backend.transports) {
    const resource = transportResource(transport);
    const sensitive = isAuthSensitiveTransport(transport);
    guards.push({
      id: 'backend-transport-' + authGuardSlug(transportId(transport)),
      resource,
      route: transport.path,
      effect: transport.effects?.[0] ?? transport.kind,
      required: sensitive || transport.required === true,
      profile: sensitive,
      status: 401,
      tags: ['backend', 'transport', transport.kind, sensitive ? 'protected' : 'optional', ...(transport.tags ?? [])],
      metadata: {
        protocol: transport.protocol ?? inferTransportProtocol(transport.kind),
        package: transport.package ?? '',
        adapter: transport.adapter ?? ''
      } as JsonObject
    });
  }
  return guards;
}

function defaultAuthCapabilities(
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>> & {
    endpoints: FrontierBackendEndpointConfig[];
    transports: FrontierFrameworkBackendTransportConfig[];
  }
): FrontierAuthCapabilityInput[] {
  const capabilities: FrontierAuthCapabilityInput[] = [
    {
      id: 'backend.request',
      action: 'backend.request',
      resource: '/api/*',
      effects: ['backend.request'],
      tags: ['backend', 'request']
    }
  ];
  for (const transport of backend.transports) {
    capabilities.push({
      id: 'transport.' + authGuardSlug(transportId(transport)),
      action: transport.kind,
      resource: transportResource(transport),
      gate: 'backend-transport-' + authGuardSlug(transportId(transport)),
      effects: [...(transport.effects ?? [])],
      tags: ['transport', transport.kind, ...(transport.tags ?? [])]
    });
  }
  return capabilities;
}

function defaultAuthTokenContracts(appId: string): FrontierAuthTokenContractInput[] {
  return [
    {
      id: 'session-jwt',
      kind: 'session',
      issuer: appId + '.auth',
      audience: appId + '.api',
      subjectPath: '/sub',
      algorithm: 'HS256',
      expiresInSeconds: 60 * 60 * 24 * 7,
      requiredClaims: ['sub', 'provider'],
      sensitiveClaims: ['access_token', 'refresh_token', 'id_token', 'token', 'secret'],
      replayProtection: false,
      runtime: ['browser', 'node', 'edge', 'serverless'],
      tags: ['session', 'jwt']
    },
    {
      id: 'runtime-room',
      kind: 'runtime-room',
      issuer: appId + '.auth',
      audience: appId + '.runtime-room',
      subjectPath: '/userId',
      algorithm: 'HS256',
      expiresInSeconds: 60 * 15,
      requiredClaims: ['roomId', 'userId', 'kind'],
      sensitiveClaims: ['token', 'secret'],
      replayProtection: true,
      runtime: ['node', 'edge', 'worker', 'cli'],
      tags: ['runtime', 'room', 'realtime']
    },
    {
      id: 'service-user',
      kind: 'service-user',
      issuer: appId + '.auth',
      audience: appId + '.api',
      subjectPath: '/sub',
      algorithm: 'HS256',
      expiresInSeconds: 60 * 15,
      requiredClaims: ['sub', 'email'],
      sensitiveClaims: ['token', 'secret'],
      replayProtection: true,
      runtime: ['node', 'edge', 'serverless', 'worker', 'cli'],
      tags: ['service', 'api']
    }
  ];
}

function defaultAuthRuntimeGrants(appId: string): FrontierAuthRuntimeGrantInput[] {
  return [
    {
      id: 'runtime-room',
      contract: 'runtime-room',
      resource: '/realtime/:roomId',
      audience: appId + '.runtime-room',
      requiredClaims: ['roomId', 'userId', 'kind'],
      ttlSeconds: 60 * 15,
      runtime: 'node',
      tags: ['runtime', 'room', 'websocket']
    },
    {
      id: 'service-user',
      contract: 'service-user',
      resource: '/api/*',
      audience: appId + '.api',
      requiredClaims: ['sub', 'email'],
      ttlSeconds: 60 * 15,
      runtime: 'node',
      tags: ['service', 'api']
    }
  ];
}

function isPublicAuthEndpoint(path: string, tags: readonly string[] | undefined): boolean {
  const normalizedPath = path.toLowerCase();
  return (
    tags?.some((tag) => /public|health|status|ready|auth-callback|login|logout/.test(tag)) === true
    || /\/(health|status|ready|live|login|logout|auth\/callback)$/.test(normalizedPath)
  );
}

function isAuthSensitiveTransport(transport: FrontierFrameworkBackendTransportConfig): boolean {
  const text = [transport.kind, transport.protocol, transport.path, ...(transport.tags ?? [])].filter(Boolean).join(' ').toLowerCase();
  return /crdt|event-log|state-cache|realtime|websocket|sync|presence|worker|cache/.test(text);
}

function authGuardSlug(value: string): string {
  return slugify(value).replace(/^frontier-framework$/, 'root');
}

function transportId(transport: FrontierFrameworkBackendTransportConfig): string {
  return transport.id ?? slugify([transport.kind, transport.protocol ?? inferTransportProtocol(transport.kind), transport.path ?? transport.package ?? 'transport'].filter(Boolean).join('-'));
}

function transportResource(transport: FrontierFrameworkBackendTransportConfig): string {
  return transport.path ?? transport.id ?? transport.package ?? transport.kind;
}

function inferTransportProtocol(kind: FrontierFrameworkTransportKind): FrontierFrameworkTransportProtocol {
  if (kind.includes('websocket')) return 'websocket';
  if (kind === 'event-log') return 'sse';
  if (kind === 'worker') return 'worker';
  if (kind === 'crdt-sync') return 'custom';
  return 'http';
}

function schemaIssueToConfigDiagnostic(issue: SchemaValidationIssue): FrontierFrameworkConfigDiagnostic {
  const path = formatConfigPath(issue.path);
  return {
    id: 'config.schema.' + issue.keyword + ':' + path,
    severity: 'error',
    source: 'schema',
    path,
    message: issue.message,
    expected: issue.expected === undefined ? undefined : JSON.stringify(issue.expected),
    actual: issue.actual,
    suggestedFix: schemaIssueSuggestedFix(issue, path),
    tags: ['config', 'schema', issue.keyword]
  };
}

function schemaIssueSuggestedFix(issue: SchemaValidationIssue, path: string): string {
  if (issue.keyword === 'required') return 'Add the missing config property at ' + path + '.';
  if (issue.keyword === 'type') return 'Change ' + path + ' to match the documented type. Run frontier config explain ' + rootConfigPath(path) + ' for details.';
  if (issue.keyword === 'minLength') return 'Set ' + path + ' to a non-empty string.';
  if (issue.keyword === 'minimum') return 'Set ' + path + ' to a positive number, or use false when that rule supports opt-out.';
  if (issue.keyword === 'maximum') return 'Lower ' + path + ' to the supported range.';
  return 'Run frontier config explain ' + rootConfigPath(path) + ' for the expected shape and defaults.';
}

function addSemanticConfigDiagnostics(
  config: Record<string, unknown>,
  diagnostics: FrontierFrameworkConfigDiagnostic[],
  maxDiagnostics: number
): void {
  const add = (
    id: string,
    severity: FrontierFrameworkConfigDiagnosticSeverity,
    path: string,
    message: string,
    suggestedFix: string,
    tags: readonly string[]
  ) => pushConfigDiagnostic(diagnostics, maxDiagnostics, { id, severity, source: 'semantic', path, message, suggestedFix, tags });

  const frontend = readRecord(config.frontend);
  if (frontend) {
    validateRouteConfigs(frontend.routes, add);
  }

  const routeScenarios = readRecord(config.routeScenarios);
  if (routeScenarios) validateRouteScenarioConfig(routeScenarios, add);

  const surfaces = readRecord(config.surfaces);
  if (surfaces) validateSurfacesConfig(surfaces, add);

  const backend = readRecord(config.backend);
  if (backend) {
    validateEndpointConfigs(backend.endpoints, add);
    validateTransportConfigs(backend.transports, add);
  }

  const vite = readRecord(config.vite);
  if (vite) validateViteConfig(vite, add);

  const migrations = readRecord(config.migrations);
  if (migrations) validateMigrationConfig(migrations, add);

  const sourcePolicy = readRecord(config.sourcePolicy);
  if (sourcePolicy) validateSourcePolicyConfig(sourcePolicy, add);

  const conformance = readRecord(config.conformance);
  if (conformance) validateConformanceConfig(conformance, add);

  const harness = readRecord(config.harness);
  if (harness) validateHarnessConfig(harness, add);

  const agent = readRecord(config.agent);
  if (agent) validateAgentConfig(agent, add);

  const deploy = readRecord(config.deploy);
  if (deploy) validateDeployConfig(deploy, add);

  if (!diagnostics.some((diagnostic) => diagnostic.source === 'schema' && diagnostic.severity === 'error')) {
    try {
      const normalized = normalizeFrontierFrameworkConfig(config as FrontierFrameworkConfig);
      validateNormalizedConfig(normalized, add);
    } catch (error) {
      add(
        'config.normalize.failed',
        'error',
        '<root>',
        'Config could not be normalized: ' + (error instanceof Error ? error.message : String(error)),
        'Fix the typed config diagnostics first, then rerun frontier config validate.',
        ['config', 'normalize']
      );
    }
  }
}

function validateRouteConfigs(
  value: unknown,
  add: ConfigDiagnosticAdder
): void {
  if (value === undefined || !Array.isArray(value)) return;
  const paths = new Map<string, number>();
  for (let index = 0; index < value.length; index++) {
    const route = readRecord(value[index]);
    if (!route) continue;
    const pathValue = route.path;
    if (typeof pathValue === 'string') {
      if (!pathValue.startsWith('/')) {
        add('config.frontend.route.path.absolute', 'error', 'frontend.routes[' + index + '].path', 'Frontend route paths must start with "/".', 'Change this route path to "' + ensureLeadingSlash(pathValue) + '".', ['config', 'route', 'frontend']);
      }
      const duplicateIndex = paths.get(pathValue);
      if (duplicateIndex !== undefined) {
        add('config.frontend.route.path.duplicate', 'error', 'frontend.routes[' + index + '].path', 'Duplicate frontend route path also appears at frontend.routes[' + duplicateIndex + '].path.', 'Keep one route for ' + pathValue + ' or give the routes distinct paths.', ['config', 'route', 'frontend']);
      } else {
        paths.set(pathValue, index);
      }
    }
    if (typeof route.file === 'string' && route.file.trim() === '') {
      add('config.frontend.route.file.empty', 'error', 'frontend.routes[' + index + '].file', 'Route file cannot be empty.', 'Point this route at a TSX/JSX route module.', ['config', 'route', 'frontend']);
    }
  }
}

function validateRouteScenarioConfig(
  routeScenarios: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const fixtures = routeScenarios.fixtures;
  const scenarios = routeScenarios.scenarios;
  const fixtureIds = new Map<string, number>();
  if (fixtures !== undefined && !Array.isArray(fixtures)) {
    add('config.routeScenarios.fixtures.invalid', 'error', 'routeScenarios.fixtures', 'routeScenarios.fixtures must be an array.', 'Declare fixtures as an array of app-owned fixture records.', ['config', 'route-scenarios', 'fixtures']);
  }
  if (Array.isArray(fixtures)) {
    for (let index = 0; index < fixtures.length; index++) {
      const fixture = readRecord(fixtures[index]);
      if (!fixture) continue;
      const id = fixture.id;
      if (typeof id !== 'string' || id.trim() === '') {
        add('config.routeScenarios.fixture.id.invalid', 'error', 'routeScenarios.fixtures[' + index + '].id', 'Route scenario fixtures must declare a non-empty id.', 'Give this fixture a stable app-owned id such as "guest-session".', ['config', 'route-scenarios', 'fixtures']);
        continue;
      }
      const duplicateIndex = fixtureIds.get(id);
      if (duplicateIndex !== undefined) {
        add('config.routeScenarios.fixture.id.duplicate', 'error', 'routeScenarios.fixtures[' + index + '].id', 'Route scenario fixture IDs must be unique.', 'Rename this fixture or remove the duplicate at routeScenarios.fixtures[' + duplicateIndex + '].', ['config', 'route-scenarios', 'fixtures']);
      } else {
        fixtureIds.set(id, index);
      }
    }
  }
  if (scenarios !== undefined && !Array.isArray(scenarios)) {
    add('config.routeScenarios.scenarios.invalid', 'error', 'routeScenarios.scenarios', 'routeScenarios.scenarios must be an array.', 'Declare one scenario record per important route state.', ['config', 'route-scenarios']);
  }
  if (!Array.isArray(scenarios)) return;
  const scenarioIds = new Map<string, number>();
  for (let index = 0; index < scenarios.length; index++) {
    const scenario = readRecord(scenarios[index]);
    if (!scenario) continue;
    const id = scenario.id;
    if (typeof id !== 'string' || id.trim() === '') {
      add('config.routeScenarios.scenario.id.invalid', 'error', 'routeScenarios.scenarios[' + index + '].id', 'Route scenarios must declare a non-empty id.', 'Give this scenario a stable id such as "guest-home-redirect".', ['config', 'route-scenarios']);
    } else {
      const duplicateIndex = scenarioIds.get(id);
      if (duplicateIndex !== undefined) {
        add('config.routeScenarios.scenario.id.duplicate', 'error', 'routeScenarios.scenarios[' + index + '].id', 'Route scenario IDs must be unique.', 'Rename this scenario or remove the duplicate at routeScenarios.scenarios[' + duplicateIndex + '].', ['config', 'route-scenarios']);
      } else {
        scenarioIds.set(id, index);
      }
    }
    const route = scenario.route;
    if (typeof route === 'string' && !route.startsWith('/')) {
      add('config.routeScenarios.scenario.route.absolute', 'error', 'routeScenarios.scenarios[' + index + '].route', 'Route scenario routes must start with "/".', 'Change this route to "' + ensureLeadingSlash(route) + '".', ['config', 'route-scenarios', 'route']);
    }
    const path = scenario.path;
    if (typeof path === 'string' && !path.startsWith('/')) {
      add('config.routeScenarios.scenario.path.absolute', 'error', 'routeScenarios.scenarios[' + index + '].path', 'Route scenario paths must start with "/".', 'Change this path to "' + ensureLeadingSlash(path) + '".', ['config', 'route-scenarios', 'route']);
    }
    validateRouteScenarioFixtureRef(scenario.authFixture, fixtureIds, 'routeScenarios.scenarios[' + index + '].authFixture', add);
    validateRouteScenarioFixtureRef(scenario.sessionFixture, fixtureIds, 'routeScenarios.scenarios[' + index + '].sessionFixture', add);
    validateRouteScenarioFixtureRef(scenario.stateFixture, fixtureIds, 'routeScenarios.scenarios[' + index + '].stateFixture', add);
    if (Array.isArray(scenario.fixtures)) {
      for (let fixtureIndex = 0; fixtureIndex < scenario.fixtures.length; fixtureIndex++) {
        validateRouteScenarioFixtureRef(scenario.fixtures[fixtureIndex], fixtureIds, 'routeScenarios.scenarios[' + index + '].fixtures[' + fixtureIndex + ']', add);
      }
    }
  }
}

function validateRouteScenarioFixtureRef(
  value: unknown,
  fixtureIds: ReadonlyMap<string, number>,
  path: string,
  add: ConfigDiagnosticAdder
): void {
  if (value === undefined) return;
  if (typeof value !== 'string' || value.trim() === '') {
    add('config.routeScenarios.fixtureRef.invalid', 'error', path, 'Route scenario fixture references must be non-empty strings.', 'Reference a fixture id from routeScenarios.fixtures.', ['config', 'route-scenarios', 'fixtures']);
    return;
  }
  if (!fixtureIds.has(value)) {
    add('config.routeScenarios.fixtureRef.missing', 'error', path, 'Route scenario references missing fixture "' + value + '".', 'Add a fixture with id "' + value + '" to routeScenarios.fixtures or remove this reference.', ['config', 'route-scenarios', 'fixtures']);
  }
}

function validateSurfacesConfig(
  surfacesConfig: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const statuses = surfacesConfig.statuses;
  const statusIds = new Map<string, number>();
  if (statuses !== undefined && !Array.isArray(statuses)) {
    add('config.surfaces.statuses.invalid', 'error', 'surfaces.statuses', 'surfaces.statuses must be an array.', 'Use an array of status ids or status definition objects.', ['config', 'surfaces', 'status']);
  }
  if (Array.isArray(statuses)) {
    for (let index = 0; index < statuses.length; index++) {
      const rawStatus = statuses[index];
      const id = typeof rawStatus === 'string' ? rawStatus : readStringProperty(rawStatus, 'id');
      if (typeof id !== 'string' || id.trim() === '') {
        add('config.surfaces.status.id.invalid', 'error', 'surfaces.statuses[' + index + ']', 'Surface statuses must be non-empty strings or objects with non-empty ids.', 'Use a status id such as "planned", "implemented", or an app-owned lifecycle word.', ['config', 'surfaces', 'status']);
        continue;
      }
      const duplicateIndex = statusIds.get(id);
      if (duplicateIndex !== undefined) {
        add('config.surfaces.status.id.duplicate', 'error', 'surfaces.statuses[' + index + ']', 'Surface status ids must be unique.', 'Rename this status or remove the duplicate at surfaces.statuses[' + duplicateIndex + '].', ['config', 'surfaces', 'status']);
      } else {
        statusIds.set(id, index);
      }
    }
  } else if (statuses === undefined) {
    for (const status of defaultSurfaceStatuses()) statusIds.set(status.id, -1);
  }
  const coverage = readRecord(surfacesConfig.coverage);
  if (surfacesConfig.coverage !== undefined && !coverage) {
    add('config.surfaces.coverage.invalid', 'error', 'surfaces.coverage', 'surfaces.coverage must be an object.', 'Use surfaces.coverage.enabled, failOnMissing, and required probe arrays to configure agent coverage checks.', ['config', 'surfaces', 'coverage']);
  }
  if (coverage) {
    validateSurfaceStringArray(coverage.requireEvidenceForStatuses, 'surfaces.coverage.requireEvidenceForStatuses', add);
    validateSurfaceStringArray(coverage.requireRenderForKinds, 'surfaces.coverage.requireRenderForKinds', add);
    validateSurfaceStringArray(coverage.requireStateForKinds, 'surfaces.coverage.requireStateForKinds', add);
    validateSurfaceStringArray(coverage.focusKinds, 'surfaces.coverage.focusKinds', add);
    validateSurfaceStringRecord(coverage.requireProbesForKinds, 'surfaces.coverage.requireProbesForKinds', add);
    validateSurfaceStringRecord(coverage.evidenceProbeTokens, 'surfaces.coverage.evidenceProbeTokens', add);
  }
  const surfaces = surfacesConfig.surfaces;
  if (surfaces !== undefined && !Array.isArray(surfaces)) {
    add('config.surfaces.surfaces.invalid', 'error', 'surfaces.surfaces', 'surfaces.surfaces must be an array.', 'Declare one surface record per page, route, filter, feature, action, or resource.', ['config', 'surfaces']);
  }
  const intents = surfacesConfig.intents;
  if (intents !== undefined && !Array.isArray(intents)) {
    add('config.surfaces.intents.invalid', 'error', 'surfaces.intents', 'surfaces.intents must be an array.', 'Declare one surface intent per agent-facing route, page, filter, action, or app-owned surface.', ['config', 'surfaces', 'intent']);
  }
  const surfaceIds = new Map<string, number>();
  if (Array.isArray(surfaces)) validateSurfaceRecordArray(surfaces, 'surfaces.surfaces', surfaceIds, statusIds, add);
  if (Array.isArray(intents)) validateSurfaceRecordArray(intents, 'surfaces.intents', surfaceIds, statusIds, add, true);
}

function validateSurfaceRecordArray(
  surfaces: readonly unknown[],
  path: string,
  surfaceIds: Map<string, number>,
  statusIds: ReadonlyMap<string, number>,
  add: ConfigDiagnosticAdder,
  validateIntentScenario = false
): void {
  for (let index = 0; index < surfaces.length; index++) {
    const surface = readRecord(surfaces[index]);
    if (!surface) continue;
    const id = surface.id;
    if (typeof id !== 'string' || id.trim() === '') {
      add('config.surfaces.surface.id.invalid', 'error', path + '[' + index + '].id', 'Surface records must declare a non-empty id.', 'Give this surface a stable id such as "page.home.guest" or "filter.worlds.mine".', ['config', 'surfaces']);
    } else {
      const duplicateIndex = surfaceIds.get(id);
      if (duplicateIndex !== undefined) {
        add('config.surfaces.surface.id.duplicate', 'error', path + '[' + index + '].id', 'Surface ids must be unique across surfaces.surfaces and surfaces.intents.', 'Rename this surface or remove the duplicate surface id.', ['config', 'surfaces']);
      } else {
        surfaceIds.set(id, index);
      }
    }
    const kind = surface.kind;
    if (typeof kind !== 'string' || kind.trim() === '') {
      add('config.surfaces.surface.kind.invalid', 'error', path + '[' + index + '].kind', 'Surface records must declare a non-empty kind.', 'Use a kind such as "page", "route", "filter", "feature", "action", or an app-owned kind.', ['config', 'surfaces']);
    }
    const route = surface.route;
    if (typeof route === 'string' && !route.startsWith('/')) {
      add('config.surfaces.surface.route.absolute', 'error', path + '[' + index + '].route', 'Surface route values must start with "/".', 'Change this route to "' + ensureLeadingSlash(route) + '".', ['config', 'surfaces', 'route']);
    }
    const status = surface.status;
    if (typeof status === 'string' && statusIds.size > 0 && !statusIds.has(status)) {
      add('config.surfaces.surface.status.unknown', 'warning', path + '[' + index + '].status', 'Surface status "' + status + '" is not declared in surfaces.statuses.', 'Add "' + status + '" to surfaces.statuses or use one of the declared lifecycle ids.', ['config', 'surfaces', 'status']);
    }
    validateSurfaceStringArray(surface.aliases, path + '[' + index + '].aliases', add);
    validateSurfaceStringArray(surface.files, path + '[' + index + '].files', add);
    validateSurfaceStringArray(surface.evidence, path + '[' + index + '].evidence', add);
    validateSurfaceStringArray(surface.dependsOn, path + '[' + index + '].dependsOn', add);
    validateSurfaceStringArray(surface.coverage, path + '[' + index + '].coverage', add);
    validateSurfaceStringArray(surface.tags, path + '[' + index + '].tags', add);
    if (validateIntentScenario) validateSurfaceIntentScenarioConfig(surface.scenario, path + '[' + index + '].scenario', add);
  }
}

function validateSurfaceIntentScenarioConfig(value: unknown, path: string, add: ConfigDiagnosticAdder): void {
  if (value === undefined || typeof value === 'boolean') return;
  const scenario = readRecord(value);
  if (!scenario) {
    add('config.surfaces.intent.scenario.invalid', 'error', path, 'Surface intent scenario must be a boolean or object.', 'Use scenario: true for a generated browser scenario or an object with expected route assertions.', ['config', 'surfaces', 'intent', 'route-scenarios']);
    return;
  }
  const scenarioPath = scenario.path;
  if (typeof scenarioPath === 'string' && !scenarioPath.startsWith('/')) {
    add('config.surfaces.intent.scenario.path.absolute', 'error', path + '.path', 'Surface intent scenario paths must start with "/".', 'Change this path to "' + ensureLeadingSlash(scenarioPath) + '".', ['config', 'surfaces', 'intent', 'route']);
  }
  validateSurfaceStringArray(scenario.fixtures, path + '.fixtures', add);
  for (const fixtureField of ['authFixture', 'sessionFixture', 'stateFixture']) {
    const fixture = scenario[fixtureField];
    if (fixture !== undefined && (typeof fixture !== 'string' || fixture.trim() === '')) {
      add('config.surfaces.intent.scenario.fixture.invalid', 'error', path + '.' + fixtureField, 'Surface intent scenario fixture refs must be non-empty strings.', 'Reference an app-owned fixture id from routeScenarios.fixtures.', ['config', 'surfaces', 'intent', 'fixtures']);
    }
  }
}

function validateSurfaceStringArray(value: unknown, path: string, add: ConfigDiagnosticAdder): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    add('config.surfaces.surface.stringArray.invalid', 'error', path, path + ' must be an array of non-empty strings.', 'Remove empty values and keep surface refs stable for status queries.', ['config', 'surfaces', 'status']);
  }
}

function validateSurfaceStringRecord(value: unknown, path: string, add: ConfigDiagnosticAdder): void {
  if (value === undefined) return;
  const record = readRecord(value);
  if (!record) {
    add('config.surfaces.surface.stringRecord.invalid', 'error', path, path + ' must be an object mapping non-empty keys to non-empty string arrays.', 'Use { action: ["action"], filter: ["filter"] } style maps for probe configuration.', ['config', 'surfaces', 'coverage']);
    return;
  }
  for (const [key, list] of Object.entries(record)) {
    if (!key.trim() || !Array.isArray(list) || list.some((item) => typeof item !== 'string' || item.trim() === '')) {
      add('config.surfaces.surface.stringRecord.invalid', 'error', path + '.' + key, path + ' entries must be non-empty string arrays keyed by non-empty probe or surface kinds.', 'Remove empty values and keep coverage probe maps explicit.', ['config', 'surfaces', 'coverage']);
    }
  }
}

function validateEndpointConfigs(
  value: unknown,
  add: ConfigDiagnosticAdder
): void {
  if (value === undefined || !Array.isArray(value)) return;
  const paths = new Map<string, number>();
  for (let index = 0; index < value.length; index++) {
    const endpoint = readRecord(value[index]);
    if (!endpoint) continue;
    const pathValue = endpoint.path;
    if (typeof pathValue === 'string') {
      if (!pathValue.startsWith('/')) {
        add('config.backend.endpoint.path.absolute', 'error', 'backend.endpoints[' + index + '].path', 'Backend endpoint paths must start with "/".', 'Change this endpoint path to "' + ensureLeadingSlash(pathValue) + '".', ['config', 'endpoint', 'backend']);
      }
      const endpointKey = String(endpoint.method ?? 'GET').toUpperCase() + ':' + pathValue;
      const duplicateIndex = paths.get(endpointKey);
      if (duplicateIndex !== undefined) {
        add('config.backend.endpoint.path.duplicate', 'error', 'backend.endpoints[' + index + '].path', 'Duplicate backend endpoint method/path also appears at backend.endpoints[' + duplicateIndex + '].path.', 'Keep one endpoint for ' + endpointKey + ' or assign distinct paths/methods.', ['config', 'endpoint', 'backend']);
      } else {
        paths.set(endpointKey, index);
      }
    }
    const method = endpoint.method;
    if (typeof method === 'string' && method !== method.toUpperCase()) {
      add('config.backend.endpoint.method.case', 'warning', 'backend.endpoints[' + index + '].method', 'HTTP methods should be uppercase for stable manifests.', 'Change method to "' + method.toUpperCase() + '".', ['config', 'endpoint', 'backend']);
    }
  }
}

function validateTransportConfigs(
  value: unknown,
  add: ConfigDiagnosticAdder
): void {
  if (value === undefined || !Array.isArray(value)) return;
  const ids = new Set<string>();
  let hasFetch = false;
  let hasSync = false;
  for (let index = 0; index < value.length; index++) {
    const transport = readRecord(value[index]);
    if (!transport) continue;
    const kind = transport.kind;
    if (kind === 'fetch') hasFetch = true;
    if (typeof kind === 'string' && ['crdt-sync', 'crdt-websocket', 'event-log', 'state-cache', 'realtime-websocket', 'custom'].includes(kind)) hasSync = true;
    if (typeof transport.id === 'string') {
      if (ids.has(transport.id)) {
        add('config.backend.transport.id.duplicate', 'error', 'backend.transports[' + index + '].id', 'Transport IDs must be unique.', 'Rename this transport id or remove the duplicate transport.', ['config', 'transport', 'backend']);
      }
      ids.add(transport.id);
    }
    if (typeof transport.path === 'string' && !transport.path.startsWith('/')) {
      add('config.backend.transport.path.absolute', 'warning', 'backend.transports[' + index + '].path', 'Transport paths are normally URL paths beginning with "/".', 'Use a route path such as ' + JSON.stringify(ensureLeadingSlash(transport.path)) + ' or move host-specific URLs into adapter metadata.', ['config', 'transport', 'backend']);
    }
  }
  if (value.length > 0 && !hasFetch) {
    add('config.backend.transport.fetch.missing', 'warning', 'backend.transports', 'No fetch transport is declared, so default API deploy metadata may be incomplete.', 'Add { kind: "fetch", protocol: "http", path: "/api/*", adapter: "fetch-handler" } unless the app truly has no Fetch API surface.', ['config', 'transport', 'backend']);
  }
  if (value.length > 0 && !hasSync) {
    add('config.backend.transport.sync.missing', 'info', 'backend.transports', 'No sync-capable transport is declared.', 'Declare CRDT, event-log, state-cache, realtime, or custom transports when the app needs local-first or replayable backend communication.', ['config', 'transport', 'sync']);
  }
}

function validateViteConfig(
  vite: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const devServer = readRecord(vite.devServer);
  if (
    typeof vite.hmr === 'boolean'
    && devServer
    && typeof devServer.hmr === 'boolean'
    && vite.hmr !== devServer.hmr
  ) {
    add('config.vite.hmr.conflict', 'warning', 'vite.hmr', 'vite.hmr and vite.devServer.hmr disagree; vite.hmr takes precedence.', 'Set only vite.hmr, or make vite.devServer.hmr match it.', ['config', 'vite', 'hmr']);
  }
}

function validateMigrationConfig(
  migrations: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const currentVersion = migrations.currentVersion;
  const initialVersion = migrations.initialVersion;
  if (currentVersion !== undefined && typeof currentVersion === 'string' && currentVersion.trim() === '') {
    add('config.migrations.currentVersion.empty', 'error', 'migrations.currentVersion', 'migrations.currentVersion cannot be empty.', 'Set migrations.currentVersion to the current app data version.', ['config', 'migrations']);
  }
  if (initialVersion !== undefined && typeof initialVersion === 'string' && initialVersion.trim() === '') {
    add('config.migrations.initialVersion.empty', 'error', 'migrations.initialVersion', 'migrations.initialVersion cannot be empty.', 'Set migrations.initialVersion to the oldest supported app data version or remove it.', ['config', 'migrations']);
  }
  const sources = migrations.sources;
  if (!Array.isArray(sources)) return;
  const ids = new Set<string>();
  for (let index = 0; index < sources.length; index++) {
    const source = readRecord(sources[index]);
    if (!source) continue;
    const id = typeof source.id === 'string' ? source.id : String(source.kind ?? index);
    if (ids.has(id)) {
      add('config.migrations.source.id.duplicate', 'error', 'migrations.sources[' + index + '].id', 'Migration source IDs must be unique.', 'Rename this migration source id or remove the duplicate source.', ['config', 'migrations', 'source']);
    }
    ids.add(id);
    if (typeof source.kind !== 'string' || source.kind.trim() === '') {
      add('config.migrations.source.kind.invalid', 'error', 'migrations.sources[' + index + '].kind', 'Migration sources must declare a non-empty kind.', 'Use kind "state", "query-cache", "crdt-snapshot", "event-log-snapshot", "dom-state", or "custom".', ['config', 'migrations', 'source']);
    }
    if (source.required === true && migrations.enabled === false) {
      add('config.migrations.required.disabled', 'warning', 'migrations.sources[' + index + '].required', 'A required migration source is declared while migrations.enabled=false.', 'Enable migrations or mark this source required=false until the app is ready to enforce old-data hydration.', ['config', 'migrations', 'source']);
    }
  }
}

function validateSourcePolicyConfig(
  sourcePolicy: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const preset = sourcePolicy.preset;
  if (preset !== undefined && !['adapter', 'app-wide', 'strict-app', 'migration'].includes(String(preset))) {
    add('config.sourcePolicy.preset.unknown', 'warning', 'sourcePolicy.preset', 'sourcePolicy.preset is not one of the built-in presets.', 'Use "adapter", "app-wide", "strict-app", or "migration", or keep a custom preset name only when another tool owns it.', ['config', 'source-policy', 'preset']);
  }
  const enforcement = sourcePolicy.enforcement;
  if (enforcement !== undefined && enforcement !== 'warn' && enforcement !== 'error') {
    add('config.sourcePolicy.enforcement.invalid', 'error', 'sourcePolicy.enforcement', 'sourcePolicy.enforcement must be "warn" or "error".', 'Set sourcePolicy.enforcement to "error" for strict projects or "warn" during migration.', ['config', 'source-policy']);
  }
  validatePositiveIntegerOrFalse(sourcePolicy.maxFrontierComponentsPerFile, 'sourcePolicy.maxFrontierComponentsPerFile', 'config.sourcePolicy.maxFrontierComponentsPerFile.invalid', add);
  validatePositiveIntegerOrFalse(sourcePolicy.maxLinesPerFile, 'sourcePolicy.maxLinesPerFile', 'config.sourcePolicy.maxLinesPerFile.invalid', add);
  validatePositiveIntegerOrFalse(sourcePolicy.maxCharsPerFile, 'sourcePolicy.maxCharsPerFile', 'config.sourcePolicy.maxCharsPerFile.invalid', add);
  const localImportExtensions = sourcePolicy.localImportExtensions;
  if (localImportExtensions !== undefined && localImportExtensions !== 'source' && localImportExtensions !== 'runtime' && localImportExtensions !== 'off') {
    add('config.sourcePolicy.localImportExtensions.invalid', 'error', 'sourcePolicy.localImportExtensions', 'sourcePolicy.localImportExtensions must be "source", "runtime", or "off".', 'Use "source" for direct .ts/.tsx imports and TypeScript rewriteRelativeImportExtensions for emitted runtime JS.', ['config', 'source-policy', 'imports']);
  }
  const businessLogicSeverity = sourcePolicy.businessLogicSeverity;
  if (
    businessLogicSeverity !== undefined
    && businessLogicSeverity !== 'error'
    && businessLogicSeverity !== 'warning'
    && businessLogicSeverity !== 'info'
    && businessLogicSeverity !== 'hint'
  ) {
    add('config.sourcePolicy.businessLogicSeverity.invalid', 'error', 'sourcePolicy.businessLogicSeverity', 'sourcePolicy.businessLogicSeverity must be "error", "warning", "info", or "hint".', 'Use "error" for strict agent-first projects or "warning" while moving logic into domain modules.', ['config', 'source-policy', 'ast']);
  }
  validateRuntimeModuleConfigs(sourcePolicy.runtimeModules, add);
  if (sourcePolicy.enabled !== false && sourcePolicy.maxFrontierComponentsPerFile === false && sourcePolicy.maxLinesPerFile === false && sourcePolicy.maxCharsPerFile === false && sourcePolicy.localImportExtensions === 'off' && sourcePolicy.businessLogic === false) {
    add('config.sourcePolicy.rules.disabled', 'warning', 'sourcePolicy', 'sourcePolicy is enabled but every built-in rule is disabled.', 'Set sourcePolicy.enabled=false or enable at least one sourcePolicy rule.', ['config', 'source-policy']);
  }
}

function validateRuntimeModuleConfigs(
  value: unknown,
  add: ConfigDiagnosticAdder
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    add('config.sourcePolicy.runtimeModules.invalid', 'error', 'sourcePolicy.runtimeModules', 'sourcePolicy.runtimeModules must be an array.', 'Use defineRuntimeModule(...) entries or remove runtimeModules.', ['config', 'source-policy', 'runtime-modules']);
    return;
  }
  const ids = new Set<string>();
  const ownership = new Map<string, number>();
  for (let index = 0; index < value.length; index++) {
    const runtimeModule = readRecord(value[index]);
    if (!runtimeModule) continue;
    const id = runtimeModule.id;
    if (typeof id !== 'string' || id.trim() === '') {
      add('config.sourcePolicy.runtimeModule.id.invalid', 'error', 'sourcePolicy.runtimeModules[' + index + '].id', 'Runtime modules must declare a non-empty id.', 'Use defineRuntimeModule("runtime.forms", { file: "apps/web/src/runtime/forms.ts", ... }).', ['config', 'source-policy', 'runtime-modules']);
    } else if (ids.has(id)) {
      add('config.sourcePolicy.runtimeModule.id.duplicate', 'error', 'sourcePolicy.runtimeModules[' + index + '].id', 'Runtime module IDs must be unique.', 'Rename this runtime module id or remove the duplicate declaration.', ['config', 'source-policy', 'runtime-modules']);
    } else {
      ids.add(id);
    }
    if (runtimeModule.file !== undefined && (typeof runtimeModule.file !== 'string' || runtimeModule.file.trim() === '')) {
      add('config.sourcePolicy.runtimeModule.file.invalid', 'error', 'sourcePolicy.runtimeModules[' + index + '].file', 'Runtime module file must be a non-empty string.', 'Point file at the controller module that owns this runtime surface.', ['config', 'source-policy', 'runtime-modules']);
    }
    validateRuntimeStringArray(runtimeModule.files, 'sourcePolicy.runtimeModules[' + index + '].files', add);
    validateRuntimeStringArray(runtimeModule.owns, 'sourcePolicy.runtimeModules[' + index + '].owns', add);
    const owns = Array.isArray(runtimeModule.owns) ? runtimeModule.owns.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
    for (const own of owns) {
      const firstIndex = ownership.get(own);
      if (firstIndex !== undefined) {
        add('config.sourcePolicy.runtimeModule.ownership.duplicate', 'error', 'sourcePolicy.runtimeModules[' + index + '].owns', 'Runtime ownership "' + own + '" is already declared by sourcePolicy.runtimeModules[' + firstIndex + '].', 'Keep each controller ownership string in one runtime module so lint can enforce ownership without source text checks.', ['config', 'source-policy', 'runtime-modules']);
      } else {
        ownership.set(own, index);
      }
    }
    if (Array.isArray(runtimeModule.bindings)) {
      for (let bindingIndex = 0; bindingIndex < runtimeModule.bindings.length; bindingIndex++) {
        const binding = readRecord(runtimeModule.bindings[bindingIndex]);
        if (!binding) continue;
        if (typeof binding.kind !== 'string' || binding.kind.trim() === '') {
          add('config.sourcePolicy.runtimeModule.binding.kind.invalid', 'error', 'sourcePolicy.runtimeModules[' + index + '].bindings[' + bindingIndex + '].kind', 'Runtime module bindings must declare a non-empty kind.', 'Use bindDomEvents, bindFormActions, bindToolSurface, bindOfflineSnapshot, or bindTestApi.', ['config', 'source-policy', 'runtime-modules']);
        }
      }
    }
  }
}

function validateRuntimeStringArray(value: unknown, path: string, add: ConfigDiagnosticAdder): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.trim() === '')) {
    add('config.sourcePolicy.runtimeModule.stringArray.invalid', 'error', path, path + ' must be an array of non-empty strings.', 'Remove empty values and keep ownership/capability names stable.', ['config', 'source-policy', 'runtime-modules']);
  }
}

function validateConformanceConfig(
  conformance: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const mode = conformance.mode;
  if (mode !== undefined && !['off', 'migration', 'recommended', 'strict'].includes(String(mode))) {
    add('config.conformance.mode.invalid', 'error', 'conformance.mode', 'conformance.mode must be "off", "migration", "recommended", or "strict".', 'Set conformance.mode to "migration" for warning-only staged ports, "recommended" while integrating packages, or "strict" for locked-down agents.', ['config', 'conformance']);
  }
  const enforcement = conformance.enforcement;
  if (enforcement !== undefined && enforcement !== 'warn' && enforcement !== 'error') {
    add('config.conformance.enforcement.invalid', 'error', 'conformance.enforcement', 'conformance.enforcement must be "warn" or "error".', 'Set conformance.enforcement to "error" when violations should fail builds.', ['config', 'conformance']);
  }
  const requiredPackageUses = conformance.requiredPackageUses;
  if (Array.isArray(requiredPackageUses)) {
    const ids = new Set<string>();
    for (let index = 0; index < requiredPackageUses.length; index++) {
      const use = readRecord(requiredPackageUses[index]);
      if (!use) continue;
      const packageName = use.package;
      if (typeof packageName !== 'string' || packageName.trim() === '') {
        add('config.conformance.requiredPackage.package.invalid', 'error', 'conformance.requiredPackageUses[' + index + '].package', 'Required package-use rules must name a package.', 'Set package to a Frontier package name such as "@shapeshift-labs/frontier-design".', ['config', 'conformance', 'package-use']);
      }
      const id = typeof use.id === 'string' ? use.id : String(packageName ?? index);
      if (ids.has(id)) {
        add('config.conformance.requiredPackage.id.duplicate', 'error', 'conformance.requiredPackageUses[' + index + '].id', 'Required package-use rule IDs must be unique.', 'Rename this package-use rule or remove the duplicate.', ['config', 'conformance', 'package-use']);
      }
      ids.add(id);
      const useMode = use.mode;
      if (useMode !== undefined && !['dependency', 'import', 'dependency-or-import'].includes(String(useMode))) {
        add('config.conformance.requiredPackage.mode.invalid', 'error', 'conformance.requiredPackageUses[' + index + '].mode', 'Required package-use mode must be "dependency", "import", or "dependency-or-import".', 'Use "import" for per-source frontend rules and "dependency-or-import" for generated manifest/tooling rules.', ['config', 'conformance', 'package-use']);
      }
    }
  }
}

function validateHarnessConfig(
  harness: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const mode = harness.mode;
  if (mode !== undefined && !['off', 'recommended', 'strict'].includes(String(mode))) {
    add('config.harness.mode.invalid', 'error', 'harness.mode', 'harness.mode must be "off", "recommended", or "strict".', 'Set harness.mode to "recommended" or "strict".', ['config', 'harness']);
  }
  const autoRun = harness.autoRun;
  if (autoRun !== undefined && !['off', 'plan', 'required'].includes(String(autoRun))) {
    add('config.harness.autoRun.invalid', 'error', 'harness.autoRun', 'harness.autoRun must be "off", "plan", or "required".', 'Set harness.autoRun to "plan" for generated plans or "required" when agents must run harnesses.', ['config', 'harness']);
  }
  if (harness.strict === true && mode === 'off') {
    add('config.harness.strict.off', 'warning', 'harness', 'harness.strict=true conflicts with harness.mode="off".', 'Use harness.mode="strict" or set harness.strict=false.', ['config', 'harness']);
  }
  const commands = harness.commands;
  if (Array.isArray(commands)) {
    const ids = new Set<string>();
    for (let index = 0; index < commands.length; index++) {
      const command = readRecord(commands[index]);
      if (!command || typeof command.id !== 'string') continue;
      if (ids.has(command.id)) {
        add('config.harness.command.id.duplicate', 'error', 'harness.commands[' + index + '].id', 'Harness command IDs must be unique.', 'Rename this command id or remove the duplicate command.', ['config', 'harness']);
      }
      ids.add(command.id);
    }
  }
}

function validateAgentConfig(
  agent: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const maxOpenQuestions = agent.maxOpenQuestions;
  if (maxOpenQuestions !== undefined && (!Number.isInteger(maxOpenQuestions) || Number(maxOpenQuestions) < 0)) {
    add('config.agent.maxOpenQuestions.invalid', 'error', 'agent.maxOpenQuestions', 'agent.maxOpenQuestions must be a non-negative integer.', 'Use 0 for strict handoffs or a small integer such as 3.', ['config', 'agent']);
  }
  if (agent.handoffMode === 'strict' && agent.requireEvidence === false) {
    add('config.agent.strict.requiresEvidence', 'warning', 'agent.requireEvidence', 'Strict handoff mode should require evidence.', 'Set agent.requireEvidence=true or use agent.handoffMode="required".', ['config', 'agent']);
  }
  const checkpoints = agent.checkpoints;
  if (Array.isArray(checkpoints)) {
    const ids = new Set<string>();
    for (let index = 0; index < checkpoints.length; index++) {
      const checkpoint = readRecord(checkpoints[index]);
      if (!checkpoint || typeof checkpoint.id !== 'string') continue;
      if (ids.has(checkpoint.id)) {
        add('config.agent.checkpoint.id.duplicate', 'error', 'agent.checkpoints[' + index + '].id', 'Agent checkpoint IDs must be unique.', 'Rename this checkpoint id or remove the duplicate checkpoint.', ['config', 'agent']);
      }
      ids.add(checkpoint.id);
      if (checkpoint.required === true && checkpoint.query === undefined && checkpoint.command === undefined && checkpoint.artifacts === undefined) {
        add('config.agent.checkpoint.required.noProbe', 'warning', 'agent.checkpoints[' + index + ']', 'Required checkpoints should declare a query, command, or artifacts.', 'Add a machine-checkable query, command, or artifacts list for this required checkpoint.', ['config', 'agent']);
      }
    }
  }
}

function validateDeployConfig(
  deploy: Record<string, unknown>,
  add: ConfigDiagnosticAdder
): void {
  const ids = new Set<string>();
  for (const group of ['frontend', 'backend', 'evidence']) {
    const targets = deploy[group];
    if (!Array.isArray(targets)) continue;
    for (let index = 0; index < targets.length; index++) {
      const target = readRecord(targets[index]);
      if (!target || typeof target.id !== 'string') continue;
      if (ids.has(target.id)) {
        add('config.deploy.target.id.duplicate', 'error', 'deploy.' + group + '[' + index + '].id', 'Deploy target IDs must be unique across frontend, backend, and evidence targets.', 'Rename this deploy target id so evidence can unambiguously link artifacts.', ['config', 'deploy']);
      }
      ids.add(target.id);
    }
  }
}

function validateNormalizedConfig(
  config: NormalizedFrontierFrameworkConfig,
  add: ConfigDiagnosticAdder
): void {
  const outputs = new Map<string, string>();
  for (const [field, value] of [
    ['frontend.outDir', config.frontend.outDir],
    ['backend.outDir', config.backend.outDir],
    ['frontend.evidenceDir', config.frontend.evidenceDir],
    ['vite.outDir', config.vite.outDir]
  ] as const) {
    const owner = outputs.get(value);
    if (owner !== undefined) {
      add('config.outputDir.duplicate', 'error', field, field + ' resolves to the same path as ' + owner + '.', 'Use separate frontend, backend, Vite asset, and evidence output directories.', ['config', 'deploy', 'output']);
    } else {
      outputs.set(value, field);
    }
  }
  if (config.devtools.enabled && !config.devtools.floatingButton && config.devtools.includeInBuild) {
    add('config.devtools.floatingButton.disabled', 'warning', 'devtools.floatingButton', 'Devtools build output is enabled but the floating inspect button is disabled.', 'Set devtools.floatingButton=true so agents can inspect/debug/rewind state in dev mode.', ['config', 'devtools', 'agent']);
  }
}

function validatePositiveIntegerOrFalse(
  value: unknown,
  path: string,
  id: string,
  add: ConfigDiagnosticAdder
): void {
  if (value === undefined || value === false) return;
  if (value === true || !Number.isInteger(value) || Number(value) < 1) {
    add(id, 'error', path, path + ' must be a positive integer or false.', 'Use a positive integer such as 1 or 320, or false to disable just this rule.', ['config', 'source-policy']);
  }
}

type ConfigDiagnosticAdder = (
  id: string,
  severity: FrontierFrameworkConfigDiagnosticSeverity,
  path: string,
  message: string,
  suggestedFix: string,
  tags: readonly string[]
) => void;

function pushConfigDiagnostic(
  diagnostics: FrontierFrameworkConfigDiagnostic[],
  maxDiagnostics: number,
  diagnostic: FrontierFrameworkConfigDiagnostic
): void {
  if (diagnostics.length >= maxDiagnostics) return;
  diagnostics.push(diagnostic);
}

function formatConfigPath(path: readonly (string | number)[]): string {
  if (path.length === 0) return '<root>';
  let output = '';
  for (const segment of path) {
    if (typeof segment === 'number') {
      output += '[' + segment + ']';
    } else if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(segment)) {
      output += output ? '.' + segment : segment;
    } else {
      output += '[' + JSON.stringify(segment) + ']';
    }
  }
  return output;
}

function rootConfigPath(path: string): string {
  if (path === '<root>') return '<root>';
  const bracket = path.indexOf('[');
  const dot = path.indexOf('.');
  const end = Math.min(bracket === -1 ? path.length : bracket, dot === -1 ? path.length : dot);
  return path.slice(0, end) || path;
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : '/' + value.replace(/^\/+/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function readStringProperty(value: unknown, key: string): string | undefined {
  return isRecord(value) && typeof value[key] === 'string' ? value[key] : undefined;
}

function readConfigNameId(value: unknown): string | undefined {
  const name = readStringProperty(value, 'name');
  return name ? slugify(name) : undefined;
}

function normalizeHarnessGate(
  input: FrontierFrameworkHarnessGateConfig | undefined,
  defaults: FrontierFrameworkHarnessGateConfig
): Required<FrontierFrameworkHarnessGateConfig> {
  return {
    required: input?.required ?? defaults.required ?? false,
    command: input?.command ?? defaults.command ?? '',
    files: [...(input?.files ?? defaults.files ?? [])],
    packages: [...(input?.packages ?? defaults.packages ?? [])],
    tags: [...(input?.tags ?? defaults.tags ?? [])]
  };
}

function normalizeAgentCheckpoints(input: readonly FrontierFrameworkAgentCheckpointConfig[] | undefined): Required<FrontierFrameworkAgentCheckpointConfig>[] {
  const seen = new Set<string>();
  const checkpoints: Required<FrontierFrameworkAgentCheckpointConfig>[] = [];
  for (const checkpoint of [...FRONTIER_FRAMEWORK_DEFAULT_AGENT_CHECKPOINTS, ...(input ?? [])]) {
    if (seen.has(checkpoint.id)) continue;
    seen.add(checkpoint.id);
    checkpoints.push({
      id: checkpoint.id,
      title: checkpoint.title,
      source: checkpoint.source ?? 'evidence',
      required: checkpoint.required ?? true,
      query: checkpoint.query ?? '',
      command: checkpoint.command ?? '',
      artifacts: [...(checkpoint.artifacts ?? [])],
      tags: [...(checkpoint.tags ?? [])],
      metadata: checkpoint.metadata ?? {}
    });
  }
  return checkpoints;
}

function normalizeRuntimeModuleBinding(input: FrontierFrameworkRuntimeModuleBindingConfig): FrontierFrameworkRuntimeModuleBindingConfig {
  return {
    kind: input.kind ?? 'custom',
    target: input.target,
    events: [...(input.events ?? [])],
    actions: [...(input.actions ?? [])],
    tools: [...(input.tools ?? [])],
    snapshots: [...(input.snapshots ?? [])],
    tests: [...(input.tests ?? [])],
    reads: [...(input.reads ?? [])],
    writes: [...(input.writes ?? [])],
    capabilities: uniqueStrings(input.capabilities ?? []),
    evidence: [...(input.evidence ?? [])],
    metadata: input.metadata ?? {}
  };
}

function uniqueStrings(values: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function defaultSurfaceStatuses(): FrontierFrameworkSurfaceStatusConfig[] {
  return [
    { id: 'untracked', description: 'Surface is known but has no app-owned implementation claim yet.' },
    { id: 'planned', description: 'Surface is intentionally tracked but not implemented yet.' },
    { id: 'in-progress', description: 'Surface is being implemented or changed.' },
    { id: 'implemented', description: 'Surface has implementation coverage but is not yet verified by evidence.' },
    { id: 'verified', description: 'Surface has linked evidence for its expected behavior.', terminal: true },
    { id: 'blocked', description: 'Surface cannot advance without an external decision or dependency.' },
    { id: 'deprecated', description: 'Surface is intentionally retained for compatibility or removal.', terminal: true }
  ];
}

function titleFromId(id: string): string {
  return id.split(/[-_.:/]+/g).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || id;
}

function sourcePolicyPresetDefaults(
  preset: FrontierFrameworkSourcePolicyPreset,
  workspace: Required<FrontierFrameworkWorkspaceConfig>,
  frontend: Required<Omit<FrontierFrameworkFrontendConfig, 'routes' | 'shell'>>,
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>>
): {
  enforcement: FrontierFrameworkSourcePolicyEnforcement;
  maxFrontierComponentsPerFile: number | false;
  maxLinesPerFile: number | false;
  maxCharsPerFile: number | false;
  localImportExtensions: FrontierFrameworkSourcePolicyLocalImportExtensions;
  businessLogic: boolean;
  include: string[];
} {
  const migration = preset === 'migration';
  const appWide = preset === 'app-wide' || preset === 'strict-app' || migration;
  return {
    enforcement: migration ? 'warn' : 'error',
    maxFrontierComponentsPerFile: 1,
    maxLinesPerFile: 320,
    maxCharsPerFile: 24000,
    localImportExtensions: 'source',
    businessLogic: true,
    include: appWide
      ? defaultAppWideSourcePolicyIncludes(workspace, frontend, backend)
      : defaultSourcePolicyIncludes(workspace, frontend, backend)
  };
}

function defaultAppWideSourcePolicyIncludes(
  workspace: Required<FrontierFrameworkWorkspaceConfig>,
  frontend: Required<Omit<FrontierFrameworkFrontendConfig, 'routes' | 'shell'>>,
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>>
): string[] {
  return [
    joinAppPath(frontend.root, 'src'),
    joinAppPath(backend.root, dirnameAppPath(backend.entry)),
    joinAppPath(workspace.packagesDir, '*/src/**')
  ];
}

function defaultSourcePolicyIncludes(
  workspace: Required<FrontierFrameworkWorkspaceConfig>,
  frontend: Required<Omit<FrontierFrameworkFrontendConfig, 'routes' | 'shell'>>,
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>>
): string[] {
  return [
    joinAppPath(frontend.root, frontend.routesDir),
    joinAppPath(frontend.root, frontend.componentsDir),
    joinAppPath(backend.root, dirnameAppPath(backend.entry)),
    joinAppPath(workspace.packagesDir, 'domain', 'src'),
    joinAppPath(workspace.packagesDir, workspace.contractsPackage, 'src')
  ];
}

function defaultSourcePolicyExcludes(): string[] {
  return [
    'node_modules/**',
    'dist/**',
    '.frontier-framework/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.stories.*'
  ];
}

function defaultDomainRoots(workspace: Required<FrontierFrameworkWorkspaceConfig>): string[] {
  return [
    joinAppPath(workspace.packagesDir, 'domain', 'src'),
    joinAppPath(workspace.packagesDir, workspace.contractsPackage, 'src', 'domain'),
    joinAppPath(workspace.packagesDir, workspace.contractsPackage, 'src'),
    'src/domain',
    'domain'
  ];
}

function defaultRequiredPackageUses(
  frontend: Required<Omit<FrontierFrameworkFrontendConfig, 'routes' | 'shell'>>,
  backend: Required<Omit<FrontierFrameworkBackendConfig, 'endpoints' | 'transports'>> & { transports: FrontierFrameworkBackendTransportConfig[] },
  componentPreview: Required<Omit<FrontierFrameworkComponentPreviewConfig, 'packageName' | 'generatedAt' | 'defaultVariants' | 'integrations'>>,
  documentation: NormalizedFrontierFrameworkConfig['documentation'],
  migrations: Required<Omit<FrontierFrameworkMigrationsConfig, 'sources'>> & { sources: Required<FrontierFrameworkMigrationSourceConfig>[] },
  telemetry: Required<FrontierFrameworkTelemetryConfig>,
  auth: NormalizedFrontierFrameworkConfig['auth']
): FrontierFrameworkRequiredPackageUseConfig[] {
  const frontendTsx = [
    joinAppPath(frontend.root, frontend.routesDir, '**/*.tsx'),
    joinAppPath(frontend.root, frontend.routesDir, '**/*.jsx'),
    joinAppPath(frontend.root, frontend.componentsDir, '**/*.tsx'),
    joinAppPath(frontend.root, frontend.componentsDir, '**/*.jsx')
  ];
  const uses: FrontierFrameworkRequiredPackageUseConfig[] = [
    {
      id: 'frontend-frontier-dom',
      package: '@shapeshift-labs/frontier-dom',
      mode: 'import',
      perSource: true,
      filePatterns: frontendTsx,
      reason: 'JSX/TSX frontend files in Frontier framework projects should use the Frontier DOM runtime rather than untracked host JSX.',
      tags: ['frontend', 'dom', 'jsx']
    },
    {
      id: 'frontend-frontier-design',
      package: '@shapeshift-labs/frontier-design',
      mode: 'import',
      perSource: true,
      filePatterns: frontendTsx,
      reason: 'Frontend source must route visual decisions through Frontier design tokens, recipes, or CSS variable output.',
      tags: ['frontend', 'design']
    },
    {
      id: 'frontend-frontier-route',
      package: '@shapeshift-labs/frontier-route',
      mode: 'dependency-or-import',
      resourceKinds: ['route'],
      reason: 'Route surfaces should be represented in Frontier route manifests.',
      tags: ['frontend', 'route']
    },
    {
      id: 'frontend-frontier-view',
      package: '@shapeshift-labs/frontier-view',
      mode: 'dependency-or-import',
      resourceKinds: ['route', 'view', 'component'],
      filePatterns: frontendTsx,
      reason: 'Frontend representation should have a Frontier view surface for tests, previews, and agent inspection.',
      tags: ['frontend', 'view']
    },
    {
      id: 'frontend-component-preview',
      package: '@shapeshift-labs/frontier-component-preview',
      mode: 'dependency-or-import',
      required: componentPreview.enabled,
      filePatterns: [
        joinAppPath(frontend.root, frontend.componentsDir, '**/*.tsx'),
        joinAppPath(frontend.root, frontend.componentsDir, '**/*.jsx')
      ],
      reason: 'Component sources should be discoverable by the Frontier preview book and evidence harness.',
      tags: ['frontend', 'component-preview']
    },
    {
      id: 'frontier-documentation',
      package: '@shapeshift-labs/frontier-documentation',
      mode: 'dependency-or-import',
      required: documentation.enabled,
      filePatterns: [
        'README.md',
        'docs/**/*',
        'features/**/*.json',
        joinAppPath(frontend.root, frontend.routesDir, '**/*.{ts,tsx,js,jsx}'),
        joinAppPath(frontend.root, frontend.componentsDir, '**/*.{ts,tsx,js,jsx}'),
        joinAppPath(backend.root, '**/*.{ts,js}')
      ],
      reason: 'Agent-facing apps should emit Frontier documentation manifests, search records, docs evidence, and generated docs books.',
      tags: ['documentation', 'docs', 'agent']
    },
    {
      id: 'source-frontier-ast-walk',
      package: '@shapeshift-labs/frontier-ast-walk',
      mode: 'dependency-or-import',
      resourceTags: ['ast-walk'],
      filePatterns: [
        ...frontendTsx,
        joinAppPath(backend.root, '**/*.ts'),
        joinAppPath(backend.root, '**/*.js'),
        'packages/**/src/**/*.{ts,tsx,js,jsx}'
      ],
      reason: 'Source graph and business-logic placement evidence should be generated through frontier-ast-walk.',
      tags: ['source-graph', 'ast-walk', 'business-logic']
    },
    {
      id: 'runtime-migrations',
      package: '@shapeshift-labs/frontier-migrations',
      mode: 'dependency-or-import',
      required: migrations.enabled,
      filePatterns: ['frontier.config.*', 'packages/**/src/**/*.{ts,tsx,js,jsx}', joinAppPath(backend.root, '**/*.ts'), joinAppPath(backend.root, '**/*.js')],
      reason: 'Persisted state, cache, CRDT, and event-log ingress must migrate through Frontier migrations before hydration.',
      tags: ['migrations', 'runtime-data']
    },
    {
      id: 'auth-frontier-auth',
      package: '@shapeshift-labs/frontier-auth',
      mode: 'dependency-or-import',
      required: auth.enabled,
      resourceTags: ['auth'],
      filePatterns: ['frontier.config.*', joinAppPath(backend.root, '**/*.ts'), joinAppPath(backend.root, '**/*.js'), ...frontendTsx],
      reason: 'Auth-sensitive frontend, backend, realtime, CRDT, cache, and service-token surfaces should be represented by Frontier auth manifests and evidence.',
      tags: ['auth', 'session', 'gate', 'runtime']
    },
    {
      id: 'harness-frontier-test',
      package: '@shapeshift-labs/frontier-test',
      mode: 'dependency-or-import',
      reason: 'Agent-first projects should emit reusable Frontier test manifests and coverage gates.',
      tags: ['test', 'harness', 'agent']
    },
    {
      id: 'harness-frontier-linter',
      package: '@shapeshift-labs/frontier-linter',
      mode: 'dependency-or-import',
      reason: 'Agent-first projects should produce lint diagnostics and SARIF from the Frontier project graph.',
      tags: ['lint', 'sarif', 'agent']
    },
    {
      id: 'agent-frontier-workflow',
      package: '@shapeshift-labs/frontier-workflow',
      mode: 'dependency-or-import',
      reason: 'Agent handoff should be backed by a Frontier workflow manifest and proof.',
      tags: ['agent', 'workflow']
    }
  ];
  for (const transport of backend.transports) {
    if (transport.package) {
      uses.push({
        id: 'transport-' + slugify(transport.kind + '-' + transport.package),
        package: transport.package,
        mode: 'dependency-or-import',
        required: transport.required ?? true,
        resourceTags: ['transport', transport.kind],
        reason: 'Declared backend transport "' + transport.kind + '" should have its Frontier adapter package available.',
        tags: ['backend', 'transport', transport.kind]
      });
    }
    if (transport.adapter?.startsWith('@shapeshift-labs/')) {
      uses.push({
        id: 'transport-adapter-' + slugify(transport.kind + '-' + transport.adapter),
        package: transport.adapter,
        mode: 'dependency-or-import',
        required: transport.required ?? true,
        resourceTags: ['transport', transport.kind],
        reason: 'Declared backend transport "' + transport.kind + '" should have its Frontier adapter available.',
        tags: ['backend', 'transport', transport.kind]
      });
    }
  }
  if (telemetry.enabled) {
    if (telemetry.logging) uses.push({ id: 'telemetry-frontier-logging', package: '@shapeshift-labs/frontier-logging', mode: 'dependency-or-import', reason: 'Enabled telemetry.logging should write through Frontier logging sinks.', tags: ['telemetry', 'logging'] });
    if (telemetry.trace) uses.push({ id: 'telemetry-frontier-trace', package: '@shapeshift-labs/frontier-trace', mode: 'dependency-or-import', reason: 'Enabled telemetry.trace should emit Frontier trace records.', tags: ['telemetry', 'trace'] });
    if (telemetry.inspect) uses.push({ id: 'telemetry-frontier-inspect', package: '@shapeshift-labs/frontier-inspect', mode: 'dependency-or-import', reason: 'Enabled telemetry.inspect should produce Frontier inspection bundles.', tags: ['telemetry', 'inspect'] });
  }
  return uses;
}

function normalizeRequiredPackageUses(uses: readonly FrontierFrameworkRequiredPackageUseConfig[]): FrontierFrameworkRequiredPackageUseConfig[] {
  const byId = new Map<string, FrontierFrameworkRequiredPackageUseConfig>();
  for (const use of uses) {
    if (!use.package) continue;
    const id = use.id ?? 'required-package:' + use.package;
    byId.set(id, {
      ...use,
      id,
      mode: use.mode ?? 'dependency-or-import',
      required: use.required ?? true,
      perSource: use.perSource ?? false,
      resourceKinds: [...(use.resourceKinds ?? [])],
      resourceTags: [...(use.resourceTags ?? [])],
      filePatterns: expandConformanceFilePatterns(use.filePatterns ?? []),
      importPatterns: [...(use.importPatterns ?? [])],
      textPatterns: [...(use.textPatterns ?? [])],
      tags: [...(use.tags ?? [])],
      metadata: use.metadata ?? {}
    });
  }
  return Array.from(byId.values());
}

function expandConformanceFilePatterns(patterns: readonly string[]): string[] {
  const out: string[] = [];
  for (const pattern of patterns) {
    const brace = pattern.match(/\{([^{}]+)\}/);
    if (!brace) {
      out.push(pattern);
      continue;
    }
    for (const part of brace[1].split(',')) {
      out.push(pattern.slice(0, brace.index) + part.trim() + pattern.slice((brace.index ?? 0) + brace[0].length));
    }
  }
  return out;
}

function defaultHarnessCommands(mode: FrontierFrameworkHarnessMode): FrontierFrameworkHarnessCommandConfig[] {
  const strict = mode === 'strict';
  return [
    { id: 'tests', kind: 'test', command: 'npm test', required: true, tags: ['test'] },
    { id: 'fuzzers', kind: 'fuzz', command: 'npm run fuzz', required: strict, tags: ['fuzz'] },
    { id: 'benchmarks', kind: 'benchmark', command: 'npm run bench', required: strict, tags: ['benchmark'] },
    { id: 'browser', kind: 'browser', command: 'npm run browser', required: strict, tags: ['browser', 'playwright', 'frontier-playwright'] },
    { id: 'linter', kind: 'lint', command: 'frontier lint', required: true, tags: ['lint', 'conformance'] },
    { id: 'evidence', kind: 'evidence', command: 'frontier inspect --json', required: true, tags: ['evidence', 'inspect'] },
    { id: 'agent', kind: 'agent', command: 'frontier agent --json', required: true, tags: ['agent', 'handoff'] }
  ];
}

function joinAppPath(...parts: string[]): string {
  return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

function joinUrlPath(base: string, path: string): string {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return path;
  const normalizedPath = ensureLeadingSlash(path);
  if (base === '/' || base === '') return normalizedPath;
  return base.replace(/\/+$/, '') + normalizedPath;
}

function dirnameAppPath(file: string): string {
  const normalized = file.replace(/\\/g, '/');
  const index = normalized.lastIndexOf('/');
  return index === -1 ? '.' : normalized.slice(0, index);
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'frontier-framework';
}
