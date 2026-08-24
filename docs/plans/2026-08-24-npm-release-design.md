# Vortex NPM Release Design

## Goal

Distribute Vortex publicly through npm as `@sleepyhallow/vortex` without requiring users to install Bun. Keep native executables and ripgrep platform-specific, while exposing one `vortex` command on Windows, Linux, and macOS.

## Package Architecture

Publish one launcher package and six optional native packages at the same version:

- `@sleepyhallow/vortex`
- `@sleepyhallow/vortex-win32-x64`
- `@sleepyhallow/vortex-win32-arm64`
- `@sleepyhallow/vortex-linux-x64`
- `@sleepyhallow/vortex-linux-arm64`
- `@sleepyhallow/vortex-darwin-x64`
- `@sleepyhallow/vortex-darwin-arm64`

The launcher declares exact-version platform packages in `optionalDependencies`. Each native package declares matching `os` and `cpu` restrictions, so npm installs only the package compatible with the host.

## Runtime Layout

The launcher package contains `bin/vortex.js`. It maps `process.platform` and `process.arch` to the expected native package, resolves that package with Node's module resolver, and starts its native Vortex executable with inherited stdio and forwarded arguments.

Each native package contains:

```text
bin/vortex[.exe]
bin/rg[.exe]
package.json
README.md
LICENSE.md
```

Keeping `rg` beside Vortex preserves the existing sibling-binary resolver. Unix package preparation must preserve executable mode for both files.

## Identity And Versioning

Public npm identity becomes:

```json
{
  "name": "@sleepyhallow/vortex",
  "version": "0.1.0",
  "bin": {
    "vortex": "bin/vortex.js"
  },
  "homepage": "https://github.com/jeffpecky/vortex",
  "bugs": {
    "url": "https://github.com/jeffpecky/vortex/issues"
  }
}
```

Vortex package versions use independent semantic versioning. Claude compatibility version `2.1.88` remains internal runtime metadata and must not control npm package releases.

## Release Workflow

A `v*` tag starts a GitHub Actions matrix for:

- Windows x64 and arm64
- Linux x64 and arm64
- macOS x64 and arm64

Each native job runs on a matching architecture where available, installs a pinned Bun version, runs tests, builds the standalone executable, verifies the executable and ripgrep, creates the platform npm package, packs it with `npm pack`, and uploads the tarball.

The publish job downloads all six tarballs, verifies package names and exact versions, publishes platform packages first, then publishes the launcher package last. Publishing the launcher last prevents users from installing a version whose native package is missing.

The workflow also creates a public GitHub Release containing all npm tarballs and `SHA256SUMS` as portable/debug artifacts.

## Publishing Security

- Use npm trusted publishing with GitHub Actions and package provenance.
- Do not store or commit npm credentials.
- Grant workflow `contents: write` and `id-token: write` only where needed.
- Publish only from version tags and a protected GitHub environment.
- Use `npm publish --access public --provenance`.
- Reject a release if any target version already exists.
- Avoid postinstall downloads or arbitrary install scripts.

## Failure Handling

The launcher exits with a clear message when platform or architecture is unsupported, optional dependency installation was disabled, or the matching native package is unavailable. It includes the expected package name and a reinstall command.

Build jobs fail when vendored ripgrep is missing, binaries are not executable, `rg --version` fails, package metadata mismatches, or smoke execution fails.

## Verification

Automated checks cover:

- Platform-to-package mapping.
- Unsupported platform and architecture errors.
- Argument forwarding and native exit-code propagation.
- Exact optional dependency versions.
- Package `os` and `cpu` metadata.
- Tarball contents with `npm pack --dry-run`.
- Native executable and sibling ripgrep smoke tests on every release runner.

Install smoke tests run from packed tarballs rather than the source tree:

```bash
npm install -g ./sleepyhallow-vortex-0.1.0.tgz
vortex --version
npm uninstall -g @sleepyhallow/vortex
```

## Deferred Work

- Native Windows installer and macOS package signing.
- Homebrew, Winget, Chocolatey, or Linux distribution repositories.
- Automatic updates outside npm.
- Musl-specific Linux builds.
