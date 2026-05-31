# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
bun install                # NOT npm/yarn — this project uses Bun exclusively
bun run build              # bundles to dist/cli.js (~23MB JS bundle, dev/runtime)
bun run build:compile      # → dist/vortex(.exe) standalone binary (embeds native .node files)
bun run start              # run the CLI (bun dist/cli.js)
bun run lint               # biome check src/
bun run test               # bun test
bun run typecheck          # tsc --noEmit
```

The build script is `build.ts`. Feature flags (`VOICE_MODE`, `COORDINATOR_MODE`, etc.) are resolved at compile time via a Bun plugin — see `FEATURE_FLAGS` in `build.ts`.

## What This Repo Is

Rebuilt Claude Code CLI from Anthropic's leaked source (1,929 files extracted from a source map). The `src/` directory is the original source. The `stubs/` directory contains proprietary code extracted from npm packages and source maps. This is not a fork — it's a reconstruction.

## Critical Gotchas

- **Feature flags:** Many flags are now `true` via `FEATURE_FLAGS` in `build.ts`. The Bun plugin intercepts `import { feature } from 'bun:bundle'` and resolves them at compile time. Flags marked `INFRA` or `MISSING` will crash if enabled.
- **MACRO.VERSION** is hardcoded to `2.1.88` in `build.ts`. Do not change this.
- **Auto-updater is patched:** `src/utils/autoUpdater.ts` line 72 has an early return to disable remote version checks. Do not remove this.
- **[STUB] files** contain minimal placeholder code. They exist because the source was missing (not in the leak), requires native binaries (Swift/Rust), or is Anthropic-internal (`USER_TYPE === 'ant'`). Do not try to "fix" or "complete" stubs unless explicitly asked.
- **stubs/ files are extracted source** — treat them as read-only reference material, not code to modify.

## Architecture (non-obvious parts only)

- **Entrypoint:** `src/main.tsx` — Commander.js CLI parser. Bootstrap is `src/entrypoints/cli.tsx`.
- **UI:** Custom Ink fork at `src/ink/` — this is NOT the npm `ink` package. It's a full React-based terminal renderer with custom flexbox layout (`src/native-ts/yoga-layout/`).
- **System prompt:** `src/constants/prompts.ts` — the actual instructions sent to Claude. This is the single most important file for understanding Claude Code's behavior.
- **Tools** live in `src/tools/` with each tool in its own directory (BashTool/, FileEditTool/, etc.).
- **Permissions classifier:** `src/utils/permissions/yoloClassifier.ts` (52KB) — auto-mode logic. The 3 prompt `.txt` files it references were dead-code-eliminated and are missing.
- **Plugin system:** `src/utils/plugins/` (65+ files) — fully working. Loads from `.claude/plugins/`.
- **Hook system:** `src/utils/hooks/` (155 files) — fully working. Config in `settings.json`.
- **CLAUDE.md loader:** `src/utils/claudemd.ts` — how this very file gets loaded. Supports `@path` includes, frontmatter with `paths:` globs, HTML comment stripping.

## Agent SDK Integration

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
const response = query({
  prompt: "your prompt",
  options: {
    pathToClaudeCodeExecutable: "/path/to/claude-code/dist/cli.js",
  },
});
```

SDK source is at `stubs/downloads/claude-agent-sdk/`.

## What Doesn't Work

- **Computer Use** — logic extracted (`stubs/@ant/computer-use-mcp/src/toolCalls.ts`, 137KB) but needs native Swift/Rust binaries for screen capture/input.
- **Auto-mode classifier prompts** — 3 `.txt` files were DCE'd by the TRANSCRIPT_CLASSIFIER flag.
- **Ultraplan** (`/ultraplan`) — spawns a remote CCR session on claude.ai. Needs Anthropic cloud infra and authenticated login.
- **Bridge mode** — needs Anthropic's bridge server infrastructure.
- **KAIROS / Assistant** — source files (`src/assistant/`, `src/proactive/`) not in leak.
- **Ant-only tools** (Tungsten, REPL, SuggestBackgroundPR) — internal Anthropic tools, never available externally.

## All 27 Stub Files Created

Files we created (not from the original leak) to satisfy imports. Each contains minimal placeholder code.

