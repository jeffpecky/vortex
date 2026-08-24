#!/usr/bin/env bun
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const PLATFORMS = new Set(["win32", "linux", "darwin"]);
const ARCHES = new Set(["x64", "arm64"]);

type PrepareOptions = {
  platform: string;
  arch: string;
  executable: string;
  output: string;
  repoRoot?: string;
};

function fail(message: string): never {
  throw new Error(message);
}

function requireFile(filePath: string, label: string): void {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    fail(`${label} not found: ${filePath}`);
  }
}

function readJsonVersion(filePath: string, label: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON (${(error as Error).message})`);
  }
  const version = (parsed as { version?: unknown })?.version;
  if (typeof version !== "string" || version.length === 0) {
    fail(`${label} has no version`);
  }
  return version;
}

export function prepareNativePackage(options: PrepareOptions): void {
  const { platform, arch } = options;
  if (!PLATFORMS.has(platform)) {
    fail(`invalid --platform "${platform}" (expected win32|linux|darwin)`);
  }
  if (!ARCHES.has(arch)) {
    fail(`invalid --arch "${arch}" (expected x64|arm64)`);
  }

  const repoRoot = options.repoRoot ?? path.resolve(import.meta.dir, "..");
  const suffix = platform === "win32" ? ".exe" : "";

  // Validate every input before touching the filesystem output.
  const rootPackageJson = path.join(repoRoot, "package.json");
  requireFile(rootPackageJson, "root package.json");
  const rootVersion = readJsonVersion(rootPackageJson, "root package.json");

  const manifest = path.join(repoRoot, "npm", "native", `${platform}-${arch}`, "package.json");
  requireFile(manifest, `manifest for ${platform}-${arch}`);
  const manifestVersion = readJsonVersion(manifest, manifest);
  if (manifestVersion !== rootVersion) {
    fail(
      `${platform}-${arch} manifest version ${manifestVersion} does not match root package.json version ${rootVersion}`,
    );
  }

  requireFile(options.executable, "vortex executable");

  const rgSource = path.join(repoRoot, "vendor", "ripgrep", `${arch}-${platform}`, `rg${suffix}`);
  requireFile(rgSource, "ripgrep binary");

  const licenseSource = path.join(repoRoot, "LICENSE.md");
  requireFile(licenseSource, "LICENSE.md");
  const readmeSource = path.join(repoRoot, "npm", "native", "README.md");
  requireFile(readmeSource, "npm/native/README.md");

  const output = path.resolve(options.output);
  if (existsSync(output)) {
    if (!statSync(output).isDirectory()) {
      fail(`--output already exists and is not a directory: ${output}`);
    }
    if (readdirSync(output).length > 0) {
      fail(`--output already exists and is not empty: ${output}`);
    }
    rmSync(output, { recursive: true });
  }

  const parent = path.dirname(output);
  mkdirSync(parent, { recursive: true });

  // Stage into a sibling temp dir so the final rename is atomic.
  const staging = mkdtempSync(path.join(parent, `${path.basename(output)}.tmp-`));
  try {
    mkdirSync(path.join(staging, "bin"), { recursive: true });
    copyFileSync(options.executable, path.join(staging, "bin", `vortex${suffix}`));
    copyFileSync(rgSource, path.join(staging, "bin", `rg${suffix}`));
    copyFileSync(licenseSource, path.join(staging, "LICENSE.md"));
    copyFileSync(readmeSource, path.join(staging, "README.md"));
    if (platform !== "win32") {
      chmodSync(path.join(staging, "bin", `vortex${suffix}`), 0o755);
      chmodSync(path.join(staging, "bin", `rg${suffix}`), 0o755);
    }
    renameSync(staging, output);
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function parseArgs(argv: readonly string[]): Required<Omit<PrepareOptions, "repoRoot">> {
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === undefined || !key.startsWith("--") || value === undefined) {
      fail(`usage: bun scripts/prepare-native-package.ts --platform <p> --arch <a> --executable <path> --output <dir>`);
    }
    values.set(key.slice(2), value);
  }
  for (const required of ["platform", "arch", "executable", "output"] as const) {
    if (!values.has(required)) {
      fail(`missing --${required}`);
    }
  }
  return {
    platform: values.get("platform")!,
    arch: values.get("arch")!,
    executable: values.get("executable")!,
    output: values.get("output")!,
  };
}

if (import.meta.main) {
  try {
    prepareNativePackage(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`error: ${(error as Error).message}`);
    process.exit(1);
  }
}
