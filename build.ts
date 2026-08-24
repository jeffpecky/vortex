#!/usr/bin/env bun
/**
 * Build script for Vortex (Claude Code source extraction).
 *
 * Replicates Anthropic's build pipeline:
 * 1. feature() flags resolved via Bun plugin (compile-time replacement)
 * 2. MACRO.* constants inlined at compile time
 * 3. Single-file bundle targeting Bun runtime
 *
 * To enable a feature: set it to true in FEATURE_FLAGS below.
 * WARNING: Only enable flags marked SAFE. Others will crash at runtime
 * because source modules are missing or stubbed.
 *
 * Usage:
 *   bun run build              → dist/cli.js (JS bundle, dev/runtime)
 *   bun run build -- --compile → dist/vortex (standalone binary, --compile
 *     embeds native .node files as $bunfs assets)
 *
 * Source structure:
 * - src/ - main source code
 * - src/vendor/ - vendor packages (@ant/, @anthropic-ai/, etc.)
 */

import type { BunPlugin } from 'bun';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const version = process.env.VERSION || JSON.parse(readFileSync('package.json', 'utf8')).version;
const buildTime = new Date().toISOString();

// ── Compile mode ───────────────────────────────────────────────────────────
const shouldCompile = process.argv.includes('--compile');

async function ensureSandboxRuntimeDist() {
  const entrypoint = 'src/vendor/@anthropic-ai/sandbox-runtime/src/index.ts';
  const outfile = 'src/vendor/@anthropic-ai/sandbox-runtime/dist/index.js';
  const needsBuild =
    !existsSync(outfile) || statSync(outfile).mtimeMs < statSync(entrypoint).mtimeMs;

  if (!needsBuild) return;

  console.log('Building @anthropic-ai/sandbox-runtime dist...');
  mkdirSync(path.dirname(outfile), { recursive: true });

  const result = await Bun.build({
    entrypoints: [entrypoint],
    outdir: path.dirname(outfile),
    target: 'bun',
    sourcemap: 'linked',
  });

  if (!result.success) {
    console.error('Failed to build @anthropic-ai/sandbox-runtime:');
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }
}

function copyRipgrepSidecar() {
  if (!shouldCompile) return;

  const source = path.join(
    'vendor',
    'ripgrep',
    `${process.arch}-${process.platform}`,
    process.platform === 'win32' ? 'rg.exe' : 'rg',
  );
  if (!existsSync(source)) {
    console.log(`  - ripgrep sidecar skipped (${source} not found)`);
    return;
  }

  mkdirSync('dist', { recursive: true });
  const destination = path.join(
    'dist',
    process.platform === 'win32' ? 'rg.exe' : 'rg',
  );
  copyFileSync(source, destination);
  console.log(`  ✓ ripgrep sidecar → ${destination}`);
}

// ── Feature Flags ─────────────────────────────────────────────────────────
//
// Status key:
//   SAFE    = source exists, tested, works
//   UNTESTED = source exists but not verified at runtime
//   MISSING = required source files don't exist, will crash
//   STUB    = module exists but is an empty stub
//   INFRA   = needs backend infrastructure we don't have
//
const FEATURE_FLAGS: Record<string, boolean> = {
  // ── TESTED & WORKING ──────────────────────────────────────────────
  VOICE_MODE: true,                  // hold-to-talk dictation

  // ── TESTING NOW (source exists, loaded without crash) ─────────────
  COORDINATOR_MODE: true,            // multi-agent coordination
  TOKEN_BUDGET: true,                // token budget controls
  TEAMMEM: true,                     // team memory sync
  AGENT_TRIGGERS: true,              // scheduled agent tasks
  MESSAGE_ACTIONS: true,             // action buttons on messages
  HOOK_PROMPTS: true,                // hook prompt injection
  AWAY_SUMMARY: true,                // summary after being away
  BG_SESSIONS: true,                 // background sessions
  BUDDY: true,                       // companion mode
  DUMP_SYSTEM_PROMPT: true,          // --dump-system-prompt flag
  COWORKER_TYPE_TELEMETRY: true,     // telemetry metadata

  // ── INFRA (needs Anthropic cloud) ─────────────────────────────────
  ULTRAPLAN: false,                  // INFRA: spawns remote CCR session on claude.ai
  BRIDGE_MODE: false,                // INFRA: needs bridge server
  CHICAGO_MCP: false,                // INFRA: needs native Swift/Rust binaries
  TRANSCRIPT_CLASSIFIER: false,      // MISSING: prompt .txt files DCE'd from leak

  // ── MISSING SOURCE ────────────────────────────────────────────────
  KAIROS: false,                     // MISSING: src/assistant/index.ts, src/proactive/
  KAIROS_BRIEF: false,               // MISSING: depends on KAIROS
  PROACTIVE: false,                  // MISSING: src/proactive/
  WORKFLOW_SCRIPTS: false,           // MISSING: WorkflowTool.ts
  WEB_BROWSER_TOOL: false,           // MISSING: WebBrowserPanel.ts
  TERMINAL_PANEL: false,             // MISSING: TerminalCaptureTool/
  EXPERIMENTAL_SKILL_SEARCH: false,  // MISSING: DiscoverSkillsTool/
  HISTORY_SNIP: false,               // STUB: empty snipCompact.ts
  CACHED_MICROCOMPACT: false,        // STUB: empty cachedMicrocompact.ts

  // ── OFF by design ─────────────────────────────────────────────────
  ABLATION_BASELINE: false,          // DEGRADES quality — never enable
  OVERFLOW_TEST_TOOL: false,         // internal test tool
};

