# @sleepyhallow/vortex native packages

Per-platform native binary packages for [vortex](https://github.com/jeffpecky/vortex).

These packages contain prebuilt native binaries for a single `platform`/`arch` target:

| Package | Platform | Architecture |
| --- | --- | --- |
| `@sleepyhallow/vortex-win32-x64` | Windows | x64 |
| `@sleepyhallow/vortex-win32-arm64` | Windows | arm64 |
| `@sleepyhallow/vortex-linux-x64` | Linux | x64 |
| `@sleepyhallow/vortex-linux-arm64` | Linux | arm64 |
| `@sleepyhallow/vortex-darwin-x64` | macOS | x64 |
| `@sleepyhallow/vortex-darwin-arm64` | macOS | arm64 |

## Do not install directly

These packages are automatically installed as optional dependencies of
[`@sleepyhallow/vortex`](https://www.npmjs.com/package/@sleepyhallow/vortex), which picks the right
one for your platform at install time. You should never need to install a native package directly —
install `@sleepyhallow/vortex` instead.
