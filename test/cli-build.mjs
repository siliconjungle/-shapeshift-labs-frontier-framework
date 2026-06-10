import assert from 'node:assert';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cli = path.join(packageDir, 'dist', 'cli.js');
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'frontier-framework-'));
const CLI_JSON_MAX_BUFFER = 32 * 1024 * 1024;

execFileSync(process.execPath, [cli, 'init', 'fixture', '--name', 'Fixture Frontier', '--no-install'], {
  cwd: tmp,
  stdio: 'pipe'
});

const appDir = path.join(tmp, 'fixture');
execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
});

const frontend = path.join(appDir, 'dist', 'frontend', 'index.html');
const devtools = path.join(appDir, 'dist', 'frontend', 'frontier-devtools.js');
const backend = path.join(appDir, 'dist', 'backend', 'adapter.json');
const transports = path.join(appDir, 'dist', 'backend', 'transports.json');
const evidence = path.join(appDir, 'dist', 'frontier', 'evidence.json');
const routeScenarioEvidence = path.join(appDir, 'dist', 'frontier', 'route-scenarios.json');
const routeScenarioPlaywrightEvidence = path.join(appDir, 'dist', 'frontier', 'route-scenario-playwright.json');
const surfacesEvidence = path.join(appDir, 'dist', 'frontier', 'surfaces.json');
const surfaceCoverageEvidence = path.join(appDir, 'dist', 'frontier', 'surface-coverage.json');
const devtoolsBridge = path.join(appDir, 'dist', 'frontier', 'devtools-bridge.json');
const sourcePolicyEvidence = path.join(appDir, 'dist', 'frontier', 'source-policy.json');
const sourceGraphEvidence = path.join(appDir, 'dist', 'frontier', 'source-graph.json');
const sourceRegistryEvidence = path.join(appDir, 'dist', 'frontier', 'source-registry.json');
const conformanceEvidence = path.join(appDir, 'dist', 'frontier', 'conformance.json');
const conformanceSarif = path.join(appDir, 'dist', 'frontier', 'conformance.sarif');
const configValidationEvidence = path.join(appDir, 'dist', 'frontier', 'config-validation.json');
const authEvidence = path.join(appDir, 'dist', 'frontier', 'auth.json');
const generatedAuthManifest = path.join(appDir, '.frontier-framework', 'auth', 'auth-manifest.json');
const generatedAuthRegistry = path.join(appDir, '.frontier-framework', 'auth', 'auth-registry.json');
const migrationsEvidence = path.join(appDir, 'dist', 'frontier', 'migrations.json');
const generatedMigrationsManifest = path.join(appDir, '.frontier-framework', 'migrations', 'migrations.json');
const generatedMigrationsBridge = path.join(appDir, '.frontier-framework', 'migrations', 'frontier-runtime-migrations.mjs');
const generatedRouteScenarioManifest = path.join(appDir, '.frontier-framework', 'route-scenarios', 'manifest.json');
const generatedRouteScenarioPlan = path.join(appDir, '.frontier-framework', 'route-scenarios', 'playwright-plan.json');
const generatedSurfaceRegistry = path.join(appDir, '.frontier-framework', 'surfaces', 'registry.json');
const generatedSurfaceCoverage = path.join(appDir, '.frontier-framework', 'surfaces', 'coverage.json');
const generatedSurfaceDashboard = path.join(appDir, '.frontier-framework', 'surfaces', 'dashboard.md');
const generatedSurfaceLoop = path.join(appDir, '.frontier-framework', 'agent', 'surface-loop.json');
const generatedSurfaceLoopDashboard = path.join(appDir, '.frontier-framework', 'agent', 'surface-loop.md');
const harnessEvidence = path.join(appDir, 'dist', 'frontier', 'harness', 'evidence.json');
const harnessPlan = path.join(appDir, '.frontier-framework', 'harness', 'harness-plan.json');
const frontendCache = path.join(appDir, '.frontier-framework', 'cache', 'frontend', 'routes.json');
const componentPreviewHtml = path.join(appDir, '.frontier-framework', 'component-preview', 'index.html');
const componentPreviewManifest = path.join(appDir, '.frontier-framework', 'component-preview', 'manifest.json');
const componentPreviewModule = path.join(appDir, '.frontier-framework', 'component-preview', 'preview-module.mjs');
const componentPreviewProof = path.join(appDir, '.frontier-framework', 'component-preview', 'proof.json');
const componentPreviewEvidence = path.join(appDir, 'dist', 'frontier', 'component-preview.json');
const documentationHtml = path.join(appDir, '.frontier-framework', 'documentation', 'index.html');
const documentationManifest = path.join(appDir, '.frontier-framework', 'documentation', 'manifest.json');
const documentationModule = path.join(appDir, '.frontier-framework', 'documentation', 'docs-module.mjs');
const documentationSearch = path.join(appDir, '.frontier-framework', 'documentation', 'search.json');
const documentationProof = path.join(appDir, '.frontier-framework', 'documentation', 'proof.json');
const documentationJsonl = path.join(appDir, '.frontier-framework', 'documentation', 'documentation.jsonl');
const documentationEvidence = path.join(appDir, 'dist', 'frontier', 'documentation.json');
const generatedFuzzer = path.join(appDir, '.frontier-framework', 'harness', 'frontier-fuzz.mjs');
const generatedBench = path.join(appDir, '.frontier-framework', 'harness', 'frontier-bench.mjs');
const generatedBrowser = path.join(appDir, '.frontier-framework', 'harness', 'frontier-browser-smoke.mjs');
const agentManifest = path.join(appDir, '.frontier-framework', 'agent', 'agent-manifest.json');
const agentRunbook = path.join(appDir, '.frontier-framework', 'agent', 'AGENT-RUNBOOK.md');
const agentCheck = path.join(appDir, '.frontier-framework', 'agent', 'frontier-agent-check.mjs');
const agentMcpTools = path.join(appDir, '.frontier-framework', 'agent', 'mcp-tools.json');
const agentToolManifest = path.join(appDir, '.frontier-framework', 'agent', 'tool-manifest.json');
const agentCiGates = path.join(appDir, '.frontier-framework', 'agent', 'ci-evidence-gates.json');
const agentLintReport = path.join(appDir, '.frontier-framework', 'agent', 'frontier-agent-lint.json');
const agentSarif = path.join(appDir, '.frontier-framework', 'agent', 'frontier-agent-lint.sarif');
const agentWorkflow = path.join(appDir, '.frontier-framework', 'agent', 'agent-workflow.json');
const agentWorkflowProof = path.join(appDir, '.frontier-framework', 'agent', 'agent-workflow-proof.json');
const agentReplay = path.join(appDir, '.frontier-framework', 'agent', 'frontier-agent-replay.mjs');
const agentIssueHandoff = path.join(appDir, '.frontier-framework', 'agent', 'ISSUE-HANDOFF.md');
const agentPrHandoff = path.join(appDir, '.frontier-framework', 'agent', 'PR-HANDOFF.md');
const corpusSeed = path.join(appDir, 'test', 'fixtures', 'frontier-framework-corpus', 'seed-route-transport.json');
const scaffoldTsconfig = path.join(appDir, 'tsconfig.json');

