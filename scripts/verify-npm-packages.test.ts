import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { TARGETS, verifyNpmPackages } from "./verify-npm-packages";

let base: string;

beforeEach(() => {
  base = mkdtempSync(path.join(tmpdir(), "vortex-verify-test-"));
});

afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

const VERSION = "1.2.3";
const EXE_CONTENT = "fake-vortex-binary";
const RG_CONTENT = "fake-rg-binary";

type NativeOptions = {
  withExe?: boolean;
  withRg?: boolean;
  os?: string[];
  cpu?: string[];
  name?: string;
};

type RootOptions = {
  version?: string;
  nativeVersion?: string;
  withoutOptionalDeps?: boolean;
  wrongPublishConfig?: boolean;
};

type RepoOptions = {
  root?: RootOptions;
  natives?: Partial<Record<string, NativeOptions>>;
  staged?: Partial<Record<string, NativeOptions>>;
};

type Fixture = ReturnType<typeof makeRepo>;

function makeRepo(options: RepoOptions = {}) {
  const {
    version = VERSION,
    nativeVersion = version,
    withoutOptionalDeps = false,
    wrongPublishConfig = false,
  } = options.root ?? {};
  const repo = path.join(base, "repo");

  mkdirSync(path.join(repo, "bin"), { recursive: true });
  mkdirSync(path.join(repo, "dist"), { recursive: true });
  writeFileSync(
    path.join(repo, "package.json"),
    JSON.stringify({
      name: "@sleepyhallow/vortex",
      version,
      bin: { vortex: "bin/vortex.js" },
      repository: { type: "git", url: "git+https://github.com/sleepyhallow/vortex.git" },
      publishConfig: wrongPublishConfig
        ? { access: "restricted" }
        : { access: "public", provenance: true },
      optionalDependencies: withoutOptionalDeps
        ? {}
        : Object.fromEntries(
            TARGETS.map(([platform, arch]) => [
              `@sleepyhallow/vortex-${platform}-${arch}`,
              version,
            ]),
          ),
    }),
  );
  writeFileSync(path.join(repo, "bin", "vortex.js"), "#!/usr/bin/env node");
  writeFileSync(path.join(repo, "bin", "platform-package.js"), "");
  writeFileSync(path.join(repo, "dist", "cli.js"), "// bundle");
  writeFileSync(path.join(repo, "README.md"), "# vortex");
  writeFileSync(path.join(repo, "LICENSE.md"), "fake-license");

  const overridden = new Set(Object.keys(options.natives ?? {}));
  for (const [platform, arch] of TARGETS) {
    const dirName = `${platform}-${arch}`;
    const overrides = options.natives?.[dirName];
    if (!overridden.has(dirName)) {
      makeNative(repo, platform, arch, nativeVersion);
    }
  }
  for (const [dirName, overrides] of Object.entries(options.natives ?? {})) {
    const [platform, arch] = splitTarget(dirName);
    makeNative(repo, platform, arch, nativeVersion, overrides ?? {});
  }

  const stagedDirs: Record<string, string> = {};
  for (const [dirName, overrides] of Object.entries(options.staged ?? {})) {
    const [platform, arch] = splitTarget(dirName);
    const dir = path.join(base, "staging", dirName);
    mkdirSync(path.dirname(dir), { recursive: true });
    makeNative(repo, platform, arch, nativeVersion, overrides ?? {}, dir);
    stagedDirs[dirName] = dir;
  }

  return { repo, stagedDirs };
}

function splitTarget(dirName: string): [string, string] {
  const idx = dirName.lastIndexOf("-");
  return [dirName.slice(0, idx), dirName.slice(idx + 1)];
}

function makeNative(
  repo: string,
  platform: string,
  arch: string,
  version: string,
  overrides: NativeOptions = {},
  outputDir?: string,
): void {
  const dirName = `${platform}-${arch}`;
  const dir = outputDir ?? path.join(repo, "npm", "native", dirName);
  mkdirSync(path.join(dir, "bin"), { recursive: true });
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: overrides.name ?? `@sleepyhallow/vortex-${dirName}`,
      version,
      description: `Native binaries for @sleepyhallow/vortex on ${dirName}.`,
      type: "module",
      os: overrides.os ?? [platform],
      cpu: overrides.cpu ?? [arch],
      files: ["bin/", "README.md", "LICENSE.md"],
      repository: "https://github.com/sleepyhallow/vortex",
      license: "SEE LICENSE IN LICENSE.md",
      publishConfig: { access: "public", provenance: true },
    }),
  );
  const suffix = platform === "win32" ? ".exe" : "";
  if (overrides.withExe !== false) {
    writeFileSync(path.join(dir, "bin", `vortex${suffix}`), EXE_CONTENT);
  }
  if (overrides.withRg !== false) {
    writeFileSync(path.join(dir, "bin", `rg${suffix}`), RG_CONTENT);
  }
  writeFileSync(path.join(dir, "README.md"), "# native packages");
  writeFileSync(path.join(dir, "LICENSE.md"), "fake-license");
}

function fakePack(fixture: Fixture) {
  const pathsByDir = new Map<string, string[]>([
    [
      fixture.repo,
      [
        "package.json",
        "README.md",
        "LICENSE.md",
        "bin/vortex.js",
        "bin/platform-package.js",
        "dist/cli.js",
      ],
    ],
  ]);
  for (const [platform, arch] of TARGETS) {
    const suffix = platform === "win32" ? ".exe" : "";
    pathsByDir.set(path.join(fixture.repo, "npm", "native", `${platform}-${arch}`), [
      "package.json",
      "README.md",
      "LICENSE.md",
      `bin/vortex${suffix}`,
      `bin/rg${suffix}`,
    ]);
  }
  for (const [dirName, dirPath] of Object.entries(fixture.stagedDirs)) {
    const suffix = dirName.startsWith("win32") ? ".exe" : "";
    pathsByDir.set(dirPath, [
      "package.json",
      "README.md",
      "LICENSE.md",
      `bin/vortex${suffix}`,
      `bin/rg${suffix}`,
    ]);
  }
  return (dir: string) =>
    JSON.stringify([{ files: (pathsByDir.get(dir) ?? []).map((p) => ({ path: p })) }]);
}

