# Vortex NPM Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish Vortex as `@sleepyhallow/vortex` with six platform-specific native packages and an automated public npm release workflow.

**Architecture:** Root package becomes a small Node launcher with exact-version optional dependencies on six native packages. Build scripts stage each native executable and sibling ripgrep into generated package directories; GitHub Actions builds on matching runners, packs all packages, publishes native packages first, then publishes launcher package.

**Tech Stack:** Node.js ESM launcher, Bun native compilation, npm workspaces/package tarballs, Bun tests, GitHub Actions, npm trusted publishing.

---

### Task 1: Rename Public Package Identity

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Test: `__tests__/package.test.ts`

**Step 1: Write failing package identity assertions**

Add assertions requiring:

```ts
expect(pkg.name).toBe('@sleepyhallow/vortex')
expect(pkg.version).toBe('0.1.0')
expect(pkg.bin).toEqual({ vortex: 'bin/vortex.js' })
expect(pkg.homepage).toBe('https://github.com/jeffpecky/vortex')
expect(pkg.publishConfig).toEqual({ access: 'public', provenance: true })
```

**Step 2: Run test to verify it fails**

Run: `bun test __tests__/package.test.ts`

Expected: FAIL because package still uses Anthropic identity and `claude` bin.

**Step 3: Update package metadata**

Set package name, version, author, homepage, bugs URL, bin, files allowlist, and public publish config. Preserve runtime dependency metadata needed for source development. Remove upstream `prepublishOnly` guard and replace it later with package verification.

**Step 4: Update installation documentation**

Replace public installation examples with:

```bash
npm install -g @sleepyhallow/vortex
vortex
```

Retain a clearly labeled source-development section using Bun.

**Step 5: Run focused test**

Run: `bun test __tests__/package.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add package.json README.md __tests__/package.test.ts
git commit -m "chore: rename package to vortex"
```

### Task 2: Implement Platform Launcher

**Files:**
- Create: `bin/platform-package.js`
- Create: `bin/vortex.js`
- Create: `__tests__/platform-launcher.test.ts`

**Step 1: Write failing platform mapping tests**

Test exact mappings:

```ts
expect(getPlatformPackage('win32', 'x64')).toBe('@sleepyhallow/vortex-win32-x64')
expect(getPlatformPackage('win32', 'arm64')).toBe('@sleepyhallow/vortex-win32-arm64')
expect(getPlatformPackage('linux', 'x64')).toBe('@sleepyhallow/vortex-linux-x64')
expect(getPlatformPackage('linux', 'arm64')).toBe('@sleepyhallow/vortex-linux-arm64')
expect(getPlatformPackage('darwin', 'x64')).toBe('@sleepyhallow/vortex-darwin-x64')
expect(getPlatformPackage('darwin', 'arm64')).toBe('@sleepyhallow/vortex-darwin-arm64')
expect(() => getPlatformPackage('freebsd', 'x64')).toThrow('Unsupported platform')
```

Also test executable names: `vortex.exe` on Windows, `vortex` elsewhere.

**Step 2: Run test to verify it fails**

Run: `bun test __tests__/platform-launcher.test.ts`

Expected: FAIL because launcher modules do not exist.

**Step 3: Implement pure platform mapping**

Export `getPlatformPackage(platform, arch)` and `getExecutableName(platform)` from `bin/platform-package.js`. Use one literal mapping object; no abstraction beyond lookup and clear unsupported-target error.

**Step 4: Implement launcher**

`bin/vortex.js` must:

1. Resolve `<platform-package>/package.json` with `createRequire(import.meta.url)`.
2. Build `bin/vortex[.exe]` path relative to package root.
3. Spawn synchronously with `process.argv.slice(2)`, `stdio: 'inherit'`, and Windows hidden-window behavior.
4. Forward child exit status and signal failures.
5. Print expected package and `npm install -g @sleepyhallow/vortex` when optional dependency is missing.

Do not download anything during install or runtime.

**Step 5: Test launcher behavior with fixture package**

Create temporary fixture package/executable in test setup. Verify forwarded args and child exit code without invoking real Vortex.

**Step 6: Run focused tests**

Run: `bun test __tests__/platform-launcher.test.ts`

Expected: PASS.

**Step 7: Commit**

```bash
git add bin __tests__/platform-launcher.test.ts
git commit -m "feat: add native platform launcher"
```

### Task 3: Define Native Package Manifests

**Files:**
- Create: `npm/native/win32-x64/package.json`
- Create: `npm/native/win32-arm64/package.json`
- Create: `npm/native/linux-x64/package.json`
- Create: `npm/native/linux-arm64/package.json`
- Create: `npm/native/darwin-x64/package.json`
- Create: `npm/native/darwin-arm64/package.json`
- Create: `npm/native/README.md`
- Create: `__tests__/native-packages.test.ts`

