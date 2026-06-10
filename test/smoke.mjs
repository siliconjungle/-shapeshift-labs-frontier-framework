import assert from 'node:assert';
import {
  FRONTIER_FRAMEWORK_DEFAULT_PACKAGE_STACK,
  FRONTIER_FRAMEWORK_DEFAULT_BACKEND_TRANSPORTS,
  FRONTIER_FRAMEWORK_CONFIG_SCHEMA,
  FRONTIER_FRAMEWORK_RESEARCH_INSIGHTS,
  FRONTIER_FRAMEWORK_RUNTIME_ADAPTER_CATALOG,
  FRONTIER_FRAMEWORK_SYNC_ADAPTER_CATALOG,
  FRONTIER_FRAMEWORK_DEFAULT_AGENT_CHECKPOINTS,
  bindDomEvents,
  bindFormActions,
  createFrontierAuthManifest,
  createFrontierAgentLoopReport,
  createFrontierAgentPlan,
  createFrontierFramework,
  createFrontierFrameworkScaffold,
  createFrontierDeployPlan,
  createRouteScenarioManifest,
  createRouteScenarioPlaywrightPlan,
  createSurfaceCoverageReport,
  createSurfaceRegistry,
  createSurfaceStatusReport,
  defineRuntimeModule,
  defineFrontierConfig,
  explainFrontierFrameworkConfig,
  frontierFrameworkVite,
  renderFrontierDevtoolsOverlayModule,
  normalizeFrontierFrameworkConfig,
  validateFrontierFrameworkConfig
} from '../dist/index.js';
import { verifySurfaceCoverageEvidence } from '../dist/surface-evidence.js';

const config = defineFrontierConfig({
  id: 'example.frontier',
  name: 'Example Frontier',
  frontend: {
    routes: [
      { path: '/', file: 'apps/web/src/routes/index.tsx', feature: 'landing' },
      { path: '/home', file: 'apps/web/src/routes/home.tsx', feature: 'home' },
      { path: '/settings', file: 'apps/web/src/routes/settings.tsx', feature: 'settings' }
    ]
  },
  features: [
    { id: 'home', title: 'Home dashboard', routes: ['/home'] },
    { id: 'settings', title: 'Settings', routes: ['/settings'] }
  ],
  routeScenarios: {
    fixtures: [
      { id: 'guest-session', kind: 'auth', data: { authenticated: false } },
      { id: 'creator-session', kind: 'auth', data: { authenticated: true, role: 'creator' } },
      { id: 'empty-worlds', kind: 'state', data: { worlds: [] } }
    ],
    scenarios: [
      {
        id: 'guest-home-redirect',
        route: '/home',
        authFixture: 'guest-session',
        expected: { redirectTo: '/', domRoles: [{ role: 'main' }], consoleErrors: 'fail' }
      },
      {
        id: 'creator-home-empty',
        route: '/home',
        authFixture: 'creator-session',
        stateFixture: 'empty-worlds',
        expected: {
          finalPath: '/home',
          domRoles: [{ role: 'heading', name: 'Home' }],
          selectors: [{ selector: 'main' }],
          statePaths: ['/worlds'],
          scroll: 'optional'
        }
      }
    ]
  },
  surfaces: {
    statuses: ['planned', 'implemented', { id: 'verified', terminal: true }],
    coverage: {
      failOnMissing: true,
      verifyEvidenceProbeKinds: true,
      evidenceProbeTokens: { action: ['actionIds'], filter: ['worlds'] },
      focusKinds: ['route', 'page', 'filter', 'action', 'workflow'],
      requireProbesForKinds: { filter: ['state'] }
    },
    surfaces: [
      { id: 'page.root.guest', kind: 'page', route: '/', aliases: ['root', 'landing'], status: 'verified', evidence: ['agent-runs/root/evidence.json'], contracts: [{ kind: 'evidence-ok', required: false }], tags: ['guest'] },
      { id: 'filter.worlds.mine', kind: 'filter', aliases: ['worlds.mine', 'mine'], status: 'planned', feature: 'home', dependsOn: ['/worlds'], evidence: ['agent-runs/worlds-mine/evidence.json'] },
      { id: 'action.world.publish', kind: 'action', aliases: ['publish-world'], status: 'verified', coverage: ['action'], evidence: ['agent-runs/publish/evidence.json'] }
    ],
    intents: [
      {
        id: 'page.settings.agent',
        kind: 'page',
        route: '/settings',
        feature: 'settings',
        status: 'verified',
        dependsOn: ['/settings'],
        coverage: ['state'],
        evidence: ['agent-runs/settings/evidence.json'],
        scenario: { expected: { selectors: [{ selector: 'main' }], statePaths: ['/settings'] } }
      }
    ]
  },
  backend: {
    endpoints: [
      { path: '/api/health', method: 'GET', feature: 'system' }
    ],
    adapters: ['node', 'cloudflare', 'custom']
  }
});