assert.ok(existsSync(frontend), 'frontend index should be emitted');
assert.ok(existsSync(devtools), 'devtools overlay should be emitted');
assert.ok(existsSync(backend), 'backend adapter contract should be emitted');
assert.ok(existsSync(transports), 'backend transport contract should be emitted');
assert.ok(existsSync(evidence), 'evidence summary should be emitted');
assert.ok(existsSync(routeScenarioEvidence), 'route scenario evidence should be emitted');
assert.ok(existsSync(routeScenarioPlaywrightEvidence), 'route scenario Playwright evidence should be emitted');
assert.ok(existsSync(surfacesEvidence), 'surface registry evidence should be emitted');
assert.ok(existsSync(surfaceCoverageEvidence), 'surface coverage evidence should be emitted');
assert.ok(existsSync(devtoolsBridge), 'devtools bridge summary should be emitted');
assert.ok(existsSync(sourcePolicyEvidence), 'source policy evidence should be emitted');
assert.ok(existsSync(sourceGraphEvidence), 'source graph evidence should be emitted');
assert.ok(existsSync(sourceRegistryEvidence), 'source registry evidence should be emitted');
assert.ok(existsSync(conformanceEvidence), 'conformance evidence should be emitted');
assert.ok(existsSync(conformanceSarif), 'conformance SARIF should be emitted');
assert.ok(existsSync(configValidationEvidence), 'config validation evidence should be emitted');
assert.ok(existsSync(authEvidence), 'auth evidence should be emitted');
assert.ok(existsSync(generatedAuthManifest), 'generated auth manifest should be emitted');
assert.ok(existsSync(generatedAuthRegistry), 'generated auth registry should be emitted');
assert.ok(existsSync(migrationsEvidence), 'migration evidence should be emitted');
assert.ok(existsSync(generatedMigrationsManifest), 'generated migrations manifest should be emitted');
assert.ok(existsSync(generatedMigrationsBridge), 'generated migrations bridge should be emitted');
assert.ok(existsSync(generatedRouteScenarioManifest), 'generated route scenario manifest should be emitted');
assert.ok(existsSync(generatedRouteScenarioPlan), 'generated route scenario Playwright plan should be emitted');
assert.ok(existsSync(generatedSurfaceRegistry), 'generated surface status registry should be emitted');
assert.ok(existsSync(generatedSurfaceCoverage), 'generated surface coverage report should be emitted');
assert.ok(existsSync(generatedSurfaceDashboard), 'generated surface dashboard should be emitted');
assert.ok(existsSync(generatedSurfaceLoop), 'generated agent surface loop should be emitted');
assert.ok(existsSync(generatedSurfaceLoopDashboard), 'generated agent surface loop dashboard should be emitted');
assert.ok(existsSync(harnessEvidence), 'harness evidence should be emitted');
assert.ok(existsSync(harnessPlan), 'generated harness plan should be emitted');
assert.ok(existsSync(frontendCache), 'frontend build cache should be emitted');
assert.ok(existsSync(componentPreviewHtml), 'component preview book should be emitted');
assert.ok(existsSync(componentPreviewManifest), 'component preview manifest should be emitted');
assert.ok(existsSync(componentPreviewModule), 'component preview module should be emitted');
assert.ok(existsSync(componentPreviewProof), 'component preview proof should be emitted');
assert.ok(existsSync(componentPreviewEvidence), 'component preview evidence should be emitted');
assert.ok(existsSync(documentationHtml), 'documentation book should be emitted');
assert.ok(existsSync(documentationManifest), 'documentation manifest should be emitted');
assert.ok(existsSync(documentationModule), 'documentation module should be emitted');
assert.ok(existsSync(documentationSearch), 'documentation search index should be emitted');
assert.ok(existsSync(documentationProof), 'documentation proof should be emitted');
assert.ok(existsSync(documentationJsonl), 'documentation JSONL should be emitted');
assert.ok(existsSync(documentationEvidence), 'documentation evidence should be emitted');
assert.ok(existsSync(generatedFuzzer), 'generated fuzzer should be emitted');
assert.ok(existsSync(generatedBench), 'generated benchmark should be emitted');
assert.ok(existsSync(generatedBrowser), 'generated browser harness should be emitted');
assert.ok(existsSync(agentManifest), 'agent manifest should be emitted');
assert.ok(existsSync(agentRunbook), 'agent runbook should be emitted');
assert.ok(existsSync(agentCheck), 'agent check script should be emitted');
assert.ok(existsSync(agentMcpTools), 'agent MCP tools should be emitted');
assert.ok(existsSync(agentToolManifest), 'agent tool manifest should be emitted');
assert.ok(existsSync(agentCiGates), 'agent CI gates should be emitted');
assert.ok(existsSync(agentLintReport), 'agent linter report should be emitted');
assert.ok(existsSync(agentSarif), 'agent SARIF should be emitted');
assert.ok(existsSync(agentWorkflow), 'agent workflow should be emitted');
assert.ok(existsSync(agentWorkflowProof), 'agent workflow proof should be emitted');
assert.ok(existsSync(agentReplay), 'agent replay script should be emitted');
assert.ok(existsSync(agentIssueHandoff), 'agent issue handoff should be emitted');
assert.ok(existsSync(agentPrHandoff), 'agent PR handoff should be emitted');
assert.ok(existsSync(corpusSeed), 'generated corpus seed should be emitted');

const html = await fs.readFile(frontend, 'utf8');
assert.ok(html.includes('frontier-framework'), 'frontend shell should include the app root');
assert.ok(html.includes('Increment'), 'imported component TSX should compile into HTML');
assert.ok(html.includes('frontier-devtools.js'), 'frontend should load the devtools overlay');

const overlay = await fs.readFile(devtools, 'utf8');
assert.ok(overlay.includes('rewindOneStep'), 'devtools overlay should include rewind support');
assert.ok(overlay.includes('recordPatch'), 'devtools overlay should include patch recording support');
assert.ok(overlay.includes('recordCrdtUpdate'), 'devtools overlay should include CRDT recording support');
assert.ok(overlay.includes('recordEventLogEntry'), 'devtools overlay should include event-log recording support');
assert.ok(overlay.includes('recordTrace'), 'devtools overlay should include trace recording support');
assert.ok(overlay.includes('recordTelemetry'), 'devtools overlay should include telemetry recording support');

const devtoolsBridgeSummary = JSON.parse(await fs.readFile(devtoolsBridge, 'utf8'));
assert.strictEqual(devtoolsBridgeSummary.kind, 'frontier.framework.devtools.bridge.summary');
assert.ok(devtoolsBridgeSummary.methods.includes('recordPatch'));
assert.ok(devtoolsBridgeSummary.methods.includes('recordCrdtUpdate'));
assert.ok(devtoolsBridgeSummary.methods.includes('recordEventLogEntry'));
assert.strictEqual(devtoolsBridgeSummary.channels.crdt, true);

const frontendCacheSummary = JSON.parse(await fs.readFile(frontendCache, 'utf8'));
const frontendCacheRoutes = Object.values(frontendCacheSummary.routes);
assert.ok(frontendCacheRoutes.some((route) => route.configFingerprint && route.dependencyStats?.length > 0), 'frontend cache should store config fingerprints and dependency stats');

const previewHtml = await fs.readFile(componentPreviewHtml, 'utf8');
assert.ok(previewHtml.includes('Fixture Frontier Component Previews'), 'component preview book should use framework title');
assert.ok(previewHtml.includes('Home View'), 'component preview book should list discovered components');
const previewManifest = JSON.parse(await fs.readFile(componentPreviewManifest, 'utf8'));
assert.strictEqual(previewManifest.kind, 'frontier.component-preview.manifest');
assert.ok(previewManifest.entries.some((entry) => entry.component === 'HomeView'), 'component preview manifest should include HomeView');
const previewProof = JSON.parse(await fs.readFile(componentPreviewProof, 'utf8'));
assert.strictEqual(previewProof.kind, 'frontier.component-preview.proof');
assert.strictEqual(previewProof.entries, previewManifest.entries.length);
const previewEvidence = JSON.parse(await fs.readFile(componentPreviewEvidence, 'utf8'));
assert.strictEqual(previewEvidence.kind, 'frontier.framework.component-preview.build');
assert.ok(previewEvidence.entries >= 1);
assert.ok(previewEvidence.artifacts.some((artifact) => artifact.file.endsWith('component-preview/index.html')));

