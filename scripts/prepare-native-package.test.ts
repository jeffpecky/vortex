import { afterEach, beforeEach, expect, test } from "bun:test";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { prepareNativePackage } from "./prepare-native-package";

let base: string;

beforeEach(() => {
  base = mkdtempSync(path.join(tmpdir(), "vortex-native-test-"));
});

afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

const EXE_CONTENT = "fake-vortex-binary";
const RG_CONTENT = "fake-rg-binary";
const LICENSE_CONTENT = "fake-license";
const README_CONTENT = "# native packages";

type RepoOptions = {
  rootVersion?: string;
  manifestVersion?: string;
  withRg?: boolean;
};

function makeRepo(platform: string, arch: string, options: RepoOptions = {}) {
  const { rootVersion = "0.1.0", manifestVersion = rootVersion, withRg = true } =
    options;
  const repoRoot = path.join(base, "repo");
  const nativeDir = path.join(repoRoot, "npm", "native", `${platform}-${arch}`);
  mkdirSync(nativeDir, { recursive: true });
  writeFileSync(
    path.join(repoRoot, "package.json"),
    JSON.stringify({ name: "@sleepyhallow/vortex", version: rootVersion }),
  );
  writeFileSync(
    path.join(nativeDir, "package.json"),
    JSON.stringify({
      name: `@sleepyhallow/vortex-${platform}-${arch}`,
      version: manifestVersion,
    }),
  );
  writeFileSync(path.join(repoRoot, "LICENSE.md"), LICENSE_CONTENT);
  writeFileSync(path.join(repoRoot, "npm", "native", "README.md"), README_CONTENT);
  const suffix = platform === "win32" ? ".exe" : "";
  const rgDir = path.join(repoRoot, "vendor", "ripgrep", `${arch}-${platform}`);
  mkdirSync(rgDir, { recursive: true });
  if (withRg) {
    writeFileSync(path.join(rgDir, `rg${suffix}`), RG_CONTENT);
  }
  const executable = path.join(base, `vortex${suffix}`);
  writeFileSync(executable, EXE_CONTENT);
  return { repoRoot, executable };
}

function assertNoTempResidue(output: string) {
  const parent = path.dirname(output);
  const residue = readdirSync(parent).filter((entry) => entry.includes(".tmp-"));
  expect(residue).toEqual([]);
}

test("stages win32 package layout", () => {
  const { repoRoot, executable } = makeRepo("win32", "x64");
  const output = path.join(base, "out");
  prepareNativePackage({
    platform: "win32",
    arch: "x64",
    executable,
    output,
    repoRoot,
  });
  expect(statSync(path.join(output, "bin", "vortex.exe")).isFile()).toBe(true);
  expect(readFileSync(path.join(output, "bin", "vortex.exe"), "utf8")).toBe(EXE_CONTENT);
  expect(readFileSync(path.join(output, "bin", "rg.exe"), "utf8")).toBe(RG_CONTENT);
  expect(readFileSync(path.join(output, "LICENSE.md"), "utf8")).toBe(LICENSE_CONTENT);
  expect(readFileSync(path.join(output, "README.md"), "utf8")).toBe(README_CONTENT);
});

test("stages unix package layout with executable modes", () => {
  const { repoRoot, executable } = makeRepo("darwin", "arm64");
  const output = path.join(base, "out");
  prepareNativePackage({
    platform: "darwin",
    arch: "arm64",
    executable,
    output,
    repoRoot,
  });
  const vortexBin = path.join(output, "bin", "vortex");
  const rgBin = path.join(output, "bin", "rg");
  expect(statSync(vortexBin).isFile()).toBe(true);
  expect(readFileSync(rgBin, "utf8")).toBe(RG_CONTENT);
  if (process.platform !== "win32") {
    expect(statSync(vortexBin).mode & 0o777).toBe(0o755);
    expect(statSync(rgBin).mode & 0o777).toBe(0o755);
  }
});

test("replaces an existing empty output directory", () => {
  const { repoRoot, executable } = makeRepo("linux", "x64");
  const output = path.join(base, "out");
  mkdirSync(output);
  prepareNativePackage({
    platform: "linux",
    arch: "x64",
    executable,
    output,
    repoRoot,
  });
  expect(statSync(path.join(output, "bin", "vortex")).isFile()).toBe(true);
});

test("fails on version mismatch between manifest and root package.json", () => {
  const { repoRoot, executable } = makeRepo("linux", "x64", {
    manifestVersion: "9.9.9",
  });
  expect(() =>
    prepareNativePackage({
      platform: "linux",
      arch: "x64",
      executable,
      output: path.join(base, "out"),
      repoRoot,
    }),
  ).toThrow(/version/i);
});

test("fails when ripgrep binary is missing", () => {
  const { repoRoot, executable } = makeRepo("linux", "x64", { withRg: false });
  expect(() =>
    prepareNativePackage({
      platform: "linux",
      arch: "x64",
      executable,
      output: path.join(base, "out"),
      repoRoot,
    }),
  ).toThrow(/ripgrep/i);
});

test("fails when output already exists non-empty", () => {
  const { repoRoot, executable } = makeRepo("linux", "x64");
  const output = path.join(base, "out");
  mkdirSync(output);
  writeFileSync(path.join(output, "stale.txt"), "old");
  expect(() =>
    prepareNativePackage({
      platform: "linux",
      arch: "x64",
      executable,
      output,
      repoRoot,
    }),
  ).toThrow(/output/i);
});

test("leaves no partial output when a copy fails mid-staging", () => {
  const { repoRoot, executable } = makeRepo("linux", "x64");
  const output = path.join(base, "out");
  expect(() =>
    prepareNativePackage({
      platform: "linux",
      arch: "x64",
      executable,
      output,
      repoRoot,
      copyFile(from, to) {
        if (path.basename(to).startsWith("rg")) {
          throw new Error("injected copy failure");
        }
        copyFileSync(from, to);
      },
    }),
  ).toThrow(/injected copy failure/);
  expect(existsSync(output)).toBe(false);
  assertNoTempResidue(output);
});

test("leaves no partial output when a source vanishes during staging", () => {
  const { repoRoot, executable } = makeRepo("linux", "x64", { withRg: true });
  const output = path.join(base, "out");
  const rgSource = path.join(repoRoot, "vendor", "ripgrep", "x64-linux", "rg");
  expect(() =>
    prepareNativePackage({
      platform: "linux",
      arch: "x64",
      executable,
      output,
      repoRoot,
      copyFile(from, to) {
        if (path.basename(to) === "vortex") {
          rmSync(rgSource);
        }
        copyFileSync(from, to);
      },
    }),
  ).toThrow(/ripgrep/);
  expect(existsSync(output)).toBe(false);
  assertNoTempResidue(output);
});