const normalized = normalizeFrontierFrameworkConfig(config);
assert.strictEqual(normalized.workspace.kind, 'monorepo');
assert.strictEqual(normalized.frontend.routes.length, 3);
assert.strictEqual(normalized.frontend.incremental, true);
assert.strictEqual(normalized.frontend.cacheDir, '.frontier-framework/cache/frontend');
assert.strictEqual(normalized.routeScenarios.enabled, true);
assert.strictEqual(normalized.routeScenarios.fixtures.length, 3);
assert.strictEqual(normalized.routeScenarios.scenarios.length, 3);
assert.ok(normalized.routeScenarios.manifestFile.endsWith('route-scenarios/manifest.json'));
assert.strictEqual(normalized.surfaces.enabled, true);
assert.ok(normalized.surfaces.statuses.some((status) => status.id === 'verified' && status.terminal === true));
assert.strictEqual(normalized.surfaces.coverage.enabled, true);
assert.strictEqual(normalized.surfaces.coverage.failOnMissing, true);
assert.strictEqual(normalized.surfaces.coverage.verifyEvidenceProbeKinds, true);
assert.deepStrictEqual(normalized.surfaces.coverage.evidenceProbeTokens.action, ['actionIds']);
assert.deepStrictEqual(normalized.surfaces.coverage.focusKinds, ['route', 'page', 'filter', 'action', 'workflow']);
assert.ok(normalized.surfaces.coverage.reportFile.endsWith('surfaces/coverage.json'));
assert.ok(normalized.surfaces.coverage.dashboardFile.endsWith('surfaces/dashboard.md'));
assert.ok(normalized.surfaces.coverage.requireRenderForKinds.includes('page'));
assert.deepStrictEqual(normalized.surfaces.coverage.requireProbesForKinds.filter, ['state']);
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'page.root.guest' && surface.status === 'verified'));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'page.root.guest' && surface.contracts.some((contract) => contract.kind === 'evidence-ok')));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'filter.worlds.mine' && surface.aliases.includes('mine')));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'action.world.publish' && surface.coverage.includes('action')));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'page.settings.agent' && surface.tags.includes('surface-intent')));
assert.ok(normalized.surfaces.intents.some((intent) => intent.id === 'page.settings.agent'));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'route:/' && surface.kind === 'route'));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'route:/home' && surface.source === 'route'));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'route:/settings' && surface.source === 'route'));
assert.ok(normalized.surfaces.surfaces.some((surface) => surface.id === 'feature:home' && surface.kind === 'feature'));
assert.ok(normalized.backend.adapters.includes('custom'));
assert.strictEqual(normalized.vite.enabled, true);
assert.strictEqual(normalized.vite.hmr, true);
assert.strictEqual(normalized.vite.devServer.hmr, true);
assert.strictEqual(normalized.componentPreview.enabled, true);
assert.strictEqual(normalized.componentPreview.outDir, '.frontier-framework/component-preview');
assert.ok(normalized.componentPreview.include.some((entry) => entry.endsWith('src/components')));
assert.strictEqual(normalized.documentation.enabled, true);
assert.strictEqual(normalized.documentation.outDir, '.frontier-framework/documentation');
assert.ok(normalized.documentation.include.includes('README.md'));
assert.ok(normalized.documentation.include.includes('features'));
assert.ok(normalized.documentation.include.some((entry) => entry.endsWith('src/components')));
assert.strictEqual(normalized.devtools.floatingButton, true);
assert.strictEqual(normalized.devtools.autoBridge, true);
assert.strictEqual(normalized.devtools.patches, true);
assert.strictEqual(normalized.devtools.crdt, true);
assert.strictEqual(normalized.devtools.eventLog, true);
assert.strictEqual(normalized.devtools.traces, true);
assert.ok(normalized.devtools.maxRecords >= 100);
assert.strictEqual(normalized.auth.enabled, true);
assert.strictEqual(normalized.auth.sessionStrategy, 'jwt');
assert.ok(normalized.auth.providers.some((provider) => provider.id === 'frontier-session'));
assert.ok(normalized.auth.profile.access.includes('granted_access'));
assert.ok(normalized.auth.profile.legal.includes('accepted_privacy_policy'));
assert.ok(normalized.auth.routeGuards.some((gate) => gate.resource === '/api/health' && gate.required === false));
assert.ok(normalized.auth.routeGuards.some((gate) => gate.tags?.includes('transport') && gate.required === true));
assert.ok(normalized.auth.tokenContracts.some((contract) => contract.id === 'runtime-room'));
assert.strictEqual(normalized.migrations.enabled, true);
assert.strictEqual(normalized.migrations.autoMigrateState, true);
assert.ok(normalized.migrations.sources.some((source) => source.kind === 'query-cache'));
assert.ok(normalized.migrations.runtimeBridgeFile.endsWith('frontier-runtime-migrations.mjs'));
assert.strictEqual(normalized.sourcePolicy.enabled, true);
assert.strictEqual(normalized.sourcePolicy.preset, 'adapter');
assert.strictEqual(normalized.sourcePolicy.enforcement, 'error');
assert.strictEqual(normalized.sourcePolicy.maxFrontierComponentsPerFile, 1);
assert.strictEqual(normalized.sourcePolicy.maxCharsPerFile, 24000);
assert.strictEqual(normalized.sourcePolicy.localImportExtensions, 'source');
assert.ok(normalized.sourcePolicy.include.some((entry) => entry.endsWith('src/components')));
assert.strictEqual(normalized.sourcePolicy.businessLogic, true);
assert.ok(normalized.sourcePolicy.domainRoots.some((entry) => entry.endsWith('packages/domain/src')));
assert.ok(normalized.sourcePolicy.sourceGraphFile.endsWith('source-graph.json'));
assert.strictEqual(normalized.conformance.enabled, true);
assert.strictEqual(normalized.conformance.mode, 'strict');
assert.strictEqual(normalized.conformance.enforcement, 'error');
assert.strictEqual(normalized.conformance.failOnViolation, true);
assert.ok(normalized.conformance.requiredPackageUses.some((use) => use.id === 'frontend-frontier-design' && use.perSource === true && use.mode === 'import'));
assert.strictEqual(normalized.harness.generatedDir, '.frontier-framework/harness');
assert.strictEqual(normalized.harness.replayFailures, true);
assert.strictEqual(normalized.agent.generatedDir, '.frontier-framework/agent');
assert.strictEqual(normalized.agent.requireFeatureManifest, true);
assert.ok(normalized.backend.transports.some((transport) => transport.kind === 'crdt-websocket'));
assert.ok(normalized.backend.transports.some((transport) => transport.kind === 'event-log'));
assert.ok(normalized.harness.commands.some((command) => command.kind === 'fuzz'));