const docsHtml = await fs.readFile(documentationHtml, 'utf8');
assert.ok(docsHtml.includes('Fixture Frontier Documentation'), 'documentation book should use framework title');
const docsManifest = JSON.parse(await fs.readFile(documentationManifest, 'utf8'));
assert.strictEqual(docsManifest.kind, 'frontier.documentation.manifest');
assert.ok(docsManifest.pages.length >= 1, 'documentation manifest should include discovered pages');
const docsProof = JSON.parse(await fs.readFile(documentationProof, 'utf8'));
assert.strictEqual(docsProof.kind, 'frontier.documentation.proof');
assert.strictEqual(docsProof.pages, docsManifest.pages.length);
const docsSearch = JSON.parse(await fs.readFile(documentationSearch, 'utf8'));
assert.ok(docsSearch.length >= docsManifest.pages.length, 'documentation search should cover pages');
const docsEvidence = JSON.parse(await fs.readFile(documentationEvidence, 'utf8'));
assert.strictEqual(docsEvidence.kind, 'frontier.framework.documentation.build');
assert.ok(docsEvidence.pages >= 1);
assert.ok(docsEvidence.proof.digest);
assert.ok(docsEvidence.artifacts.some((artifact) => artifact.file.endsWith('documentation/index.html')));

const docsBuildOutput = execFileSync(process.execPath, [cli, 'docs', 'build', '--cwd', appDir, '--json'], {
  stdio: 'pipe',
  maxBuffer: CLI_JSON_MAX_BUFFER
}).toString();
const docsBuildSummary = JSON.parse(docsBuildOutput);
assert.strictEqual(docsBuildSummary.kind, 'frontier.framework.documentation.build');
assert.ok(docsBuildSummary.pages >= 1);
assert.ok(docsBuildSummary.searchRecords >= docsBuildSummary.pages);
const docsLintOutput = execFileSync(process.execPath, [cli, 'docs', 'lint', '--cwd', appDir, '--json'], {
  stdio: 'pipe',
  maxBuffer: CLI_JSON_MAX_BUFFER
}).toString();
const docsLintSummary = JSON.parse(docsLintOutput);
assert.strictEqual(docsLintSummary.kind, 'frontier.framework.documentation.lint');
assert.strictEqual(docsLintSummary.ok, true);
const docsJsonlOutput = execFileSync(process.execPath, [cli, 'docs', 'jsonl', '--cwd', appDir], {
  stdio: 'pipe',
  maxBuffer: CLI_JSON_MAX_BUFFER
}).toString();
assert.ok(docsJsonlOutput.includes('frontier.documentation.proof'));

const contract = JSON.parse(await fs.readFile(backend, 'utf8'));
assert.strictEqual(contract.contract, 'fetch-handler');
assert.ok(contract.adapters.includes('custom'));
assert.ok(contract.transports.some((transport) => transport.kind === 'crdt-websocket'));

const transportManifest = JSON.parse(await fs.readFile(transports, 'utf8'));
assert.ok(transportManifest.transports.some((transport) => transport.kind === 'event-log'));

const summary = JSON.parse(await fs.readFile(evidence, 'utf8'));
assert.strictEqual(summary.appId, 'fixture-frontier');
assert.ok(summary.routes.some((route) => route.path === '/'));
assert.strictEqual(summary.devtools.emitted, true);
assert.strictEqual(summary.vite.enabled, true);
assert.strictEqual(summary.vite.hmr, true);
assert.ok(summary.transports.some((transport) => transport.kind === 'state-cache'));
assert.ok(summary.research.some((item) => item.id === 'property-fuzz-corpus'));
assert.ok(summary.runtimeAdapters.some((adapter) => adapter.id === 'nitro.presets'));
assert.ok(summary.syncAdapters.some((adapter) => adapter.id === 'automerge.repo'));
assert.ok(summary.devtoolsBridge.methods.includes('recordTelemetry'));
assert.strictEqual(summary.devtoolsBridge.channels.eventLog, true);
assert.strictEqual(summary.componentPreview.kind, 'frontier.framework.component-preview.build');
assert.ok(summary.componentPreview.entries >= 1);
assert.ok(summary.componentPreview.proof.digest);
assert.strictEqual(summary.documentation.kind, 'frontier.framework.documentation.build');
assert.ok(summary.documentation.pages >= 1);
assert.ok(summary.documentation.proof.digest);
assert.strictEqual(summary.sourcePolicy.kind, 'frontier.framework.source-policy.report');
assert.strictEqual(summary.sourcePolicy.ok, true);
assert.strictEqual(summary.sourcePolicy.preset, 'strict-app');
assert.strictEqual(summary.sourcePolicy.rules.maxFrontierComponentsPerFile, 1);
assert.strictEqual(summary.sourcePolicy.rules.maxCharsPerFile, 24000);
assert.strictEqual(summary.sourcePolicy.rules.localImportExtensions, 'source');
assert.strictEqual(summary.sourcePolicy.rules.businessLogic, true);
assert.ok(summary.sourcePolicy.runtimeModules.some((module) => module.id === 'runtime.forms' && module.owns.includes('form-actions')));
assert.strictEqual(summary.sourcePolicy.sourceGraph.kind, 'frontier.ast-walk.source-graph');
assert.strictEqual(summary.sourcePolicy.sourceGraph.summary.businessLogicFindingCount, 0);
assert.strictEqual(summary.conformance.kind, 'frontier.framework.conformance.report');
assert.strictEqual(summary.conformance.ok, true);
assert.strictEqual(summary.conformance.lint.summary.errorCount, 0);
assert.ok(summary.conformance.requiredPackageUses.some((use) => use.id === 'frontend-frontier-design'));
assert.strictEqual(summary.configValidation.kind, 'frontier.framework.config.validation');
assert.strictEqual(summary.configValidation.ok, true);
assert.ok(summary.configValidation.explain.some((entry) => entry.path === 'frontend.routes'));
assert.strictEqual(summary.auth.kind, 'frontier.auth.evidence');
assert.ok(summary.auth.manifest.providers.some((provider) => provider.id === 'frontier-session'));
assert.ok(summary.auth.manifest.gates.some((gate) => gate.tags.includes('transport') && gate.required === true));
assert.ok(summary.auth.manifest.tokenContracts.some((contract) => contract.id === 'runtime-room'));
assert.ok(summary.auth.lintResources.some((resource) => resource.tags.includes('auth')));
assert.strictEqual(summary.migrations.kind, 'frontier.framework.migrations.manifest');
assert.ok(summary.migrations.sources.some((source) => source.kind === 'query-cache'));
assert.strictEqual(summary.routeScenarios.kind, 'frontier.framework.route-scenario.manifest');
assert.strictEqual(summary.routeScenarioPlaywright.kind, 'frontier.framework.route-scenario.playwright-plan');
assert.strictEqual(summary.surfaces.kind, 'frontier.framework.surface-status.registry');
assert.ok(summary.surfaces.surfaces.some((surface) => surface.kind === 'filter'));
assert.strictEqual(summary.surfaceCoverage.kind, 'frontier.framework.surface-coverage.report');
assert.strictEqual(summary.surfaceCoverage.ok, true);
assert.ok(summary.harnessTemplates.files.some((file) => file.endsWith('frontier-fuzz.mjs')));
assert.ok(summary.agent.capabilities.some((capability) => capability.id === 'agent.handoff'));
assert.ok(summary.agent.capabilities.some((capability) => capability.id === 'agent.mcp-tools'));
assert.ok(summary.agent.capabilities.some((capability) => capability.id === 'agent.replay'));
assert.ok(summary.agent.capabilities.some((capability) => capability.id === 'agent.surface-coverage'));
assert.strictEqual(summary.agentBundle.readiness.ok, true);
assert.ok(summary.agentBundle.files.some((file) => file.endsWith('mcp-tools.json')));
assert.ok(summary.agentBundle.files.some((file) => file.endsWith('frontier-agent-lint.sarif')));
assert.ok(summary.agentBundle.files.some((file) => file.endsWith('agent-workflow.json')));
assert.ok(summary.agentBundle.surfaceCoverageFile.endsWith('coverage.json'));
assert.ok(summary.agentBundle.surfaceDashboardFile.endsWith('dashboard.md'));
assert.ok(summary.routes.some((route) => route.cached === false && route.dependencies.length > 0));

