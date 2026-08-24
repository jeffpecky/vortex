import { expect, test } from "bun:test";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { getPlatformPackage } from "../bin/platform-package.js";

const REPO_ROOT = path.resolve(import.meta.dir, "..");
const MARKER = "smoke-ok 9.9.9";

let hostTarget: string;
try {
  hostTarget = getPlatformPackage(process.platform, process.arch).replace(
    "@sleepyhallow/vortex-",
    "",
  );
} catch {
  hostTarget = "";
}

function npm(args: readonly string[], opts: { cwd?: string } = {}) {
  const shell = process.platform === "win32";
  const result = spawnSync(shell ? "npm.cmd" : "npm", args, {
    encoding: "utf8",
    shell,
    windowsHide: true,
    cwd: opts.cwd,
  });
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

type Fixture = { launcherTarball: string; nativeTarball: string; base: string };

function packFixtures(): Fixture {
  const base = mkdtempSync(path.join(tmpdir(), "vortex-smoke-fixture-"));
  const rootPackage = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const version = rootPackage.version as string;

  npm(["pack", "--ignore-scripts", "--offline", "--pack-destination", base], {
    cwd: REPO_ROOT,
  });
  const launcherTarball = path.join(base, `sleepyhallow-vortex-${version}.tgz`);

  const nativeDir = path.join(base, "fixture-native");
  const binDir = path.join(nativeDir, "bin");
  mkdirSync(binDir, { recursive: true });
  writeFileSync(
    path.join(nativeDir, "package.json"),
    JSON.stringify(
      {
        name: `@sleepyhallow/vortex-${hostTarget}`,
        version,
        os: [process.platform],
        cpu: [process.arch],
        files: ["bin/"],
      },
      null,
      2,
    ),
  );
  if (process.platform === "win32") {
    copyFileSync(process.execPath, path.join(binDir, "vortex.exe"));
  } else {
    const exe = path.join(binDir, "vortex");
    writeFileSync(exe, `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(MARKER)});\n`);
    chmodSync(exe, 0o755);
  }
  npm(["pack", "--ignore-scripts", "--offline", "--pack-destination", base], {
    cwd: nativeDir,
  });
  const nativeTarball = path.join(
    base,
    `sleepyhallow-vortex-${hostTarget}-${version}.tgz`,
  );
  return { launcherTarball, nativeTarball, base };
}

test("harness installs packed tarballs and runs the vortex shim end to end", async () => {
  if (!hostTarget) return;
  const { runSmokeTest } = await import("./smoke-npm-install");
  const fixture = packFixtures();
  try {
    const expectedPattern =
      process.platform === "win32" ? undefined : MARKER.replace(/[. ]/g, (m) => `\\${m}`);
    const result = runSmokeTest({
      launcherTarball: fixture.launcherTarball,
      nativeTarball: fixture.nativeTarball,
      expectedPattern,
    });
    expect(result.versionOutput).toMatch(
      process.platform === "win32" ? /\d+\.\d+\.\d+/ : MARKER,
    );
    expect(result.shimRemoved).toBe(true);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
}, 600_000);

test("harness rejects missing tarballs without touching npm", async () => {
  const { runSmokeTest } = await import("./smoke-npm-install");
  expect(() =>
    runSmokeTest({
      launcherTarball: "does-not-exist.tgz",
      nativeTarball: "also-missing.tgz",
    }),
  ).toThrow(/does-not-exist\.tgz/);
});
