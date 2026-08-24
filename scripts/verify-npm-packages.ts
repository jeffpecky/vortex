#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export const TARGETS = [
  ["darwin", "arm64"],
  ["darwin", "x64"],
  ["linux", "arm64"],
  ["linux", "x64"],
  ["win32", "x64"],
  ["win32", "arm64"],
] as const;

const ROOT_NAME = "@sleepyhallow/vortex";
const NATIVE_PREFIX = `${ROOT_NAME}-`;
const ROOT_ALLOWLIST = [
  "package.json",
  "README.md",
  "LICENSE.md",
  "bin/vortex.js",
  "bin/platform-package.js",
];
const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

type RootManifest = {
  name?: unknown;
  version?: unknown;
  repository?: unknown;
  publishConfig?: { access?: unknown; provenance?: unknown };
  optionalDependencies?: Record<string, string>;
};

type NativeManifest = {
  name?: unknown;
  version?: unknown;
  os?: unknown;
  cpu?: unknown;
  files?: unknown;
};

export type VerifyOptions = {
  repoRoot?: string;
  staged?: readonly string[];
  pack?: (dir: string) => string;
  rootOnly?: boolean;
};

function readJsonManifest(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${filePath} is not valid JSON (${(error as Error).message})`);
  }
}

function repoUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { url?: unknown }).url === "string") {
    return (value as { url: string }).url;
  }
  return "";
}

type PackFn = (dir: string) => string;

function verifyRoot(repoRoot: string, pack: PackFn): string[] {
  const failures: string[] = [];
  const fail = (message: string) => failures.push(`[root] ${message}`);

  let pkg: RootManifest;
  try {
    pkg = readJsonManifest(path.join(repoRoot, "package.json")) as RootManifest;
  } catch (error) {
    fail((error as Error).message);
    return failures;
  }

  if (!existsSync(path.join(repoRoot, "bin", "vortex.js"))) {
    fail("bin/vortex.js not found");
  }
  if (pkg.name !== ROOT_NAME) {
    fail(`name should be "${ROOT_NAME}", got ${JSON.stringify(pkg.name)}`);
  }
  if (typeof pkg.version !== "string" || !SEMVER.test(pkg.version)) {
    fail(`version is not a valid semver: ${JSON.stringify(pkg.version)}`);
  }
  if (!repoUrl(pkg.repository).includes("github.com")) {
    fail("repository must be a github.com URL");
  }
  if (pkg.publishConfig?.access !== "public" || pkg.publishConfig?.provenance !== true) {
    fail('publishConfig must set access:"public" and provenance:true');
  }

  const expected = Object.fromEntries(
    TARGETS.map(([platform, arch]) => [`${NATIVE_PREFIX}${platform}-${arch}`, pkg.version]),
  );
  const actual: Record<string, string> = {};
  for (const [name, version] of Object.entries(pkg.optionalDependencies ?? {})) {
    if (name.startsWith(NATIVE_PREFIX)) actual[name] = version;
  }
  const missing = Object.keys(expected).filter((n) => !(n in actual));
  const extra = Object.keys(actual).filter((n) => !(n in expected));
  const wrong = Object.keys(actual)
    .filter((n) => n in expected && actual[n] !== expected[n])
    .map((n) => `${n}=${actual[n]} (expected ${expected[n]})`);
  if (missing.length > 0 || extra.length > 0 || wrong.length > 0) {
    fail(
      `optionalDependencies mismatch` +
        (missing.length ? `; missing: ${missing.join(", ")}` : "") +
        (extra.length ? `; unexpected: ${extra.join(", ")}` : "") +
        (wrong.length ? `; wrong version: ${wrong.join(", ")}` : ""),
    );
  }

  return failures.concat(checkPackInventory(repoRoot, "root", ROOT_ALLOWLIST, pack));
}

function verifyNativePackage(
  dir: string,
  label: string,
  rootVersion: string,
  pack: PackFn,
): string[] {
  const failures: string[] = [];
  const fail = (message: string) => failures.push(`[${label}] ${message}`);
  const dirName = path.basename(dir);
  const target = TARGETS.find(([platform, arch]) => dirName === `${platform}-${arch}`);
  if (!target) {
    fail(`directory name is not a <platform>-<arch> target: "${dirName}"`);
    return failures;
  }
  const [platform, arch] = target;

  let pkg: NativeManifest;
  try {
    pkg = readJsonManifest(path.join(dir, "package.json")) as NativeManifest;
  } catch (error) {
    fail((error as Error).message);
    return failures;
  }

  const expectedName = `${NATIVE_PREFIX}${dirName}`;
  if (pkg.name !== expectedName) {
    fail(`name should be "${expectedName}", got ${JSON.stringify(pkg.name)}`);
  }
  if (JSON.stringify(pkg.os) !== JSON.stringify([platform])) {
    fail(`os should be exactly [${JSON.stringify(platform)}], got ${JSON.stringify(pkg.os)}`);
  }
  if (JSON.stringify(pkg.cpu) !== JSON.stringify([arch])) {
    fail(`cpu should be exactly [${JSON.stringify(arch)}], got ${JSON.stringify(pkg.cpu)}`);
  }
  if (JSON.stringify(pkg.files) !== JSON.stringify(["bin/", "README.md", "LICENSE.md"])) {
    fail(`files should be exactly ["bin/","README.md","LICENSE.md"], got ${JSON.stringify(pkg.files)}`);
  }
  if (pkg.version !== rootVersion) {
    fail(`version ${JSON.stringify(pkg.version)} does not match root version ${rootVersion}`);
  }

  const suffix = platform === "win32" ? ".exe" : "";
  for (const bin of [`bin/vortex${suffix}`, `bin/rg${suffix}`]) {
    const binPath = path.join(dir, ...bin.split("/"));
    if (!existsSync(binPath) || !statSync(binPath).isFile()) {
      fail(`${bin} not found`);
      continue;
    }
    if (process.platform !== "win32" && (statSync(binPath).mode & 0o777) !== 0o755) {
      fail(`${bin} must have mode 0755`);
    }
  }
  for (const doc of ["README.md", "LICENSE.md"]) {
    if (!existsSync(path.join(dir, doc))) fail(`${doc} not found`);
  }

  const allowlist = [
    "package.json",
    "README.md",
    "LICENSE.md",
    `bin/vortex${suffix}`,
    `bin/rg${suffix}`,
  ];
  return failures.concat(checkPackInventory(dir, label, allowlist, pack));
}

function checkPackInventory(
  dir: string,
  label: string,
  allowlist: readonly string[],
  runPack: PackFn,
): string[] {
  const failures: string[] = [];
  let output: string;
  try {
    output = runPack(dir);
  } catch (error) {
    failures.push(`[${label}] npm pack failed: ${(error as Error).message}`);
    return failures;
  }
  let entries: string[];
  try {
    const parsed = JSON.parse(output) as { files?: { path?: unknown }[] }[];
    entries = (parsed[0]?.files ?? []).map((f) => String(f.path));
  } catch (error) {
    failures.push(`[${label}] could not parse npm pack --json output: ${(error as Error).message}`);
    return failures;
  }
  const unexpected = entries.filter((entry) => !allowlist.includes(entry));
  for (const entry of unexpected) {
    failures.push(`[${label}] unexpected file in publish inventory: ${entry} (not in allowlist)`);
  }
  return failures;
}

function defaultRunPack(dir: string): string {
  // --ignore-scripts prevents this npm pack invocation from re-running our own
  // prepack hook (which calls this verifier), avoiding infinite recursion.
  const result = spawnSync(
    "npm",
    ["pack", "--json", "--dry-run", "--ignore-scripts", "--offline"],
    {
      cwd: dir,
      encoding: "utf8",
      windowsHide: true,
      shell: process.platform === "win32",
      timeout: 120_000,
    },
  );
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.status !== 0) {
    throw new Error((result.stderr || `exit code ${result.status}`).trim());
  }
  return result.stdout;
}

function scanNativeDirs(repoRoot: string): string[] {
  const nativeDir = path.join(repoRoot, "npm", "native");
  if (!existsSync(nativeDir)) return [];
  return readdirSync(nativeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
    .filter((entry) => existsSync(path.join(nativeDir, entry.name, "package.json")))
    .map((entry) => path.join(nativeDir, entry.name));
}

export function verifyNpmPackages(options: VerifyOptions = {}): string[] {
  const repoRoot = options.repoRoot ?? path.resolve(import.meta.dir, "..");
  const pack: PackFn = options.pack ?? defaultRunPack;

  let failures = verifyRoot(repoRoot, pack);
  try {
    const rootPkg = readJsonManifest(path.join(repoRoot, "package.json")) as RootManifest;
    const rootVersion = typeof rootPkg.version === "string" ? rootPkg.version : "";
    if (options.rootOnly) return failures;
    for (const dir of scanNativeDirs(repoRoot)) {
      failures = failures.concat(verifyNativePackage(dir, path.basename(dir), rootVersion, pack));
    }
    for (const staged of options.staged ?? []) {
      const resolved = path.resolve(staged);
      failures = failures.concat(verifyNativePackage(resolved, staged, rootVersion, pack));
    }
  } catch (error) {
    failures.push(`[root] ${(error as Error).message}`);
  }
  return failures;
}

const USAGE =
  "usage: bun scripts/verify-npm-packages.ts [--root-only] [--staged <dir>]...\n" +
  "\n" +
  "Default verifies the root launcher plus every package under npm/native/*.\n" +
  "--root-only checks the root launcher alone (used by the prepack hook so local\n" +
  "packing works before native packages are staged).\n" +
  "--staged <dir> (repeatable) additionally verifies CI staging outputs.";

function parseArgs(argv: readonly string[]): { staged: string[]; rootOnly: boolean } {
  const staged: string[] = [];
  let rootOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--root-only") {
      rootOnly = true;
      continue;
    }
    if (arg !== "--staged") {
      console.error(`error: unknown argument "${arg}"\n${USAGE}`);
      process.exit(1);
    }
    const value = argv[++i];
    if (!value) {
      console.error("error: --staged requires a directory\n" + USAGE);
      process.exit(1);
    }
    staged.push(value);
  }
  return { staged, rootOnly };
}

if (import.meta.main) {
  const { staged, rootOnly } = parseArgs(process.argv.slice(2));
  const failures = verifyNpmPackages({ staged, rootOnly });
  for (const failure of failures) {
    console.error(`error: ${failure}`);
  }
  if (failures.length > 0) {
    console.error(`npm package verification failed with ${failures.length} error(s)`);
    process.exit(1);
  }
}