**Step 1: Write failing manifest tests**

For each target assert:

- Name equals `@sleepyhallow/vortex-<platform>-<arch>`.
- Version equals root package version.
- `os` and `cpu` contain exactly matching values.
- `files` contains `bin/`, `README.md`, and `LICENSE.md`.
- Package is public and has repository metadata.

**Step 2: Run test to verify it fails**

Run: `bun test __tests__/native-packages.test.ts`

Expected: FAIL because manifests are absent.

**Step 3: Add minimal manifests**

Use package type `module`, public `publishConfig`, repository URL, no scripts, no dependencies, and no executable mapping. Main launcher owns global command shim.

**Step 4: Add shared native package README**

State package is installed automatically by `@sleepyhallow/vortex` and should not normally be installed directly.

**Step 5: Run tests**

Run: `bun test __tests__/native-packages.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add npm/native __tests__/native-packages.test.ts
git commit -m "feat: define native npm packages"
```

### Task 4: Add Exact Optional Dependencies

**Files:**
- Modify: `package.json`
- Modify: `__tests__/package.test.ts`

**Step 1: Write failing dependency assertions**

Assert all six native packages exist in `optionalDependencies` and each value exactly equals root package version, with no caret or tilde.

**Step 2: Run test to verify it fails**

Run: `bun test __tests__/package.test.ts`

Expected: FAIL because optional native packages are absent.

**Step 3: Add optional dependencies**

Add all six packages at exact `0.1.0`.

**Step 4: Run test**

Run: `bun test __tests__/package.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add package.json __tests__/package.test.ts
git commit -m "feat: select native package during npm install"
```

### Task 5: Stage Native Package Files

**Files:**
- Create: `scripts/prepare-native-package.ts`
- Create: `scripts/prepare-native-package.test.ts`
- Modify: `package.json`

**Step 1: Write failing staging tests**

Use a temporary directory. Assert staging:

- Reads root version.
- Rejects manifest version mismatch.
- Requires compiled Vortex executable and matching vendored ripgrep.
- Copies both into target `bin/`.
- Copies README and license.
- Sets Unix executable modes to `0o755`.
- Leaves Windows filenames with `.exe`.
- Fails rather than producing partial package when input is missing.

**Step 2: Run test to verify it fails**

Run: `bun test scripts/prepare-native-package.test.ts`

Expected: FAIL because staging script does not exist.

**Step 3: Implement staging script**

Accept explicit CLI options:

```text
--platform win32|linux|darwin
--arch x64|arm64
--executable <path>
--output <path>
```

Use Node/Bun filesystem standard library only. Validate all inputs before copying. Do not add a dependency.

**Step 4: Add package script**

```json
"package:native": "bun scripts/prepare-native-package.ts"
```

**Step 5: Run tests**

Run: `bun test scripts/prepare-native-package.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add scripts/prepare-native-package.ts scripts/prepare-native-package.test.ts package.json
git commit -m "build: stage native npm packages"
```

### Task 6: Verify NPM Tarballs

**Files:**
- Create: `scripts/verify-npm-packages.ts`
- Create: `scripts/verify-npm-packages.test.ts`
- Modify: `package.json`

**Step 1: Write failing package-verification tests**

Assert verifier rejects:

- Missing native executable.
- Missing ripgrep.
- Wrong package name/version/os/cpu.
- Unix files without executable mode.
- Unexpected source, credentials, or build files in tarball inventory.
- Main package missing launcher or exact optional dependency.

**Step 2: Run test to verify it fails**

Run: `bun test scripts/verify-npm-packages.test.ts`

Expected: FAIL because verifier is absent.

**Step 3: Implement verifier**

Use `npm pack --json --dry-run` output for inventory and direct manifest/filesystem checks for binary modes. Keep checks deterministic and offline.

**Step 4: Add package scripts**

```json
"verify:npm-packages": "bun scripts/verify-npm-packages.ts",
"prepack": "bun run verify:npm-packages"
```

Ensure native package publishing invokes verifier explicitly; native manifests should not reference root-relative scripts.

**Step 5: Run tests and dry runs**

Run:

```bash
bun test scripts/verify-npm-packages.test.ts
npm pack --dry-run
```

Expected: tests PASS; dry-run inventory contains only launcher package files.

**Step 6: Commit**

```bash
git add scripts/verify-npm-packages.ts scripts/verify-npm-packages.test.ts package.json
git commit -m "build: verify npm release contents"
```

### Task 7: Add Cross-Platform Release Workflow

**Files:**
- Create: `.github/workflows/release-npm.yml`
- Create: `__tests__/release-workflow.test.ts`

**Step 1: Write failing workflow structure test**

Parse workflow text and assert:

