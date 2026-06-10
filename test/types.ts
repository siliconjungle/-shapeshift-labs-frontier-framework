import {
  createFrontierAuthManifest,
  createFrontierAgentLoopReport,
  createFrontierAgentPlan,
  createFrontierFramework,
  createRouteScenarioManifest,
  createRouteScenarioPlaywrightPlan,
  createSurfaceRegistry,
  createSurfaceStatusReport,
  bindDomEvents,
  defineRuntimeModule,
  defineFrontierConfig,
  validateFrontierFrameworkConfig,
  type FrontierFrameworkConfig,
  type FrontierFrameworkConfigValidationResult,
  type FrontierFrameworkPlan
} from '../src/index.ts';

const config: FrontierFrameworkConfig = defineFrontierConfig({
  name: 'Typed Frontier',
  workspace: { kind: 'monorepo' },
  frontend: {
    routes: [
      { path: '/', file: 'apps/web/src/routes/index.tsx' },
      { path: '/home', file: 'apps/web/src/routes/home.tsx' }
    ],
    cacheDir: '.frontier-framework/cache/frontend',
    incremental: true
  },
  routeScenarios: {
    fixtures: [
      { id: 'guest-session', kind: 'auth', data: { authenticated: false } },
      { id: 'creator-session', kind: 'auth', data: { authenticated: true } }
    ],
    scenarios: [
      {
        id: 'guest-home-redirect',
        route: '/home',
        authFixture: 'guest-session',
        expected: { redirectTo: '/', domRoles: [{ role: 'main' }] }
      },
      {
        id: 'creator-home',
        route: '/home',
        authFixture: 'creator-session',
        expected: { finalPath: '/home', selectors: [{ selector: 'main' }] }
      }
    ]
  },
  surfaces: {
    statuses: ['planned', 'implemented', { id: 'verified', terminal: true }],
    coverage: { requireProbesForKinds: { filter: ['state'] } },
    surfaces: [
      { id: 'page.root', kind: 'page', route: '/', aliases: ['root'], status: 'verified', evidence: ['dist/frontier/evidence.json'] },
      { id: 'filter.mine', kind: 'filter', aliases: ['mine'], status: 'planned', coverage: ['state'], dependsOn: ['/worlds'], evidence: ['agent-runs/filter/evidence.json'] }
    ],
    intents: [
      {
        id: 'page.settings.agent',
        kind: 'page',
        route: '/settings',
        status: 'implemented',
        coverage: ['state'],
        scenario: {
          expected: {
            selectors: [{ selector: 'main' }],
            statePaths: ['/settings']
          }
        }
      }
    ]
  },
  backend: {
    adapters: ['node', 'edge'],
    endpoints: [{ path: '/api/health', method: 'GET' }],
    transports: [
      { kind: 'crdt-websocket', protocol: 'websocket', path: '/sync/:documentId' },
      { kind: 'event-log', protocol: 'sse', path: '/events/:streamId' }
    ]
  },
  vite: {
    enabled: true,
    hmr: true,
    strict: false
  },
  devtools: {
    enabled: true,
    rewind: true
  },
  auth: {
    enabled: true,
    sessionStrategy: 'jwt',
    providers: [{ id: 'discord', kind: 'oauth', scopes: ['identify', 'email'], pkce: true }],
    profile: {
      requireSubject: true,
      fields: ['username'],
      access: ['granted_access'],
      legal: ['accepted_terms_of_use', 'accepted_privacy_policy']
    },
    gates: [{ id: 'admin-api', resource: '/api/admin/*', required: true, roles: ['admin'], profile: true }],
    tokenContracts: [{ id: 'runtime-room', kind: 'runtime-room', issuer: 'typed.auth', audience: 'typed.runtime', requiredClaims: ['roomId', 'userId'] }],
    runtimeGrants: [{ id: 'runtime-room', contract: 'runtime-room', resource: '/realtime/:roomId', audience: 'typed.runtime' }]
  },
  migrations: {
    enabled: true,
    currentVersion: '2',
    initialVersion: '1',
    strict: false,
    autoMigrateState: true,
    autoMigrateCache: true,
    sources: [
      { id: 'app-state', kind: 'state', required: true, versionPath: '/$version' },
      { id: 'query-cache', kind: 'query-cache', dataVersionPaths: ['/metadata/dataVersion'] }
    ]
  },
  sourcePolicy: {
    enabled: true,
    preset: 'strict-app',
    enforcement: 'error',
    maxFrontierComponentsPerFile: 1,
    maxLinesPerFile: 320,
    maxCharsPerFile: 24000,
    runtimeModules: [
      defineRuntimeModule('typed.runtime.dom-events', {
        file: 'apps/web/src/runtime/dom-events.ts',
        bindings: [bindDomEvents({ target: 'document', events: ['click'] })]
      })
    ],
    include: ['apps/web/src', 'apps/api/src'],
    exclude: ['**/*.test.*']
  },
  harness: {
    mode: 'recommended',
    generatedDir: '.frontier-framework/harness',
    corpusDir: 'test/fixtures/frontier-framework-corpus',
    browserTrace: 'retain-on-failure',
    fuzzers: { command: 'npm run fuzz' },
    benchmarks: { command: 'npm run bench' }
  },
  agent: {
    enabled: true,
    generatedDir: '.frontier-framework/agent',
    manifestDir: 'features',
    runsDir: 'agent-runs',
    handoffMode: 'required',
    maxOpenQuestions: 3,
    checkpoints: [
      { id: 'typed-agent-checkpoint', title: 'Typed agent checkpoint', required: false, source: 'handoff' }
    ]
  }
});

const plan: FrontierFrameworkPlan = createFrontierFramework(config);
const authManifest = createFrontierAuthManifest(config);
const agentPlan = createFrontierAgentPlan(config);
const agentLoopReport = createFrontierAgentLoopReport(config);
const routeScenarioManifest = createRouteScenarioManifest(config);
const routeScenarioPlaywrightPlan = createRouteScenarioPlaywrightPlan(config);
const surfaceRegistry = createSurfaceRegistry(config);
const surfaceStatusReport = createSurfaceStatusReport(config, { kind: 'filter', status: 'planned', ref: 'mine' });
const validation: FrontierFrameworkConfigValidationResult = validateFrontierFrameworkConfig(config);
plan.config.migrations.sources[0].kind satisfies string;
routeScenarioManifest.scenarios[0].expected.domRoles[0].role satisfies string;
routeScenarioPlaywrightPlan.cases[0].steps satisfies string[];
surfaceRegistry.surfaces[0].status satisfies string;
surfaceRegistry.surfaces[0].aliases satisfies string[];
surfaceRegistry.surfaces[1].coverage satisfies string[];
plan.config.surfaces.intents[0].scenario satisfies boolean | object | undefined;
surfaceStatusReport.summary.matchCount satisfies number;
surfaceStatusReport.coverage?.records[0]?.nextCommand satisfies string | undefined;
agentLoopReport.workQueue[0]?.command satisfies string | undefined;
agentLoopReport.summary.workItems satisfies number;
authManifest.tokenContracts[0].issuer satisfies string;
void plan;
void authManifest;
void agentPlan;
void agentLoopReport;
void routeScenarioManifest;
void routeScenarioPlaywrightPlan;
void surfaceRegistry;
void surfaceStatusReport;
void validation;