describe("verify-npm-packages", () => {
  test("passes on a well-formed release tree", () => {
    const fixture = makeRepo({ staged: { "linux-x64": {} } });
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      staged: Object.values(fixture.stagedDirs),
      pack: fakePack(fixture),
    });
    expect(failures).toEqual([]);
  });

  test("fails when vortex executable is missing", () => {
    const fixture = makeRepo({ natives: { "linux-x64": { withExe: false } } });
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    expect(failures.some((f) => f.includes("linux-x64") && /bin\/vortex/.test(f))).toBe(true);
  });

  test("fails when rg binary is missing", () => {
    const fixture = makeRepo({ natives: { "win32-arm64": { withRg: false } } });
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    expect(failures.some((f) => f.includes("win32-arm64") && /bin\/rg/.test(f))).toBe(true);
  });

  test("fails when manifest os/cpu do not match directory target", () => {
    const fixture = makeRepo({
      natives: { "darwin-arm64": { os: ["linux"], cpu: ["x64"] } },
    });
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    expect(failures.some((f) => f.includes("darwin-arm64") && /\bos\b/i.test(f))).toBe(true);
    expect(failures.some((f) => f.includes("darwin-arm64") && /\bcpu\b/i.test(f))).toBe(true);
  });

  test("fails when manifest name does not match directory target", () => {
    const fixture = makeRepo({
      natives: { "linux-x64": { name: "@sleepyhallow/vortex-win32-x64" } },
    });
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    expect(failures.some((f) => f.includes("linux-x64") && /name/i.test(f))).toBe(true);
  });

  test("detects non-executable bins on POSIX and skips check on Windows host", () => {
    const fixture = makeRepo();
    const bin = path.join(fixture.repo, "npm", "native", "linux-x64", "bin");
    chmodSync(path.join(bin, "vortex"), 0o644);
    chmodSync(path.join(bin, "rg"), 0o644);
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    if (process.platform === "win32") {
      expect(failures).toEqual([]);
    } else {
      expect(failures.filter((f) => f.includes("linux-x64")).length).toBeGreaterThanOrEqual(2);
    }
  });

  test("rejects stray entries in pack inventory via fake pack seam", () => {
    const fixture = makeRepo();
    const baseFake = fakePack(fixture);
    const nativeDir = path.join(fixture.repo, "npm", "native", "linux-x64");
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack(dir) {
        const parsed = JSON.parse(baseFake(dir)) as { files: { path: string }[] }[];
        if (dir === nativeDir) {
          parsed[0]!.files.push({ path: "src/secret.env" }, { path: "dist/cli.js.map" });
        }
        return JSON.stringify(parsed);
      },
    });
    expect(failures.some((f) => f.includes("linux-x64") && f.includes("src/secret.env"))).toBe(
      true,
    );
    expect(failures.some((f) => f.includes("dist/cli.js.map"))).toBe(true);
  });

  test("rejects dist artifacts outside the root allowlist", () => {
    const fixture = makeRepo();
    const baseFake = fakePack(fixture);
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack(dir) {
        const parsed = JSON.parse(baseFake(dir)) as { files: { path: string }[] }[];
        if (dir === fixture.repo) {
          parsed[0]!.files.push(
            { path: "dist/cli.js.map" },
            { path: "native/win32-x64/package.json" },
          );
        }
        return JSON.stringify(parsed);
      },
    });
    expect(failures.filter((f) => f.startsWith("[root]")).length).toBeGreaterThanOrEqual(1);
    expect(failures.some((f) => f.includes("native/win32-x64/package.json"))).toBe(true);
  });

  test("fails when root optionalDependencies are missing or versions drift", () => {
    const fixture = makeRepo({ root: { withoutOptionalDeps: true } });
    let failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    expect(
      failures.some((f) => f.startsWith("[root]") && /optionalDependencies/i.test(f)),
    ).toBe(true);

    const drifted = makeRepo({ root: { nativeVersion: "0.0.1" } });
    failures = verifyNpmPackages({
      repoRoot: drifted.repo,
      pack: fakePack(drifted),
    });
    expect(failures.some((f) => f.includes("linux-x64") && /version/i.test(f))).toBe(true);
  });

  test("checks staged directories in addition to npm/native scan", () => {
    const fixture = makeRepo({ staged: { "darwin-x64": { withRg: false } } });
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      staged: Object.values(fixture.stagedDirs),
      pack: fakePack(fixture),
    });
    expect(
      failures.some((f) => f.includes(path.join("staging", "darwin-x64")) && /bin\/rg/.test(f)),
    ).toBe(true);
  });

  test("root launcher checks bin script and provenance metadata", () => {
    const fixture = makeRepo({ root: { wrongPublishConfig: true } });
    rmSync(path.join(fixture.repo, "bin", "vortex.js"));
    const failures = verifyNpmPackages({
      repoRoot: fixture.repo,
      pack: fakePack(fixture),
    });
    expect(failures.some((f) => f.startsWith("[root]") && /bin\/vortex\.js/.test(f))).toBe(true);
    expect(
      failures.some((f) => f.startsWith("[root]") && /publishConfig|provenance|access/i.test(f)),
    ).toBe(true);
  });
});