- Trigger is `v*` tags plus manual dispatch.
- Permissions include `contents: write` and publish job `id-token: write`.
- Matrix contains six targets.
- Bun version is pinned.
- Native jobs run tests, compile, verify ripgrep, stage package, `npm pack`, and upload artifact.
- Publish job downloads all artifacts, publishes six native packages before main package, uses `--access public --provenance`, and creates checksums/GitHub Release.

**Step 2: Run test to verify it fails**

Run: `bun test __tests__/release-workflow.test.ts`

Expected: FAIL because workflow is absent.

**Step 3: Implement native build matrix**

Use matching runners:

- `windows-latest` for Windows x64.
- Windows arm64 runner only if available to repository; otherwise build arm64 in a dedicated supported runner or mark target deferred rather than publishing an untested artifact.
- `ubuntu-latest` for Linux x64.
- `ubuntu-24.04-arm` for Linux arm64.
- `macos-13` for macOS x64.
- `macos-14` for macOS arm64.

Do not claim a target unless its native executable is smoke-tested on matching architecture.

**Step 4: Implement publish ordering**

Publish native tarballs serially, verify each npm version exists, then pack and publish root launcher last. Use npm trusted publisher; do not use repository token secrets.

**Step 5: Add GitHub Release assets**

Attach seven npm tarballs and `SHA256SUMS` to release generated from tag.

**Step 6: Run workflow test**

Run: `bun test __tests__/release-workflow.test.ts`

Expected: PASS.

**Step 7: Commit**

```bash
git add .github/workflows/release-npm.yml __tests__/release-workflow.test.ts
git commit -m "ci: publish cross-platform npm releases"
```

### Task 8: Add Packed Installation Smoke Test

**Files:**
- Create: `scripts/smoke-npm-install.ts`
- Create: `scripts/smoke-npm-install.test.ts`
- Modify: `.github/workflows/release-npm.yml`
- Modify: `package.json`

**Step 1: Write failing smoke harness test**

Test harness must create isolated npm prefix and HOME, install launcher and matching native tarball without network, invoke `vortex --version`, then uninstall and verify command removal.

Use fixture native executable in unit test; release workflow uses real package tarballs.

**Step 2: Run test to verify it fails**

Run: `bun test scripts/smoke-npm-install.test.ts`

Expected: FAIL because harness is absent.

**Step 3: Implement smoke harness**

Use `npm install -g <launcher.tgz> <native.tgz> --prefix <temp>`. Set temporary config paths so smoke run never touches real `~/.claude`.

**Step 4: Add package script and workflow step**

```json
"smoke:npm-install": "bun scripts/smoke-npm-install.ts"
```

Run real smoke on every native build job before artifact upload.

**Step 5: Run tests**

Run: `bun test scripts/smoke-npm-install.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add scripts/smoke-npm-install.ts scripts/smoke-npm-install.test.ts package.json .github/workflows/release-npm.yml
git commit -m "test: smoke packed vortex installation"
```

### Task 9: Final Release Verification

**Files:**
- Modify if needed: `README.md`
- Modify if needed: `docs/plans/2026-08-24-npm-release-design.md`

**Step 1: Run all deterministic tests**

Run:

```bash
bun test
```

Expected: all tests PASS.

**Step 2: Run static checks**

Run:

```bash
bun run lint
git diff --check
```

Expected: no new errors. If repository-wide typecheck remains broken from known reconstruction gaps, record exact failures and run focused type checks for new launcher/scripts.

**Step 3: Verify current-host native package**

Run:

```bash
bun run build:compile
bun run package:native --platform <host-platform> --arch <host-arch> --executable <compiled-path> --output <staging-path>
bun run verify:npm-packages
npm pack
bun run smoke:npm-install -- <launcher-tarball> <native-tarball>
```

Expected: build, package verification, pack, install, `vortex --version`, and uninstall all succeed.

**Step 4: Configure npm trusted publishing**

In npm package settings for all seven packages, trust repository `jeffpecky/vortex` and workflow `.github/workflows/release-npm.yml`. If npm requires first publication before trusted publishing, perform only the minimum documented bootstrap publication with 2FA, then remove any temporary token.

**Step 5: Create first release tag only after workflow dry run**

```bash
git tag v0.1.0
git push origin v0.1.0
```

Expected: workflow builds six native artifacts, publishes native packages, publishes launcher last, and creates GitHub Release.

**Step 6: Verify public installation**

From clean machine/container matching each supported target:

```bash
npm install -g @sleepyhallow/vortex@0.1.0
vortex --version
npm uninstall -g @sleepyhallow/vortex
```

Expected: install, execution, and uninstall succeed without Bun or repository checkout.

**Step 7: Commit final documentation corrections**

```bash
git add README.md docs
git commit -m "docs: document vortex npm installation"
```