| # | File | Size | Reason |
|---|------|------|--------|
| 1 | `src/cli/bg.ts` | 194 B | Not in leak -- background sessions dispatcher |
| 2 | `src/services/compact/cachedMicrocompact.ts` | 227 B | Feature-gated (CACHED_MICROCOMPACT) -- source behind flag, DCE'd |
| 3 | `src/services/compact/snipCompact.ts` | 140 B | Feature-gated (HISTORY_SNIP) -- source behind flag, DCE'd |
| 4 | `src/services/contextCollapse/index.ts` | 383 B | Not in leak -- context collapse service never shipped |
| 5 | `src/types/connectorText.ts` | 344 B | Not in leak -- connector text block types |
| 6 | `src/tools/REPLTool/REPLTool.ts` | 105 B | Ant-only tool -- internal REPL, gated by USER_TYPE |
| 7 | `src/tools/TungstenTool/TungstenLiveMonitor.tsx` | 139 B | Ant-only component -- Tungsten debug monitor |
| 8 | `src/tools/TungstenTool/TungstenTool.ts` | 113 B | Ant-only tool -- Tungsten debugging, gated by USER_TYPE |
| 9 | `src/tools/WorkflowTool/constants.ts` | 93 B | Feature-gated (WORKFLOW_SCRIPTS) -- only exports tool name constant |
| 10 | `src/tools/SuggestBackgroundPRTool/SuggestBackgroundPRTool.ts` | 137 B | Ant-only tool -- background PR suggestions |
| 11 | `src/tools/VerifyPlanExecutionTool/VerifyPlanExecutionTool.ts` | 164 B | Env-gated (CLAUDE_CODE_VERIFY_PLAN) -- plan verification tool |
| 12 | `src/moreright/useMoreRight.tsx` | 3535 B | Ant-only hook -- from Anthropic's own external-stubs overlay |
| 13 | `src/ink/devtools.ts` | 248 B | Dev-only -- optional react-devtools-core integration |
| 14 | `src/commands/agents-platform/index.ts` | 108 B | Ant-only command -- agents platform management |
| 15 | `src/commands/assistant/assistant.tsx` | 232 B | Not in leak -- assistant/install wizard (KAIROS) |
| 16 | `src/assistant/AssistantSessionChooser.tsx` | 156 B | Not in leak -- assistant session chooser UI |
| 17 | `src/utils/protectedNamespace.ts` | 96 B | Ant-only -- protected namespace checker |
| 18 | `src/entrypoints/sdk/runtimeTypes.ts` | 1807 B | Not in leak -- SDK runtime types, hand-reconstructed from usage |
| 19 | `src/entrypoints/sdk/settingsTypes.generated.ts` | 78 B | Generated file -- was build-time generated, placeholder type |
| 20 | `src/entrypoints/sdk/toolTypes.ts` | 136 B | Not in leak -- SDK tool type definitions |
| 21 | `src/entrypoints/sdk/coreTypes.generated.ts` | 12582 B | Regenerated -- rebuilt from coreSchemas.ts via scripts/generate-sdk-types.ts |
| 22 | `src/utils/filePersistence/types.ts` | 453 B | Not in leak -- file persistence types for session outputs |
| 23 | `src/components/agents/SnapshotUpdateDialog.tsx` | 153 B | Not in leak -- snapshot update dialog component |
| 24 | `src/utils/permissions/bashClassifier.ts` | 1444 B | Ant-only -- prompt-based bash command classifier |
| 25 | `src/skills/bundled/verify/SKILL.md` | 43 B | Not in leak -- verify skill placeholder markdown |
| 26 | `stubs/@ant/computer-use-mcp/src/executor.ts` | 1631 B | Native binding -- Swift/Rust bridge interface, types only |
| 27 | `stubs/@ant/computer-use-mcp/src/subGates.ts` | 560 B | Not in leak -- permission sub-gate constants |

## When Modifying This Repo

- Always rebuild after source changes: `bun run build` (JS) or `bun run build:compile` (standalone binary)
- The build produces `dist/cli.js` (JS) or `dist/vortex(.exe)` (binary) — there's no dev server or watch mode
- If adding new stubs, they go in `stubs/` and need corresponding shim entries if they're imported as packages
- SDK types can be regenerated: `bun scripts/generate-sdk-types.ts`
- Feature flags live in `FEATURE_FLAGS` at the top of `build.ts` — do not enable flags marked `INFRA` or `MISSING`
