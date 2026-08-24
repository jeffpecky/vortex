# Source Extraction Notice

This directory contains the source code of `@anthropic-ai/claude-code@2.1.88`, extracted from the published npm package's source map (`cli.js.map`).

## How the source was obtained

```sh
npm pack @anthropic-ai/claude-code@2.1.88
tar xzf anthropic-ai-claude-code-2.1.88.tgz
# Extract sources from cli.js.map into source/
node -e '
const fs = require("fs"), path = require("path");
const map = JSON.parse(fs.readFileSync("cli.js.map", "utf8"));
for (let i = 0; i < map.sources.length; i++) {
  if (map.sourcesContent[i] == null || map.sources[i].includes("node_modules")) continue;
  const rel = map.sources[i].replace(/^\.\.\//g, "");
  const out = path.join("source", rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, map.sourcesContent[i]);
}'
```

## Install Vortex

Install the public package and run `vortex`:

```sh
npm install -g @sleepyhallow/vortex
vortex --help
```

## Source development

This reconstruction uses Bun for local development:

```sh
bun install
bun run build
bun run start
```

## Source layout

Vortex reconstructs build configuration and missing integration pieces around the extracted upstream source. The current repository builds with Bun; it is not the original published Anthropic package layout.

```
src/             # reconstructed TypeScript/TSX application source
stubs/           # placeholders and extracted reference implementations
build.ts         # Bun build configuration
package.json     # Vortex package and development metadata
README.md        # project, attribution, and usage guidance
```

---

# Claude Code

![](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square) [![npm]](https://www.npmjs.com/package/@anthropic-ai/claude-code)

[npm]: https://img.shields.io/npm/v/@anthropic-ai/claude-code.svg?style=flat-square

Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows -- all through natural language commands. Use it in your terminal, IDE, or tag @claude on Github.

**Learn more at [Claude Code Homepage](https://claude.com/product/claude-code)** | [Documentation](https://code.claude.com/docs/en/overview)

<img src="https://github.com/anthropics/claude-code/blob/main/demo.gif?raw=1" />

## Get started

1. Install Vortex:

```sh
npm install -g @sleepyhallow/vortex
```

2. Navigate to your project directory and run `vortex`.

## Reporting Bugs

For Vortex support and bug reports, file a [GitHub issue](https://github.com/jeffpecky/vortex/issues). Upstream Claude Code issues remain separate from this reconstruction.

## Connect on Discord

Join the [Claude Developers Discord](https://anthropic.com/discord) to connect with other developers using Claude Code. Get help, share feedback, and discuss your projects with the community.

## Privacy and upstream services

Vortex reconstruction maintainers do not claim to operate Anthropic services, collect Claude Code feedback, or provide Anthropic's privacy safeguards. When Vortex connects to Anthropic services, Anthropic's own terms and policies apply to those services.

See Anthropic's [data usage policies](https://code.claude.com/docs/en/data-usage), [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms), and [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy) for upstream service details.