// ── Bun Plugin: bun:bundle shim ───────────────────────────────────────────
const bunBundlePlugin: BunPlugin = {
  name: 'bun-bundle-shim',
  setup(build) {
    build.onResolve({ filter: /^bun:bundle$/ }, () => ({
      path: 'bun:bundle',
      namespace: 'bun-bundle-shim',
    }));

    build.onLoad({ filter: /.*/, namespace: 'bun-bundle-shim' }, () => ({
      contents: `
        const FLAGS = ${JSON.stringify(FEATURE_FLAGS)};
        export function feature(name) {
          return FLAGS[name] ?? false;
        }
      `,
      loader: 'js',
    }));
  },
};

// ── Native addon paths for --compile mode ─────────────────────────────────
//
// Bun's --compile embeds .node files reachable via static require() calls.
// We use --define to replace process.env.*_NODE_PATH with a literal path
// relative to the source file that does the require(). Bun traces the now-
// static require(), resolves the .node on disk, and embeds it into $bunfs.

const vendorAddons = [
  {
    envVar: 'AUDIO_CAPTURE_NODE_PATH',
    sourceFile: 'src/vendor/audio-capture-src/index.ts',
    vendorPath: `vendor/audio-capture/${process.arch}-${process.platform}/audio-capture.node`,
  },
  {
    envVar: 'MODIFIERS_NODE_PATH',
    sourceFile: 'src/vendor/modifiers-napi-src/index.ts',
    vendorPath: `vendor/modifiers-napi/${process.arch}-${process.platform}/modifiers.node`,
  },
  {
    envVar: 'COMPUTER_USE_SWIFT_NODE_PATH',
    sourceFile: 'src/vendor/@ant/computer-use-swift/js/index.js',
    vendorPath: `vendor/computer-use-swift/${process.arch}-${process.platform}/computer_use.node`,
  },
  {
    envVar: 'COMPUTER_USE_INPUT_NODE_PATH',
    sourceFile: 'src/vendor/@ant/computer-use-input/js/index.js',
    vendorPath: `vendor/computer-use-input/${process.arch}-${process.platform}/computer-use-input.node`,
  },
];

const nativeDefines: Record<string, string> = {};

if (shouldCompile) {
  console.log('\nNative addon paths (--compile mode):');
  for (const addon of vendorAddons) {
    if (existsSync(addon.vendorPath)) {
      const relPath = path.relative(
        path.dirname(path.resolve(addon.sourceFile)),
        path.resolve(addon.vendorPath),
      ).replace(/\\/g, '/');
      const normalized = relPath.startsWith('.') ? relPath : './' + relPath;
      nativeDefines[`process.env.${addon.envVar}`] = JSON.stringify(normalized);
      console.log(`  ✓ ${addon.envVar} → ${normalized}`);
    } else {
      console.log(`  - ${addon.envVar} skipped (${addon.vendorPath} not found)`);
    }
  }
}

// ── Build ─────────────────────────────────────────────────────────────────
await ensureSandboxRuntimeDist();

console.log(`\nBuilding Vortex (Claude Code v${version})...`);

const enabledFlags = Object.entries(FEATURE_FLAGS)
  .filter(([, v]) => v)
  .map(([k]) => k);
if (enabledFlags.length > 0) {
  console.log(`Enabled flags: ${enabledFlags.join(', ')}`);
} else {
  console.log(`All feature flags disabled (external build)`);
}

const outfileName = shouldCompile
  ? `dist/vortex${process.platform === 'win32' ? '.exe' : ''}`
  : undefined;

const result = await Bun.build({
  entrypoints: ['src/entrypoints/cli.tsx'],
  outdir: shouldCompile ? undefined : 'dist',
  target: 'bun',
  sourcemap: 'linked',
  plugins: [bunBundlePlugin],
  define: {
    'MACRO.VERSION': JSON.stringify(version),
    'MACRO.BUILD_TIME': JSON.stringify(buildTime),
    'MACRO.FEEDBACK_CHANNEL': JSON.stringify('#claude-code'),
    'MACRO.ISSUES_EXPLAINER': JSON.stringify(
      'report the issue at https://github.com/anthropics/claude-code/issues',
    ),
    ...nativeDefines,
  },
  external: ['react-devtools-core', 'sharp'],
  ...(shouldCompile ? { compile: { outfile: outfileName } } : {}),
});

if (!result.success) {
  console.error('Build failed:');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

if (shouldCompile) {
  console.log(`Build succeeded: ${outfileName}`);
  copyRipgrepSidecar();
} else {
  console.log(`Build succeeded: dist/cli.js (${(result.outputs[0]!.size / 1024 / 1024).toFixed(1)} MB)`);
}