const probeAppDir = path.join(tmp, 'probe-app');
await fs.mkdir(probeAppDir, { recursive: true });
await fs.writeFile(path.join(probeAppDir, 'evidence.json'), JSON.stringify({ ok: true, notes: ['verified file only'] }));
await fs.writeFile(path.join(probeAppDir, 'frontier.config.mjs'), `
export default {
  id: 'probe-app',
  surfaces: {
    coverage: {
      failOnMissing: true,
      verifyEvidenceFiles: true,
      verifyEvidenceProbeKinds: true,
      requireProbesForKinds: { action: ['action'] }
    },
    surfaces: [
      { id: 'action.bad', kind: 'action', status: 'verified', evidence: ['evidence.json'] },
      { id: 'page.home', kind: 'page', route: '/home', status: 'verified', evidence: ['evidence.json'], contracts: [
        { kind: 'evidence-ok' },
        { kind: 'route-comparison', route: '/home/:slug', scenario: 'creator' }
      ] }
    ]
  }
};
`);
try {
  execFileSync(process.execPath, [cli, 'loop', '--cwd', probeAppDir, '--strict', '--json'], { stdio: 'pipe' });
  assert.fail('strict loop should fail when evidence lacks the action probe marker');
} catch (error) {
  assert.strictEqual(error.status, 1);
  assert.ok(String(error.stdout).includes('"ok": false'));
  assert.ok(String(error.stdout).includes('missing-probe-kind'));
  assert.ok(String(error.stdout).includes('route-comparison'));
}
await fs.writeFile(path.join(probeAppDir, 'evidence.json'), JSON.stringify({
  ok: true,
  actionIds: ['action.bad'],
  renderableNodes: 4,
  comparisonRecords: [{ path: '/home/creator?tab=worlds', samplePath: '/home/creator?tab=worlds', scenario: 'creator', gaps: [], frontier: {}, legacy: {}, deltas: {} }]
}));
const probeLoop = JSON.parse(execFileSync(process.execPath, [cli, 'loop', '--cwd', probeAppDir, '--strict', '--json'], { encoding: 'utf8' }));
assert.strictEqual(probeLoop.ok, true);
assert.ok(probeLoop.coverage.dashboard.byProbe.action.covered >= 1);
assert.ok(probeLoop.coverage.dashboard.byContract['route-comparison'].passed >= 1);
assert.strictEqual(probeLoop.coverage.summary.failedContractCount, 0);

const harness = JSON.parse(await fs.readFile(harnessEvidence, 'utf8'));
assert.strictEqual(harness.kind, 'frontier.framework.harness.validation');
assert.ok(harness.checks.some((check) => check.id === 'agent-kit'));

const sourcePolicy = JSON.parse(await fs.readFile(sourcePolicyEvidence, 'utf8'));
assert.strictEqual(sourcePolicy.kind, 'frontier.framework.source-policy.report');
assert.strictEqual(sourcePolicy.enforcement, 'error');
assert.strictEqual(sourcePolicy.rules.maxCharsPerFile, 24000);
assert.strictEqual(sourcePolicy.rules.localImportExtensions, 'source');
assert.ok(sourcePolicy.checkedFiles.some((file) => file.file.endsWith('HomeView.tsx') && file.frontierComponentCount === 1 && file.chars > 0));
assert.ok(sourcePolicy.checkedFiles.some((file) => file.file.endsWith('runtime/forms.ts')));
assert.ok(sourcePolicy.runtimeModules.some((module) => module.id === 'runtime.dom-events' && module.owns.includes('dom-events') && module.bindings.some((binding) => binding.kind === 'dom-events')));
assert.deepStrictEqual(sourcePolicy.violations, []);
assert.strictEqual(sourcePolicy.businessLogicFindings.length, 0);
const generatedTsconfig = JSON.parse(await fs.readFile(scaffoldTsconfig, 'utf8'));
assert.strictEqual(generatedTsconfig.compilerOptions.strict, true);
assert.strictEqual(generatedTsconfig.compilerOptions.allowImportingTsExtensions, true);
assert.strictEqual(generatedTsconfig.compilerOptions.rewriteRelativeImportExtensions, true);
assert.strictEqual(generatedTsconfig.compilerOptions.noUncheckedIndexedAccess, true);
assert.strictEqual(generatedTsconfig.compilerOptions.exactOptionalPropertyTypes, true);

const sourceGraph = JSON.parse(await fs.readFile(sourceGraphEvidence, 'utf8'));
assert.strictEqual(sourceGraph.kind, 'frontier.ast-walk.source-graph');
assert.ok(sourceGraph.sources.some((source) => source.file.endsWith('HomeView.tsx') && source.layer === 'frontend-component'));
assert.ok(sourceGraph.sources.some((source) => source.file.endsWith('handler.ts') && source.layer === 'backend-handler'));
assert.ok(sourceGraph.sources.some((source) => source.file.endsWith('packages/domain/src/index.ts') && source.layer === 'domain'));
const sourceRegistry = JSON.parse(await fs.readFile(sourceRegistryEvidence, 'utf8'));
assert.strictEqual(sourceRegistry.kind, 'frontier.ast-walk.registry');
assert.ok(sourceRegistry.entries.some((entry) => entry.kind === 'source'));

const conformance = JSON.parse(await fs.readFile(conformanceEvidence, 'utf8'));
assert.strictEqual(conformance.kind, 'frontier.framework.conformance.report');
assert.strictEqual(conformance.mode, 'strict');
assert.strictEqual(conformance.enforcement, 'error');
assert.strictEqual(conformance.ok, true);
assert.strictEqual(conformance.lint.summary.valid, true);
assert.strictEqual(conformance.lint.summary.errorCount, 0);
assert.ok(conformance.requiredPackageUses.some((use) => use.id === 'frontend-frontier-design'));
assert.ok(conformance.requiredPackageUses.some((use) => use.id === 'source-frontier-ast-walk'));
assert.ok(conformance.requiredPackageUses.some((use) => use.id === 'auth-frontier-auth'));
const conformanceSarifJson = JSON.parse(await fs.readFile(conformanceSarif, 'utf8'));
assert.strictEqual(conformanceSarifJson.version, '2.1.0');
assert.strictEqual(conformanceSarifJson.runs[0].tool.driver.name, 'frontier-framework-conformance');

const configValidation = JSON.parse(await fs.readFile(configValidationEvidence, 'utf8'));
assert.strictEqual(configValidation.kind, 'frontier.framework.config.validation');
assert.strictEqual(configValidation.schema.id, 'frontier.framework.config.schema.v1');
assert.strictEqual(configValidation.ok, true);

const auth = JSON.parse(await fs.readFile(authEvidence, 'utf8'));
assert.strictEqual(auth.kind, 'frontier.auth.evidence');
assert.strictEqual(auth.enabled, true);
assert.ok(auth.manifest.summary.gateCount >= 1);
assert.ok(auth.registry.entries.some((entry) => entry.kind === 'auth-token-contract'));
const generatedAuth = JSON.parse(await fs.readFile(generatedAuthManifest, 'utf8'));
assert.strictEqual(generatedAuth.kind, 'frontier.auth.manifest');
assert.ok(generatedAuth.linking.allowEmailFallback);

