import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  createFrontierDeployPlan,
  createFrontierFramework,
  createFrontierFrameworkScaffold
} from './dist/index.js';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(packageDir, '..', '..');
const args = parseArgs(process.argv.slice(2));

const rows = [];
rows.push(measure('plan-80-routes-40-endpoints', () => {
  createFrontierFramework(createLargeConfig());
}, args.runs));

rows.push(measure('deploy-plan-80-routes-40-endpoints', () => {
  createFrontierDeployPlan(createLargeConfig());
}, args.runs));

rows.push(measure('scaffold-monorepo', () => {
  createFrontierFrameworkScaffold({ name: 'bench-frontier' });
}, args.runs * 2));

if (args.cliBuild) {
  rows.push(await measureCliDiscovery(args));
  rows.push(...await measureCliBuild(args));
}

const result = {
  kind: 'frontier.framework.package.benchmark',
  generatedAt: new Date().toISOString(),
  rows
};

if (args.out) {
  const outFile = path.resolve(rootDir, args.out);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(result, null, 2) + '\n', 'utf8');
}

process.stdout.write(JSON.stringify(result, null, 2) + '\n');

function measure(name, fn, runs) {
  const values = [];
  for (let index = 0; index < runs; index++) {
    const start = performance.now();
    fn();
    values.push(performance.now() - start);
  }
  values.sort((a, b) => a - b);
  return summarize(name, values);
}

function createLargeConfig() {
  const routes = Array.from({ length: 80 }, (_, index) => ({
    path: index === 0 ? '/' : '/route-' + index,
    file: 'apps/web/src/routes/route-' + index + '.tsx',
    feature: 'feature-' + (index % 8)
  }));
  const endpoints = Array.from({ length: 40 }, (_, index) => ({
    path: '/api/item-' + index,
    method: index % 2 ? 'POST' : 'GET',
    feature: 'api-' + (index % 5)
  }));
  return {
    id: 'bench.frontier',
    name: 'Bench Frontier',
    frontend: { routes },
    backend: { endpoints }
  };
}

async function measureCliBuild(options) {
  const cli = path.join(packageDir, 'dist', 'cli.js');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'frontier-framework-bench-'));
  execFileSync(process.execPath, [cli, 'init', 'fixture', '--name', 'Build Bench', '--no-install'], {
    cwd: tmp,
    stdio: 'pipe'
  });
  const appDir = path.join(tmp, 'fixture');
  const routesDir = path.join(appDir, 'apps/web/src/routes');
  const componentsDir = path.join(appDir, 'apps/web/src/components');
  await fs.writeFile(path.join(componentsDir, 'SharedView.tsx'), [
    'export function SharedView(props) {',
    '  return <section><h1>{props.title}</h1><p>Shared component body</p></section>;',
    '}',
    ''
  ].join('\n'), 'utf8');
  const routes = [];
  for (let index = 0; index < options.routes; index++) {
    const file = 'route-' + index + '.tsx';
    const entry = 'Page' + index;
    await fs.writeFile(path.join(routesDir, file), [
      "import { SharedView } from '../components/SharedView';",
      '',
      'export default function ' + entry + '() {',
      '  return <SharedView title="Route ' + index + '" />;',
      '}',
      ''
    ].join('\n'), 'utf8');
    routes.push({
      path: index === 0 ? '/' : '/route-' + index,
      file: 'apps/web/src/routes/' + file,
      entry,
      feature: 'bench'
    });
  }
  await fs.writeFile(path.join(appDir, 'frontier.config.mjs'), [
    '/** @type {import("@shapeshift-labs/frontier-framework").FrontierFrameworkConfig} */',
    'export default {',
    "  id: 'build-bench',",
    "  name: 'Build Bench',",
    '  frontend: { root: \'apps/web\', outDir: \'dist/frontend\', evidenceDir: \'dist/frontier\', routes: ' + JSON.stringify(routes) + ' },',
    "  backend: { root: 'apps/api', entry: 'src/handler.ts', outDir: 'dist/backend' },",
    '  vite: { enabled: false },',
    "  harness: { mode: 'recommended' }",
    '};',
    ''
  ].join('\n'), 'utf8');
  const coldValues = [];
  const cliRuns = Math.max(1, Math.min(options.runs, 16));
  for (let index = 0; index < cliRuns; index++) {
    await fs.rm(path.join(appDir, 'dist'), { recursive: true, force: true });
    await fs.rm(path.join(appDir, '.frontier-framework'), { recursive: true, force: true });
    const start = performance.now();
    execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--target', 'frontend', '--json'], {
      stdio: 'pipe'
    });
    coldValues.push(performance.now() - start);
  }
  const warmValues = [];
  for (let index = 0; index < cliRuns; index++) {
    const start = performance.now();
    execFileSync(process.execPath, [cli, 'build', '--cwd', appDir, '--target', 'frontend', '--json'], {
      stdio: 'pipe'
    });
    warmValues.push(performance.now() - start);
  }
  return [
    summarize('cli-frontend-build-' + options.routes + '-shared-routes-cold', coldValues),
    summarize('cli-frontend-build-' + options.routes + '-shared-routes-warm-cache', warmValues)
  ];
}

async function measureCliDiscovery(options) {
  const cli = path.join(packageDir, 'dist', 'cli.js');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'frontier-framework-discovery-bench-'));
  execFileSync(process.execPath, [cli, 'init', 'discovery', '--name', 'Discovery Bench', '--no-install'], {
    cwd: tmp,
    stdio: 'pipe'
  });
  const appDir = path.join(tmp, 'discovery');
  const routesDir = path.join(appDir, 'apps/web/src/routes');
  for (let index = 0; index < options.routes; index++) {
    const file = index % 4 === 0
      ? path.join('(bench)', 'flat-' + index + '.$id.tsx')
      : index % 4 === 1
        ? path.join('nested-' + index, '[slug]', '+page.tsx')
        : index % 4 === 2
          ? path.join('files-' + index, '$.tsx')
          : 'route-' + index + '.tsx';
    const full = path.join(routesDir, file);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, [
      'export default function Route' + index + '() {',
      '  return <main>Route ' + index + '</main>;',
      '}',
      ''
    ].join('\n'), 'utf8');
  }
  const values = [];
  const cliRuns = Math.max(1, Math.min(options.runs, 16));
  for (let index = 0; index < cliRuns; index++) {
    const start = performance.now();
    const output = execFileSync(process.execPath, [cli, 'inspect', '--cwd', appDir, '--json'], {
      stdio: 'pipe'
    });
    values.push(performance.now() - start);
    if (index === 0) {
      const plan = JSON.parse(output.toString());
      const routeCount = plan.routes.routes.filter((route) => route.kind === 'route').length;
      if (routeCount < options.routes) throw new Error('discovery benchmark route count too low: ' + routeCount);
    }
  }
  return summarize('cli-inspect-discovery-' + options.routes + '-routes', values);
}

function summarize(name, values) {
  const sorted = [...values].sort((a, b) => a - b);
  const meanMs = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  return {
    name,
    runs: sorted.length,
    meanMs,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))],
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1]
  };
}

function parseArgs(argv) {
  const parsed = {
    runs: 60,
    routes: 40,
    cliBuild: false,
    out: ''
  };
  for (let index = 0; index < argv.length; index++) {
    const value = argv[index];
    if (value === '--runs') parsed.runs = Number(argv[++index]);
    else if (value === '--routes') parsed.routes = Number(argv[++index]);
    else if (value === '--cli-build') parsed.cliBuild = true;
    else if (value === '--out') parsed.out = argv[++index];
  }
  return parsed;
}