assert.strictEqual(FRONTIER_FRAMEWORK_CONFIG_SCHEMA.type, 'object');
const configValidation = validateFrontierFrameworkConfig(config);
assert.strictEqual(configValidation.kind, 'frontier.framework.config.validation');
assert.strictEqual(configValidation.ok, true);
assert.ok(configValidation.explain.some((entry) => entry.path === 'sourcePolicy.maxLinesPerFile'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'vite.hmr'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'migrations.sources'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'auth.providers'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'componentPreview.outDir'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'documentation.outDir'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'conformance.requiredPackageUses'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'routeScenarios.scenarios'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.surfaces'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.surfaces[].coverage'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.intents'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.intents[].scenario'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.coverage.failOnMissing'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.coverage.focusKinds'));
assert.ok(configValidation.explain.some((entry) => entry.path === 'surfaces.coverage.requireProbesForKinds'));
const hmrDisabled = normalizeFrontierFrameworkConfig({ vite: { hmr: false, devServer: { hmr: true } } });
assert.strictEqual(hmrDisabled.vite.hmr, false);
assert.strictEqual(hmrDisabled.vite.devServer.hmr, false);
assert.ok(validateFrontierFrameworkConfig({ vite: { hmr: false, devServer: { hmr: true } } }).diagnostics.some((diagnostic) => diagnostic.id === 'config.vite.hmr.conflict'));
const conformanceOff = normalizeFrontierFrameworkConfig({ conformance: { mode: 'off' } });
assert.strictEqual(conformanceOff.conformance.enabled, false);
assert.strictEqual(conformanceOff.conformance.failOnViolation, false);
const conformanceMigration = normalizeFrontierFrameworkConfig({ conformance: { mode: 'migration' } });
assert.strictEqual(conformanceMigration.conformance.enabled, true);
assert.strictEqual(conformanceMigration.conformance.enforcement, 'warn');
assert.strictEqual(conformanceMigration.conformance.failOnViolation, false);
const strictAppPolicy = normalizeFrontierFrameworkConfig({ sourcePolicy: { preset: 'strict-app' } });
assert.ok(strictAppPolicy.sourcePolicy.include.some((entry) => entry === 'apps/web/src'));
assert.ok(strictAppPolicy.sourcePolicy.include.some((entry) => entry === 'apps/api/src'));
assert.strictEqual(strictAppPolicy.sourcePolicy.maxCharsPerFile, 24000);
assert.strictEqual(strictAppPolicy.sourcePolicy.localImportExtensions, 'source');
const runtimeModule = defineRuntimeModule('runtime.forms', {
  file: 'apps/web/src/runtime/forms.ts',
  bindings: [bindDomEvents({ events: ['click'] }), bindFormActions({ actions: ['form.submit'] })]
});
assert.deepStrictEqual(runtimeModule.owns, ['dom-events', 'form-actions']);
assert.ok(runtimeModule.bindings.some((binding) => binding.capabilities.includes('forms.dispatch')));
const routeScenarioManifest = createRouteScenarioManifest(config);
assert.strictEqual(routeScenarioManifest.summary.scenarioCount, 3);
assert.strictEqual(routeScenarioManifest.summary.redirectCount, 1);
assert.ok(routeScenarioManifest.scenarios.some((scenario) => scenario.id === 'surface-page-settings-agent' && scenario.expected.statePaths.includes('/settings')));
const routeScenarioPlaywrightPlan = createRouteScenarioPlaywrightPlan(config, { baseUrl: 'http://localhost:3000' });
assert.strictEqual(routeScenarioPlaywrightPlan.cases.length, 3);
assert.ok(routeScenarioPlaywrightPlan.cases.some((testCase) => testCase.url === 'http://localhost:3000/home'));
assert.ok(routeScenarioPlaywrightPlan.cases.some((testCase) => testCase.url === 'http://localhost:3000/settings'));
assert.ok(routeScenarioPlaywrightPlan.cases.some((testCase) => testCase.steps.includes('assert-dom-roles')));
const surfaceRegistry = createSurfaceRegistry(config);
assert.strictEqual(surfaceRegistry.kind, 'frontier.framework.surface-status.registry');
assert.ok(surfaceRegistry.summary.statusCounts.verified >= 1);
assert.ok(surfaceRegistry.surfaces.some((surface) => surface.kind === 'filter' && surface.status === 'planned'));
assert.ok(surfaceRegistry.surfaces.some((surface) => surface.id === 'page.settings.agent' && surface.metadata.generatedFrom === 'surfaces.intents'));
const filterStatusReport = createSurfaceStatusReport(config, { kind: 'filter' });
assert.strictEqual(filterStatusReport.kind, 'frontier.framework.surface-status.report');
assert.strictEqual(filterStatusReport.summary.matchCount, 1);
assert.strictEqual(filterStatusReport.summary.statusCounts.planned, 1);
assert.ok(filterStatusReport.surfaces.every((surface) => surface.kind === 'filter'));
assert.strictEqual(filterStatusReport.coverage?.ok, true);
assert.ok(filterStatusReport.coverage?.records.some((record) => record.surfaceId === 'filter.worlds.mine' && record.covered.includes('state')));
const aliasStatusReport = createSurfaceStatusReport(config, { ref: 'worlds.mine' });
assert.strictEqual(aliasStatusReport.summary.matchCount, 1);
assert.strictEqual(aliasStatusReport.surfaces[0].id, 'filter.worlds.mine');
assert.strictEqual(aliasStatusReport.coverage?.records[0].nextCommand, 'inspect');
const homeStatusReport = createSurfaceStatusReport(config, { route: '/home' });
assert.ok(homeStatusReport.surfaces.some((surface) => surface.id === 'route:/home' && surface.status === 'untracked'));
const homeRefStatusReport = createSurfaceStatusReport(config, { ref: 'home' });
assert.ok(homeRefStatusReport.surfaces.some((surface) => surface.id === 'route:/home'));
const surfaceCoverage = createSurfaceCoverageReport(config);
assert.strictEqual(surfaceCoverage.kind, 'frontier.framework.surface-coverage.report');
assert.strictEqual(surfaceCoverage.ok, true);
assert.ok(surfaceCoverage.dashboard.byKind.page.total >= 1);
assert.ok(surfaceCoverage.dashboard.byProbe.evidence.total >= 1);
assert.ok(surfaceCoverage.records.some((record) => record.surface.id === 'filter.worlds.mine' && record.covered.includes('state')));
assert.ok(surfaceCoverage.records.some((record) => record.surface.id === 'action.world.publish' && record.covered.includes('action')));
assert.ok(surfaceCoverage.records.some((record) => (
  record.surface.id === 'page.settings.agent'
  && record.covered.includes('render')
  && record.covered.includes('state')
)));
assert.ok(surfaceCoverage.records.some((record) => record.surface.id === 'page.root.guest' && record.contractProofs.some((proof) => proof.kind === 'evidence-ok' && proof.status === 'planned')));
assert.ok(surfaceCoverage.dashboard.byContract['evidence-ok'].planned >= 1);
assert.ok(surfaceCoverage.summary.coveredProbeCount >= 2);
assert.strictEqual(surfaceCoverage.summary.nextProbeCount, 0);
const coverageAcceptanceConfig = normalizeFrontierFrameworkConfig({
  ...config,
  surfaces: {
    ...config.surfaces,
    coverage: {
      ...config.surfaces.coverage,
      verifyEvidenceFiles: false,
      verifyEvidenceFreshness: false,
      verifyEvidenceProbeKinds: false
    }
  }
});
const verifiedSurfaceCoverage = verifySurfaceCoverageEvidence(
  process.cwd(),
  coverageAcceptanceConfig,
  surfaceCoverage,
  createFrontierFramework(config).tests
);
assert.strictEqual(verifiedSurfaceCoverage.acceptance?.kind, 'frontier.framework.surface-coverage.acceptance');
assert.strictEqual(verifiedSurfaceCoverage.acceptance?.run.kind, 'frontier.test.run');
assert.strictEqual(verifiedSurfaceCoverage.acceptance?.proof.kind, 'frontier.test.proof');
assert.strictEqual(verifiedSurfaceCoverage.acceptance?.run.status, 'failed');
assert.ok(verifiedSurfaceCoverage.acceptance?.run.results[0].error?.includes('Surface coverage'));
const agentLoop = createFrontierAgentLoopReport(config);
assert.strictEqual(agentLoop.kind, 'frontier.framework.agent-loop.report');
assert.strictEqual(agentLoop.ok, true);
assert.ok(agentLoop.focusKinds.includes('action'));
assert.ok(agentLoop.focusKinds.includes('workflow'));
assert.ok(agentLoop.dashboard.focus.page.total >= 1);
assert.strictEqual(agentLoop.summary.nextProbes, 0);
assert.ok(agentLoop.summary.workItems >= 1);
assert.strictEqual(agentLoop.summary.requiredWorkItems, 0);
assert.ok(agentLoop.workQueue.every((item) => item.required === false));
assert.ok(agentLoop.artifacts.loop.endsWith('surface-loop.json'));
const missingSurfaceCoverage = createSurfaceCoverageReport({
  surfaces: { surfaces: [{ id: 'page.missing', kind: 'page', route: '/missing', status: 'verified' }] }
});
assert.strictEqual(missingSurfaceCoverage.ok, false);
assert.ok(missingSurfaceCoverage.records.some((record) => record.surface.id === 'page.missing' && record.missing.includes('evidence') && record.missing.includes('render')));
assert.ok(missingSurfaceCoverage.records.some((record) => record.surface.id === 'page.missing' && record.nextProbes.some((probe) => probe.command === 'attach-evidence')));
assert.ok(missingSurfaceCoverage.dashboard.byProbe.render.missing >= 1);
const missingAgentLoop = createFrontierAgentLoopReport({
  surfaces: { coverage: { failOnMissing: true }, surfaces: [{ id: 'page.missing', kind: 'page', route: '/missing', status: 'verified' }] }
}, { kind: 'page' });
assert.strictEqual(missingAgentLoop.ok, false);
assert.strictEqual(missingAgentLoop.strict, true);
assert.ok(missingAgentLoop.missing.some((surface) => surface.id === 'page.missing' && surface.nextCommand === 'attach-evidence'));
assert.ok(missingAgentLoop.missing.some((surface) => surface.id === 'page.missing' && surface.nextProbes.some((probe) => probe.command === 'add-route-scenario')));
assert.strictEqual(missingAgentLoop.dashboard.focus.page.missing, 1);
assert.strictEqual(missingAgentLoop.summary.nextProbes, 2);
assert.strictEqual(missingAgentLoop.summary.workItems, 2);
assert.strictEqual(missingAgentLoop.summary.requiredWorkItems, 2);
assert.deepStrictEqual(missingAgentLoop.workQueue.map((item) => item.command), ['add-route-scenario', 'attach-evidence']);
assert.ok(missingAgentLoop.workQueue.every((item) => item.acceptance.some((entry) => entry.includes('frontier loop'))));
const missingStatusReport = createSurfaceStatusReport({
  surfaces: { coverage: { failOnMissing: true }, surfaces: [{ id: 'page.missing', kind: 'page', route: '/missing', status: 'verified' }] }
}, { kind: 'page' });
assert.strictEqual(missingStatusReport.coverage?.ok, false);
assert.ok(missingStatusReport.coverage?.records.some((record) => record.nextCommand === 'attach-evidence' && record.missing.includes('render')));
const missingActionLoop = createFrontierAgentLoopReport({
  surfaces: { surfaces: [{ id: 'action.missing', kind: 'action', status: 'planned', coverage: ['action'] }] }
}, { kind: 'action' });
assert.strictEqual(missingActionLoop.ok, false);
assert.ok(missingActionLoop.missing.some((surface) => surface.id === 'action.missing' && surface.missing.includes('action')));
assert.deepStrictEqual(missingActionLoop.workQueue.map((item) => item.command), ['attach-action-evidence', 'attach-evidence']);
const invalidConfigValidation = validateFrontierFrameworkConfig({
  frontend: { routes: [{ path: 'missing-slash', file: '' }] },
  routeScenarios: {
    fixtures: [{ id: 'guest' }, { id: 'guest' }],
    scenarios: [{ id: 'bad-scenario', route: 'home', authFixture: 'missing-fixture' }]
  },
  surfaces: {
    statuses: ['planned', 'planned'],
    coverage: { focusKinds: ['page', ''], requireEvidenceForStatuses: ['verified', ''], evidenceProbeTokens: { action: [''] } },
    surfaces: [{ id: 'bad-surface', kind: '', aliases: ['ok', ''], route: 'home', status: 'unknown-status' }],
    intents: [
      { id: 'bad-surface', kind: 'page', route: 'settings', scenario: { path: 'settings', fixtures: [''] } },
      { id: 'bad-intent-scenario', kind: 'page', route: '/settings', scenario: 'yes' }
    ]
  },
  sourcePolicy: { enforcement: 'strict', maxLinesPerFile: true, maxCharsPerFile: true, localImportExtensions: 'runtime-js' },
  conformance: {
    mode: 'always',
    enforcement: 'strict',
    requiredPackageUses: [{ id: 'bad-use', package: '', mode: 'sometimes' }]
  },
  harness: { mode: 'always' }
});
assert.strictEqual(invalidConfigValidation.ok, false);
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'frontend.routes[0].path' && diagnostic.suggestedFix));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'routeScenarios.fixtures[1].id'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'routeScenarios.scenarios[0].route'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'routeScenarios.scenarios[0].authFixture'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.statuses[1]'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.surfaces[0].kind'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.coverage.requireEvidenceForStatuses'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.coverage.focusKinds'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.coverage.evidenceProbeTokens.action'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.surfaces[0].aliases'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.surfaces[0].route'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.surfaces[0].status'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.intents[0].id'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.intents[0].route'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.intents[0].scenario.path'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.intents[0].scenario.fixtures'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.intents[1].scenario'));
const defaultSurfaceStatusValidation = validateFrontierFrameworkConfig({
  surfaces: { surfaces: [{ id: 'page.typo', kind: 'page', status: 'not-a-default-status' }] }
});
assert.ok(defaultSurfaceStatusValidation.diagnostics.some((diagnostic) => diagnostic.path === 'surfaces.surfaces[0].status'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.enforcement'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.maxLinesPerFile'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.maxCharsPerFile'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'sourcePolicy.localImportExtensions'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'conformance.mode'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'conformance.enforcement'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'conformance.requiredPackageUses[0].package'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'conformance.requiredPackageUses[0].mode'));
assert.ok(invalidConfigValidation.diagnostics.some((diagnostic) => diagnostic.path === 'harness.mode'));
assert.ok(explainFrontierFrameworkConfig('sourcePolicy').some((entry) => entry.path === 'sourcePolicy.enforcement'));
assert.ok(explainFrontierFrameworkConfig('hmr').some((entry) => entry.path === 'vite.hmr'));

const plan = createFrontierFramework(config);
assert.strictEqual(plan.config.id, 'example.frontier');
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-dom'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-design'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-component-preview'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-documentation'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-schema'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-auth'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-ast-walk'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-migrations'));
assert.ok(plan.packages.some((pkg) => pkg.name === '@shapeshift-labs/frontier-crdt-sync'));
assert.ok(plan.routes.routes.some((route) => route.resource.endsWith('/api/health') && route.tags.includes('backend')));
assert.ok(plan.routes.routes.some((route) => route.id === 'transport:sync.crdt.websocket'));
assert.strictEqual(plan.auth.kind, 'frontier.auth.manifest');
assert.ok(plan.auth.providers.some((provider) => provider.id === 'frontier-service-token'));
assert.ok(plan.auth.gates.some((gate) => gate.resource === '/api/health' && gate.required === false));
assert.ok(plan.auth.gates.some((gate) => gate.tags.includes('transport') && gate.required === true));
assert.ok(plan.auth.tokenContracts.some((contract) => contract.id === 'runtime-room' && contract.requiredClaims.includes('roomId')));
assert.ok(plan.auth.runtimeGrants.some((grant) => grant.contract === 'runtime-room'));
assert.strictEqual(plan.routeScenarios.kind, 'frontier.framework.route-scenario.manifest');
assert.strictEqual(plan.routeScenarios.summary.scenarioCount, 3);
assert.strictEqual(plan.routeScenarioPlaywright.kind, 'frontier.framework.route-scenario.playwright-plan');
assert.ok(plan.routeScenarioPlaywright.probes.includes('dom-roles'));
assert.strictEqual(plan.surfaces.kind, 'frontier.framework.surface-status.registry');
assert.ok(plan.surfaces.summary.kindCounts.page >= 1);
assert.ok(plan.surfaces.summary.evidenceLinkedCount >= 1);
assert.strictEqual(plan.surfaceCoverage.kind, 'frontier.framework.surface-coverage.report');
assert.strictEqual(plan.surfaceCoverage.ok, true);
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.status'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent.loop'));
const authManifest = createFrontierAuthManifest(config);
assert.strictEqual(authManifest.id, 'example.frontier.auth');
assert.strictEqual(authManifest.summary.gateCount, plan.auth.summary.gateCount);
assert.ok(authManifest.linking.allowEmailFallback);
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'deploy:frontend'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'build:vite'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'build:frontend-cache'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'component-preview:book'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'documentation:book'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'source-policy:structure'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'source-graph:ast-walk'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'conformance:package-use'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'config:validation'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'auth:manifest'));
assert.ok(plan.manifest.entries.some((entry) => entry.id.startsWith('auth-gate:')));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'migrations:runtime-data'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'route-scenarios:manifest'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'route-scenario:guest-home-redirect'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'surfaces:status-registry'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'surfaces:coverage'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:surface-loop'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'surface:page.root.guest'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'harness:hybrid'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:build.backend'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:build.frontend-cache'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:component-preview.generate'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:documentation.generate'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:devtools.overlay'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:source-policy.check'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:source-graph.walk'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:conformance.lint'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:config.validation'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:auth.manifest'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:migrations.runtime-data'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:route-scenario.plan'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:surface-status.plan'));
assert.ok(plan.effects.effects.some((effect) => effect.id === 'effect:surface-coverage.plan'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.build'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.component-preview.build'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.documentation.build'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.harness'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.sync.inspect'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent.mcp'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent.ci-gates'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent.lint'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent.workflow'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.agent.replay'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.doctor'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.config.validate'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.config.explain'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.source-graph'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.lint'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.auth.inspect'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.migrations.inspect'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.route-scenarios'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.surfaces'));
assert.ok(plan.tools.actions.some((action) => action.id === 'frontier.coverage'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.backend-neutral'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.sync-transports'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.component-preview'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.documentation'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.route-discovery'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.route-scenarios'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.surfaces'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.surface-coverage'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.agent-loop'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.source-policy'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.conformance'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.config-validation'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.auth'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.runtime-migrations'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.agent-first'));
assert.ok(plan.tests.specs.some((spec) => spec.id === 'frontier-framework.doctor'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.vite'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.component-preview'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.documentation'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.source-graph'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.auth'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.migrations'));
assert.ok(plan.trace.spans.some((span) => span.id === 'frontier-framework.agent'));
assert.ok(plan.research.some((item) => item.id === 'property-fuzz-corpus'));
assert.ok(plan.research.some((item) => item.id === 'filesystem-route-discovery'));
assert.ok(plan.research.some((item) => item.id === 'runtime-data-migrations'));
assert.ok(plan.research.some((item) => item.id === 'frontier-native-auth-contracts'));
assert.ok(plan.runtimeAdapters.some((adapter) => adapter.id === 'hono.adapters'));
assert.ok(plan.syncAdapters.some((adapter) => adapter.id === 'electric.shape-stream'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'research:local-first-sync-catalog'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'research:runtime-data-migrations'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'research:frontier-native-auth-contracts'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'runtime-adapter:nitro.presets'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'sync-adapter:yjs.websocket'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:plan'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:mcp-tools'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:ci-gates'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:lint-sarif'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:workflow'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent:issue-pr-handoff'));
assert.ok(plan.manifest.entries.some((entry) => entry.id === 'agent-capability:agent.handoff'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'build:documentation'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'doctor:framework'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'auth:inspect'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'migrations:inspect'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'surfaces:status-registry'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'surfaces:coverage'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'agent:surface-loop'));
assert.ok(plan.manifest.tasks.some((task) => task.id === 'agent:replay'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.harness'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.loop'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.documentation'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.mcp-tools'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.ci-gates'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.sarif'));
assert.ok(plan.agent.capabilities.some((capability) => capability.id === 'agent.replay'));
assert.ok(plan.agent.checkpoints.some((checkpoint) => checkpoint.id === 'agent.feature-contract'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'frontend-cache'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'component-preview'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'component-preview-evidence'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'documentation'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'documentation-evidence'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'route-discovery'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'route-scenarios'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'route-scenario-playwright'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'surfaces'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'surface-coverage'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'surface-dashboard'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'devtools-bridge'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'source-policy'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'source-graph'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'source-registry'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'conformance'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'conformance-sarif'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'config-validation'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'auth-manifest'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'auth-evidence'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'runtime-migrations'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'runtime-migration-bridge'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-surface-loop'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-mcp-tools'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-ci-gates'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-linter-report'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-sarif'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-workflow'));
assert.ok(plan.artifacts.some((artifact) => artifact.id === 'agent-replay-script'));
assert.ok(plan.application.nodes.length > 0);
assert.notStrictEqual(plan.manifestProof.hash.length, 0);

const agentPlan = createFrontierAgentPlan(config);
assert.strictEqual(agentPlan.kind, 'frontier.framework.agent.plan');
assert.ok(agentPlan.requirements.featureManifest);

const deployPlan = createFrontierDeployPlan(config);
assert.ok(deployPlan.deployTargets.some((target) => target.target === 'frontend'));
assert.ok(deployPlan.deployTargets.some((target) => target.target === 'backend'));
assert.ok(deployPlan.artifacts.some((artifact) => artifact.id === 'frontend'));
assert.strictEqual(deployPlan.manifestProof.hash, plan.manifestProof.hash);

const scaffold = createFrontierFrameworkScaffold({ name: 'sample-frontier' });
const scaffoldPackageJson = JSON.parse(scaffold.find((file) => file.path === 'package.json').content);
const scaffoldConfig = scaffold.find((file) => file.path === 'frontier.config.mjs').content;
const scaffoldViteConfig = scaffold.find((file) => file.path === 'vite.config.ts').content;
assert.ok(scaffold.some((file) => file.path === 'apps/web/src/routes/index.tsx'));
assert.ok(scaffold.some((file) => file.path === 'apps/api/src/handler.ts'));
assert.ok(scaffold.some((file) => file.path === 'packages/contracts/src/index.ts'));
assert.ok(scaffold.some((file) => file.path === 'packages/contracts/src/migrations.ts'));
assert.ok(scaffold.some((file) => file.path === 'packages/domain/src/index.ts'));
assert.ok(scaffold.some((file) => file.path === 'vite.config.ts'));
assert.ok(scaffoldConfig.includes('hmr: true'));
assert.ok(scaffoldConfig.includes('routeScenarios:'));
assert.ok(scaffoldConfig.includes('surfaces:'));
assert.ok(scaffoldConfig.includes('componentPreview:'));
assert.ok(scaffoldConfig.includes('documentation:'));
assert.ok(scaffoldConfig.includes('auth:'));
assert.ok(scaffoldConfig.includes('sourceGraphFile:'));
assert.ok(scaffoldConfig.includes('migrations:'));
assert.ok(scaffoldConfig.includes('conformance:'));
assert.ok(scaffoldViteConfig.includes('frontierFrameworkVite(frontierConfig)'));
assert.ok(scaffold.some((file) => file.path === 'features/app-shell.json'));
assert.ok(scaffold.some((file) => file.path === '.gitignore'));
assert.ok(scaffold.some((file) => file.path === 'AGENTS.md'));
assert.strictEqual(scaffoldPackageJson.scripts.browser, 'frontier build --target evidence && node .frontier-framework/harness/frontier-browser-smoke.mjs');
assert.strictEqual(scaffoldPackageJson.scripts.preview, 'frontier build --target evidence');
assert.strictEqual(scaffoldPackageJson.scripts['agent:replay'], 'frontier build --target evidence && node .frontier-framework/agent/frontier-agent-replay.mjs --required-only');
assert.strictEqual(scaffoldPackageJson.scripts.migrations, 'frontier migrations --json');
assert.strictEqual(scaffoldPackageJson.scripts.auth, 'frontier auth --json');
assert.strictEqual(scaffoldPackageJson.scripts.docs, 'frontier docs build --json');
assert.strictEqual(scaffoldPackageJson.scripts.lint, 'frontier lint --json');
assert.strictEqual(scaffoldPackageJson.scripts.loop, 'frontier loop --json');
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-design']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-auth']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-ast-walk']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-migrations']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-component-preview']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-documentation']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-test']);
assert.ok(scaffoldPackageJson.dependencies['@shapeshift-labs/frontier-linter']);
assert.ok(scaffoldPackageJson.devDependencies['fast-check']);
assert.ok(scaffoldPackageJson.devDependencies['@playwright/test']);
assert.ok(scaffoldPackageJson.devDependencies['@shapeshift-labs/frontier-linter']);
assert.ok(scaffoldPackageJson.devDependencies['@shapeshift-labs/frontier-playwright']);
assert.ok(FRONTIER_FRAMEWORK_DEFAULT_PACKAGE_STACK.length >= 20);
assert.ok(FRONTIER_FRAMEWORK_DEFAULT_BACKEND_TRANSPORTS.some((transport) => transport.kind === 'state-cache'));
assert.ok(FRONTIER_FRAMEWORK_RESEARCH_INSIGHTS.length >= 6);
assert.ok(FRONTIER_FRAMEWORK_RUNTIME_ADAPTER_CATALOG.some((adapter) => adapter.id === 'tanstack.server-functions'));
assert.ok(FRONTIER_FRAMEWORK_SYNC_ADAPTER_CATALOG.some((adapter) => adapter.id === 'automerge.repo'));
assert.ok(FRONTIER_FRAMEWORK_DEFAULT_AGENT_CHECKPOINTS.some((checkpoint) => checkpoint.id === 'agent.handoff'));

const vitePlugin = frontierFrameworkVite(config);
assert.strictEqual(vitePlugin.name, 'frontier-framework');
assert.ok(vitePlugin.transformIndexHtml?.('<html><body></body></html>').includes('virtual:frontier-framework/devtools'));
const hmrDisabledVitePluginConfig = frontierFrameworkVite({ vite: { hmr: false } }).config?.();
assert.strictEqual(hmrDisabledVitePluginConfig.server.hmr, false);

const overlay = renderFrontierDevtoolsOverlayModule(config);
assert.ok(overlay.includes('captureSnapshot'));
assert.ok(overlay.includes('rewindOneStep'));
assert.ok(overlay.includes('recordPatch'));
assert.ok(overlay.includes('recordCrdtUpdate'));
assert.ok(overlay.includes('recordEventLogEntry'));
assert.ok(overlay.includes('recordTrace'));
assert.ok(overlay.includes('recordTelemetry'));
assert.ok(overlay.includes('frontier.framework.devtools.bridge'));