const migrations = JSON.parse(await fs.readFile(migrationsEvidence, 'utf8'));
assert.strictEqual(migrations.kind, 'frontier.framework.migrations.manifest');
assert.ok(migrations.integration.some((entry) => entry.runtimeHook.includes('persistQueryCache')));
const migrationsBridge = await fs.readFile(generatedMigrationsBridge, 'utf8');
assert.ok(migrationsBridge.includes("from '@shapeshift-labs/frontier-migrations'"));
assert.ok(migrationsBridge.includes('createFrontierStateMigration'));
assert.ok(migrationsBridge.includes('createFrontierCachePersistenceMigration'));
const routeScenarios = JSON.parse(await fs.readFile(generatedRouteScenarioManifest, 'utf8'));
assert.strictEqual(routeScenarios.kind, 'frontier.framework.route-scenario.manifest');
const routeScenarioPlan = JSON.parse(await fs.readFile(generatedRouteScenarioPlan, 'utf8'));
assert.strictEqual(routeScenarioPlan.kind, 'frontier.framework.route-scenario.playwright-plan');
assert.ok(routeScenarioPlan.probes.includes('dom-roles'));
const surfaceRegistry = JSON.parse(await fs.readFile(generatedSurfaceRegistry, 'utf8'));
assert.strictEqual(surfaceRegistry.kind, 'frontier.framework.surface-status.registry');
assert.ok(surfaceRegistry.summary.statusCounts.implemented >= 1);
const surfaceCoverage = JSON.parse(await fs.readFile(generatedSurfaceCoverage, 'utf8'));
assert.strictEqual(surfaceCoverage.kind, 'frontier.framework.surface-coverage.report');
assert.strictEqual(surfaceCoverage.ok, true);
const surfaceDashboard = await fs.readFile(generatedSurfaceDashboard, 'utf8');
assert.ok(surfaceDashboard.includes('Frontier Surface Coverage'));
assert.ok(surfaceDashboard.includes('## By Status'));
const filterSurfaceOutput = execFileSync(process.execPath, [cli, 'surfaces', '--cwd', appDir, '--kind', 'filter', '--json'], {
  stdio: 'pipe'
}).toString();
const filterSurfaceStatus = JSON.parse(filterSurfaceOutput);
assert.strictEqual(filterSurfaceStatus.kind, 'frontier.framework.surface-status.report');
assert.ok(filterSurfaceStatus.surfaces.every((surface) => surface.kind === 'filter'));
assert.strictEqual(filterSurfaceStatus.summary.statusCounts.planned, 1);
assert.strictEqual(filterSurfaceStatus.coverage.ok, true);
assert.ok(filterSurfaceStatus.coverage.records.every((record) => record.nextCommand));
const filterRefOutput = execFileSync(process.execPath, [cli, 'status', 'filter:counter-default', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const filterRefStatus = JSON.parse(filterRefOutput);
assert.strictEqual(filterRefStatus.summary.matchCount, 1);
assert.strictEqual(filterRefStatus.surfaces[0].id, 'filter.counter-default');
assert.strictEqual(filterRefStatus.coverage.records[0].nextCommand, 'complete-planned-probe');
const rootSurfaceOutput = execFileSync(process.execPath, [cli, 'status', '/', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const rootSurfaceStatus = JSON.parse(rootSurfaceOutput);
assert.ok(rootSurfaceStatus.surfaces.some((surface) => surface.id === 'page.root' && surface.status === 'implemented'));
assert.ok(rootSurfaceStatus.coverage.records.some((record) => record.surfaceId === 'page.root' && record.ok === true));
const coverageOutput = execFileSync(process.execPath, [cli, 'coverage', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const coverageStatus = JSON.parse(coverageOutput);
assert.strictEqual(coverageStatus.kind, 'frontier.framework.surface-coverage.report');
assert.strictEqual(coverageStatus.ok, true);
const loopOutput = execFileSync(process.execPath, [cli, 'loop', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const loopStatus = JSON.parse(loopOutput);
assert.strictEqual(loopStatus.kind, 'frontier.framework.agent-loop.report');
assert.strictEqual(loopStatus.ok, true);
assert.ok(loopStatus.dashboard.focus.page.total >= 1);
assert.ok(loopStatus.dashboard.focus.filter.total >= 1);
const loopDashboard = await fs.readFile(generatedSurfaceLoopDashboard, 'utf8');
assert.ok(loopDashboard.includes('Frontier Agent Loop'));

const plan = JSON.parse(await fs.readFile(harnessPlan, 'utf8'));
assert.ok(plan.syncAdapters.includes('yjs.websocket'));
assert.strictEqual(plan.routeScenarios.manifestFile, '.frontier-framework/route-scenarios/manifest.json');
assert.strictEqual(plan.surfaces.registryFile, '.frontier-framework/surfaces/registry.json');
assert.strictEqual(plan.surfaces.coverage.reportFile, '.frontier-framework/surfaces/coverage.json');
assert.strictEqual(plan.surfaces.coverage.ok, true);
assert.ok(plan.research.includes('trace-rewind'));
assert.ok(plan.model.actions.includes('record-crdt-update'));
assert.ok(plan.model.actions.includes('evaluate-auth-gate'));
assert.ok(plan.properties.includes('auth-gate-session-model'));
assert.ok(plan.auth.gates.some((gate) => gate.required === true));
assert.ok(plan.properties.includes('state-model-replay'));
assert.ok(plan.properties.includes('replay-minimization'));
assert.ok(plan.browserAssertions.includes('telemetry-recorded'));
assert.ok(plan.browserAssertions.includes('route-scenarios-readable'));
assert.ok(plan.browserAssertions.includes('surface-status-readable'));
assert.ok(plan.browserAssertions.includes('surface-coverage-readable'));

const fuzzerSource = await fs.readFile(generatedFuzzer, 'utf8');
assert.ok(fuzzerSource.includes("import('fast-check')"), 'generated fuzzer should use fast-check when installed');
assert.ok(fuzzerSource.includes('runModelCase'), 'generated fuzzer should include app-state model checking');
assert.ok(fuzzerSource.includes('minimizeCase'), 'generated fuzzer should include replay minimization');
assert.ok(fuzzerSource.includes('record-crdt-update'), 'generated fuzzer should model CRDT update commands');
assert.ok(fuzzerSource.includes('evaluate-auth-gate'), 'generated fuzzer should model auth gate commands');

const benchmarkSource = await fs.readFile(generatedBench, 'utf8');
assert.ok(benchmarkSource.includes('route-materialization'), 'generated benchmark should measure route materialization');
assert.ok(benchmarkSource.includes('state-model-replay'), 'generated benchmark should measure model replay');
assert.ok(benchmarkSource.includes('telemetry-redaction'), 'generated benchmark should measure telemetry redaction');

const browserSource = await fs.readFile(generatedBrowser, 'utf8');
assert.ok(browserSource.includes("import('@playwright/test')"), 'generated browser harness should use Playwright when installed');
assert.ok(browserSource.includes('recordPatch'), 'generated browser harness should record patch evidence');
assert.ok(browserSource.includes('recordCrdtUpdate'), 'generated browser harness should record CRDT evidence');
assert.ok(browserSource.includes('route-evidence-readable'), 'generated browser harness should assert route evidence');
assert.ok(browserSource.includes('route-scenarios-readable'), 'generated browser harness should assert route scenario evidence');
assert.ok(browserSource.includes('surface-status-readable'), 'generated browser harness should assert surface status evidence');
assert.ok(browserSource.includes('surface-coverage-readable'), 'generated browser harness should assert surface coverage evidence');

const agent = JSON.parse(await fs.readFile(agentManifest, 'utf8'));
assert.ok(agent.capabilities.some((capability) => capability.id === 'agent.harness'));
assert.ok(agent.capabilities.some((capability) => capability.id === 'agent.ci-gates'));
assert.ok(agent.checkpoints.some((checkpoint) => checkpoint.id === 'agent.handoff'));
assert.ok(agent.artifacts.mcpTools.endsWith('mcp-tools.json'));
assert.ok(agent.artifacts.surfaceCoverage.endsWith('coverage.json'));
assert.ok(agent.artifacts.surfaceDashboard.endsWith('dashboard.md'));

const mcpTools = JSON.parse(await fs.readFile(agentMcpTools, 'utf8'));
assert.strictEqual(mcpTools.kind, 'frontier.framework.agent.mcp-tools');
assert.ok(mcpTools.tools.some((tool) => tool.name === 'frontier_frontier_agent_replay'), 'MCP tools should include agent replay');
assert.ok(mcpTools.descriptors.some((descriptor) => descriptor.id === 'frontier.agent.mcp'));

const toolManifest = JSON.parse(await fs.readFile(agentToolManifest, 'utf8'));
assert.strictEqual(toolManifest.kind, 'frontier.framework.agent.tool-manifest');
assert.ok(toolManifest.manifest.actions.some((action) => action.id === 'frontier.agent.lint'));

const ciGates = JSON.parse(await fs.readFile(agentCiGates, 'utf8'));
assert.strictEqual(ciGates.kind, 'frontier.framework.agent.ci-evidence-gates');
assert.ok(ciGates.gates.some((gate) => gate.id === 'agent-readiness'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'component-preview'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'documentation'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'conformance-lint'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'config-validation'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'surface-coverage'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'agent-surface-loop'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'auth-contracts'));
assert.ok(ciGates.gates.some((gate) => gate.id === 'runtime-migrations'));
assert.ok(ciGates.requiredArtifacts.some((artifact) => artifact.endsWith('frontier-agent-lint.sarif')));

const lintReport = JSON.parse(await fs.readFile(agentLintReport, 'utf8'));
assert.strictEqual(lintReport.kind, 'frontier.linter.report');
assert.strictEqual(lintReport.summary.valid, true);

const sarif = JSON.parse(await fs.readFile(agentSarif, 'utf8'));
assert.strictEqual(sarif.version, '2.1.0');
assert.strictEqual(sarif.runs[0].tool.driver.name, 'frontier-framework-agent');

const workflow = JSON.parse(await fs.readFile(agentWorkflow, 'utf8'));
assert.strictEqual(workflow.kind, 'frontier.workflow.manifest');
assert.ok(workflow.steps.some((step) => step.id === 'check-surface-loop'));
assert.ok(workflow.steps.some((step) => step.id === 'replay'));
const workflowProof = JSON.parse(await fs.readFile(agentWorkflowProof, 'utf8'));
assert.strictEqual(workflowProof.kind, 'frontier.workflow.proof');

assert.ok((await fs.readFile(agentReplay, 'utf8')).includes('ci-evidence-gates.json'));
assert.ok((await fs.readFile(agentIssueHandoff, 'utf8')).includes('Frontier Issue Handoff'));
assert.ok((await fs.readFile(agentPrHandoff, 'utf8')).includes('Frontier PR Handoff'));

const harnessOutput = execFileSync(process.execPath, [cli, 'harness', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const harnessSummary = JSON.parse(harnessOutput);
assert.strictEqual(harnessSummary.ok, true);

const agentOutput = execFileSync(process.execPath, [cli, 'agent', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const agentSummary = JSON.parse(agentOutput);
assert.strictEqual(agentSummary.readiness.ok, true);
assert.ok(agentSummary.files.some((file) => file.endsWith('surfaces/dashboard.md')));
assert.ok(agentSummary.files.some((file) => file.endsWith('frontier-agent-replay.mjs')));

const lintOutput = execFileSync(process.execPath, [cli, 'lint', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const lintSummary = JSON.parse(lintOutput);
assert.strictEqual(lintSummary.kind, 'frontier.framework.conformance.report');
assert.strictEqual(lintSummary.ok, true);
assert.strictEqual(lintSummary.lint.summary.errorCount, 0);

const authOutput = execFileSync(process.execPath, [cli, 'auth', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const authCommand = JSON.parse(authOutput);
assert.strictEqual(authCommand.kind, 'frontier.auth.evidence');
assert.ok(authCommand.manifest.tokenContracts.some((contract) => contract.id === 'service-user'));

execFileSync(process.execPath, [agentReplay, '--dry-run', '--required-only'], {
  cwd: appDir,
  stdio: 'pipe'
});
const replaySummary = JSON.parse(await fs.readFile(path.join(appDir, '.frontier-framework', 'agent', 'agent-replay.json'), 'utf8'));
assert.strictEqual(replaySummary.kind, 'frontier.framework.agent.replay');
assert.strictEqual(replaySummary.dryRun, true);
assert.ok(replaySummary.results.some((result) => result.id === 'agent-readiness'));

const doctorOutput = execFileSync(process.execPath, [cli, 'doctor', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const doctorSummary = JSON.parse(doctorOutput);
assert.strictEqual(doctorSummary.kind, 'frontier.framework.doctor');
assert.strictEqual(doctorSummary.ok, true);
assert.strictEqual(doctorSummary.configValidation.ok, true);
assert.ok(doctorSummary.checks.some((check) => check.id === 'config-schema' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'deploy-split'));
assert.ok(doctorSummary.checks.some((check) => check.id === 'script:docs' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'dependency:documentation' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'documentation' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'source-policy' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'auth:gates' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'conformance' && check.ok === true));
assert.ok(doctorSummary.checks.some((check) => check.id === 'surface-coverage' && check.ok === true));
assert.strictEqual(doctorSummary.summary.surfaceCoverageMissing, 0);

const configExplainOutput = execFileSync(process.execPath, [cli, 'config', 'explain', 'sourcePolicy', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const configExplain = JSON.parse(configExplainOutput);
assert.strictEqual(configExplain.kind, 'frontier.framework.config.explain');
assert.ok(configExplain.entries.some((entry) => entry.path === 'sourcePolicy.enforcement'));
assert.ok(configExplain.entries.some((entry) => entry.path === 'sourcePolicy.maxCharsPerFile'));
assert.ok(configExplain.entries.some((entry) => entry.path === 'sourcePolicy.localImportExtensions'));
assert.ok(configExplain.entries.some((entry) => entry.path === 'sourcePolicy.runtimeModules'));

const configValidateOutput = execFileSync(process.execPath, [cli, 'config', 'validate', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const configValidate = JSON.parse(configValidateOutput);
assert.strictEqual(configValidate.kind, 'frontier.framework.config.validation');
assert.strictEqual(configValidate.ok, true);

const migrationsOutput = execFileSync(process.execPath, [cli, 'migrations', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const migrationsCommand = JSON.parse(migrationsOutput);
assert.strictEqual(migrationsCommand.kind, 'frontier.framework.migrations.manifest');
assert.ok(migrationsCommand.sources.some((source) => source.kind === 'crdt-snapshot'));

const originalConfig = await fs.readFile(path.join(appDir, 'frontier.config.mjs'), 'utf8');
await fs.writeFile(path.join(appDir, 'frontier.config.mjs'), originalConfig
  .replace("enforcement: 'error'", "enforcement: 'strict'")
  .replace("mode: 'strict'", "mode: 'always'")
  .replace('maxLinesPerFile: 320', 'maxLinesPerFile: true')
  .replace('maxCharsPerFile: 24000', 'maxCharsPerFile: true')
  .replace("localImportExtensions: 'source'", "localImportExtensions: 'runtime-js'")
  .replace("mode: 'recommended'", "mode: 'always'"), 'utf8');
let invalidConfigOutput = '';
try {
  invalidConfigOutput = execFileSync(process.execPath, [cli, 'config', 'validate', '--cwd', appDir, '--json'], {
    stdio: 'pipe'
  }).toString();
} catch (error) {
  invalidConfigOutput = String(error.stdout ?? '');
}
const invalidConfig = JSON.parse(invalidConfigOutput);
assert.strictEqual(invalidConfig.ok, false);
assert.ok(invalidConfig.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.enforcement' && diagnostic.suggestedFix));
assert.ok(invalidConfig.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.maxLinesPerFile'));
assert.ok(invalidConfig.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.maxCharsPerFile'));
assert.ok(invalidConfig.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.localImportExtensions'));
assert.ok(invalidConfig.diagnostics.some((diagnostic) => diagnostic.path === 'conformance.mode'));
assert.ok(invalidConfig.diagnostics.some((diagnostic) => diagnostic.path === 'harness.mode'));
await fs.writeFile(path.join(appDir, 'frontier.config.mjs'), originalConfig, 'utf8');

const violatingComponentFile = path.join(appDir, 'apps/web/src/components/TooManyComponents.tsx');
await fs.writeFile(violatingComponentFile, [
  "import { tokenVar } from '@shapeshift-labs/frontier-design';",
  "import { state } from '@shapeshift-labs/frontier-dom';",
  '',
  'const $ = state();',
  '',
  'export function FirstComponent() {',
  "  return <section style={{ '--frontier-accent': tokenVar('color.accent') }}>{$.first || 'First'}</section>;",
  '}',
  '',
  'export function SecondComponent() {',
  "  return <section style={{ '--frontier-accent': tokenVar('color.accent') }}>{$.second || 'Second'}</section>;",
  '}',
  ''
].join('\n'), 'utf8');
let violatingDoctorOutput = '';
try {
  violatingDoctorOutput = execFileSync(process.execPath, [cli, 'doctor', '--cwd', appDir, '--json'], {
    stdio: 'pipe'
  }).toString();
} catch (error) {
  violatingDoctorOutput = String(error.stdout ?? '');
}
const violatingDoctor = JSON.parse(violatingDoctorOutput);
assert.strictEqual(violatingDoctor.ok, false);
assert.ok(violatingDoctor.checks.some((check) => check.id === 'source-policy' && check.ok === false && check.required === true));

await fs.writeFile(path.join(appDir, 'frontier.config.mjs'), originalConfig.replace(/  sourcePolicy: \{[\s\S]*?  \},\n  harness:/, '  sourcePolicy: { enabled: false },\n  harness:'), 'utf8');
const disabledDoctorOutput = execFileSync(process.execPath, [cli, 'doctor', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
}).toString();
const disabledDoctor = JSON.parse(disabledDoctorOutput);
assert.strictEqual(disabledDoctor.ok, true);
assert.ok(disabledDoctor.checks.some((check) => check.id === 'source-policy' && check.ok === true && check.detail === 'disabled'));
await fs.writeFile(path.join(appDir, 'frontier.config.mjs'), originalConfig, 'utf8');
await fs.rm(violatingComponentFile);

const denseRuntimeFile = path.join(appDir, 'apps/web/src/runtime/dense.ts');
await fs.writeFile(denseRuntimeFile, "export const denseRuntimePayload = '" + 'x'.repeat(25000) + "';\n", 'utf8');
let denseDoctorOutput = '';
try {
  denseDoctorOutput = execFileSync(process.execPath, [cli, 'doctor', '--cwd', appDir, '--json'], {
    stdio: 'pipe'
  }).toString();
} catch (error) {
  denseDoctorOutput = String(error.stdout ?? '');
}
const denseDoctor = JSON.parse(denseDoctorOutput);
assert.strictEqual(denseDoctor.ok, false);
try {
  execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--target', 'evidence', '--json'], {
    stdio: 'pipe'
  });
} catch {
  // Evidence is written before strict source-policy failure is surfaced.
}
const densePolicy = JSON.parse(await fs.readFile(sourcePolicyEvidence, 'utf8'));
assert.ok(densePolicy.violations.some((violation) => violation.rule === 'max-chars-per-file' && violation.file.endsWith('runtime/dense.ts')));
await fs.rm(denseRuntimeFile);
execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
});

const sourceImportHelperFile = path.join(appDir, 'apps/web/src/runtime/source-helper.ts');
const sourceRuntimeImportFile = path.join(appDir, 'apps/web/src/runtime/source-runtime-import.ts');
await fs.writeFile(sourceImportHelperFile, 'export const sourceImportValue = 1;\n', 'utf8');
await fs.writeFile(sourceRuntimeImportFile, [
  "import { sourceImportValue } from './source-helper.js';",
  '',
  'export const sourceRuntimeImportValue = sourceImportValue;',
  ''
].join('\n'), 'utf8');
try {
  execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--target', 'evidence', '--json'], {
    stdio: 'pipe'
  });
} catch {
  // Evidence is written before strict source-policy failure is surfaced.
}
const sourceImportPolicy = JSON.parse(await fs.readFile(sourcePolicyEvidence, 'utf8'));
assert.ok(sourceImportPolicy.violations.some((violation) => violation.rule === 'local-source-import-extension' && violation.file.endsWith('runtime/source-runtime-import.ts')));
await fs.rm(sourceImportHelperFile);
await fs.rm(sourceRuntimeImportFile);
execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
});

const businessLogicFile = path.join(appDir, 'apps/web/src/components/BusinessLogicInComponent.tsx');
await fs.writeFile(businessLogicFile, [
  "import { tokenVar } from '@shapeshift-labs/frontier-design';",
  "import { state } from '@shapeshift-labs/frontier-dom';",
  '',
  'const $ = state();',
  '',
  'export function BusinessLogicInComponent() {',
  "  fetch('/api/health');",
  "  return <section style={{ '--frontier-accent': tokenVar('color.accent') }}>{$.title || 'Business logic'}</section>;",
  '}',
  ''
].join('\n'), 'utf8');
let businessLogicDoctorOutput = '';
try {
  businessLogicDoctorOutput = execFileSync(process.execPath, [cli, 'doctor', '--cwd', appDir, '--json'], {
    stdio: 'pipe'
  }).toString();
} catch (error) {
  businessLogicDoctorOutput = String(error.stdout ?? '');
}
const businessLogicDoctor = JSON.parse(businessLogicDoctorOutput);
assert.strictEqual(businessLogicDoctor.ok, false);
assert.ok(businessLogicDoctor.checks.some((check) => check.id === 'source-policy' && check.ok === false));
try {
  execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--target', 'evidence', '--json'], {
    stdio: 'pipe'
  });
} catch {
  // Evidence is written before strict source-policy failure is surfaced.
}
const businessLogicPolicy = JSON.parse(await fs.readFile(sourcePolicyEvidence, 'utf8'));
assert.ok(businessLogicPolicy.violations.some((violation) => violation.rule === 'business-logic-in-adapter' && violation.symbol === 'fetch'));
await fs.rm(businessLogicFile);
execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--json'], {
  stdio: 'pipe'
});

const missingDesignFile = path.join(appDir, 'apps/web/src/components/MissingDesign.tsx');
await fs.writeFile(missingDesignFile, [
  "import { state } from '@shapeshift-labs/frontier-dom';",
  '',
  'const $ = state();',
  '',
  'export function MissingDesign() {',
  "  return <section>{$.title || 'Missing design'}</section>;",
  '}',
  ''
].join('\n'), 'utf8');
let conformanceViolationOutput = '';
try {
  conformanceViolationOutput = execFileSync(process.execPath, [cli, 'lint', '--cwd', appDir, '--json'], {
    stdio: 'pipe'
  }).toString();
} catch (error) {
  conformanceViolationOutput = String(error.stdout ?? '');
}
const conformanceViolation = JSON.parse(conformanceViolationOutput);
assert.strictEqual(conformanceViolation.ok, false);
assert.ok(conformanceViolation.lint.diagnostics.some((diagnostic) => diagnostic.ruleId === 'frontier/require-package-use' && diagnostic.target?.file?.endsWith('MissingDesign.tsx')));
await fs.rm(missingDesignFile);

const discoveryTmp = await fs.mkdtemp(path.join(os.tmpdir(), 'frontier-framework-routes-'));
execFileSync(process.execPath, [cli, 'init', 'discovery', '--name', 'Discovery Frontier', '--no-install'], {
  cwd: discoveryTmp,
  stdio: 'pipe'
});
const discoveryApp = path.join(discoveryTmp, 'discovery');
async function writeDiscoveryRoute(relative, componentName) {
  const full = path.join(discoveryApp, 'apps/web/src/routes', relative);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, [
    "import { tokenVar } from '@shapeshift-labs/frontier-design';",
    "import { state } from '@shapeshift-labs/frontier-dom';",
    '',
    'const $ = state();',
    '',
    'export default function ' + componentName + '() {',
    "  return <main style={{ '--frontier-accent': tokenVar('color.accent') }}>{$.title || '" + componentName + "'}</main>;",
    '}',
    ''
  ].join('\n'), 'utf8');
}
await writeDiscoveryRoute('(marketing)/about/page.tsx', 'AboutPage');
await writeDiscoveryRoute('blog/[slug]/+page.tsx', 'BlogPostPage');
await writeDiscoveryRoute('docs/[[...slug]]/page.tsx', 'DocsCatchAllPage');
await writeDiscoveryRoute('posts.$postId.tsx', 'PostFlatPage');
await writeDiscoveryRoute('posts.index.tsx', 'PostsIndexPage');
await writeDiscoveryRoute('files.$.tsx', 'FilesSplatPage');
await writeDiscoveryRoute('store.{-$category}.tsx', 'OptionalCategoryPage');
await writeDiscoveryRoute('_internal/secret.tsx', 'SecretPage');
await writeDiscoveryRoute('@modal/login/page.tsx', 'ModalLoginPage');
await writeDiscoveryRoute('-draft.tsx', 'DraftPage');
await writeDiscoveryRoute('(marketing)/layout.tsx', 'MarketingLayout');
const discoveryOutput = execFileSync(process.execPath, [cli, 'inspect', '--cwd', discoveryApp, '--json'], {
  stdio: 'pipe',
  maxBuffer: CLI_JSON_MAX_BUFFER
}).toString();
const discoveryPlan = JSON.parse(discoveryOutput);
const discoveredRoutes = new Set(discoveryPlan.routes.routes.filter((route) => route.kind === 'route').map((route) => route.id));
assert.ok(discoveredRoutes.has('route:/about'), 'route groups should not affect URL paths');
assert.ok(discoveredRoutes.has('route:/blog/:slug'), 'SvelteKit-style +page files should discover dynamic route params');
assert.ok(discoveredRoutes.has('route:/docs/*slug?'), 'optional catch-all route params should become Frontier splat params');
assert.ok(discoveredRoutes.has('route:/posts/:postId'), 'TanStack-style flat files should discover dynamic route params');
assert.ok(discoveredRoutes.has('route:/posts'), 'flat index files should discover parent index routes');
assert.ok(discoveredRoutes.has('route:/files/*splat'), 'TanStack-style splat files should discover Frontier splat params');
assert.ok(discoveredRoutes.has('route:/store/:category?'), 'TanStack-style optional path params should discover optional Frontier params');
assert.ok(!discoveredRoutes.has('route:/_internal/secret'), 'private route folders should be ignored');
assert.ok(!discoveredRoutes.has('route:/login'), 'parallel route slots should be ignored by default');
assert.ok(!discoveredRoutes.has('route:/-draft'), 'excluded route files should be ignored');
assert.ok(!discoveredRoutes.has('route:/layout'), 'layout files should not become routable pages');

const discoveryBuildOutput = execFileSync(process.execPath, [cli, 'build', '--cwd', discoveryApp, '--target', 'evidence', '--json'], {
  stdio: 'pipe',
  maxBuffer: CLI_JSON_MAX_BUFFER
}).toString();
const discoveryBuild = JSON.parse(discoveryBuildOutput);
assert.strictEqual(discoveryBuild.target, 'evidence');
const routeDiscovery = JSON.parse(await fs.readFile(path.join(discoveryApp, 'dist', 'frontier', 'route-discovery.json'), 'utf8'));
assert.strictEqual(routeDiscovery.kind, 'frontier.framework.route.discovery');
assert.ok(routeDiscovery.routes.some((route) => route.path === '/posts/:postId' && route.source === 'filesystem'));

const conflictTmp = await fs.mkdtemp(path.join(os.tmpdir(), 'frontier-framework-route-conflict-'));
execFileSync(process.execPath, [cli, 'init', 'conflict', '--name', 'Conflict Frontier', '--no-install'], {
  cwd: conflictTmp,
  stdio: 'pipe'
});
const conflictApp = path.join(conflictTmp, 'conflict');
async function writeConflictRoute(relative, componentName) {
  const full = path.join(conflictApp, 'apps/web/src/routes', relative);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, [
    "import { tokenVar } from '@shapeshift-labs/frontier-design';",
    "import { state } from '@shapeshift-labs/frontier-dom';",
    '',
    'const $ = state();',
    '',
    'export default function ' + componentName + '() {',
    "  return <main style={{ '--frontier-accent': tokenVar('color.accent') }}>{$.title || '" + componentName + "'}</main>;",
    '}',
    ''
  ].join('\n'), 'utf8');
}
await writeConflictRoute('(marketing)/contact/page.tsx', 'MarketingContactPage');
await writeConflictRoute('(shop)/contact/page.tsx', 'ShopContactPage');
let conflictFailed = false;
try {
  execFileSync(process.execPath, [cli, 'inspect', '--cwd', conflictApp, '--json'], {
    stdio: 'pipe'
  });
} catch (error) {
  conflictFailed = true;
  const output = String(error.stderr ?? '') + String(error.stdout ?? '') + String(error.message ?? '');
  assert.ok(output.includes('Frontier route discovery conflict'), 'conflicting route groups should fail with a route-discovery diagnostic');
  assert.ok(output.includes('/contact'), 'conflicting route diagnostic should include the URL path');
}
assert.ok(conflictFailed, 'conflicting route-group URLs should fail discovery');

const cachedFrontendOutput = execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--target', 'frontend', '--json'], {
  stdio: 'pipe'
}).toString();
const cachedFrontend = JSON.parse(cachedFrontendOutput);
assert.ok(cachedFrontend.frontendRoutes.some((route) => route.cached === true), 'frontend target build should reuse unchanged route cache');

execFileSync(process.execPath, [agentCheck], {
  cwd: appDir,
  stdio: 'pipe'
});
assert.ok(existsSync(path.join(appDir, '.frontier-framework', 'agent', 'agent-readiness.json')));

execFileSync(process.execPath, [generatedFuzzer, '--cases', '12', '--seed', '9'], {
  cwd: appDir,
  stdio: 'pipe'
});
const fuzzSummary = JSON.parse(await fs.readFile(path.join(appDir, 'dist', 'frontier', 'harness', 'fuzz-summary.json'), 'utf8'));
assert.strictEqual(fuzzSummary.kind, 'frontier.framework.harness.fuzz');
assert.strictEqual(fuzzSummary.ok, true);
assert.ok(fuzzSummary.properties.includes('state-model-replay'));
assert.ok(Array.isArray(fuzzSummary.minimized));

execFileSync(process.execPath, [generatedBench, '--runs', '2'], {
  cwd: appDir,
  stdio: 'pipe'
});
const benchmarkSummary = JSON.parse(await fs.readFile(path.join(appDir, 'dist', 'frontier', 'harness', 'benchmark-summary.json'), 'utf8'));
assert.strictEqual(benchmarkSummary.kind, 'frontier.framework.harness.benchmark');
assert.ok(benchmarkSummary.rows.some((row) => row.name === 'route-materialization'));
assert.ok(benchmarkSummary.rows.some((row) => row.name === 'telemetry-redaction'));

execFileSync(process.execPath, [generatedBrowser], {
  cwd: appDir,
  stdio: 'pipe'
});
const browserSummary = JSON.parse(await fs.readFile(path.join(appDir, 'dist', 'frontier', 'harness', 'browser-harness.json'), 'utf8'));
assert.strictEqual(browserSummary.kind, 'frontier.framework.harness.browser');
assert.strictEqual(browserSummary.ok, true);
assert.ok(Array.isArray(browserSummary.expectedAssertions));
