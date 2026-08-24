#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

export const LAUNCHER_NAME = "@sleepyhallow/vortex";

const USAGE = "usage: bun scripts/smoke-npm-install.ts <launcher.tgz> <native.tgz>";

const NPM_QUIET_CONFIG: Record<string, string> = {
  npm_config_update_notifier: "false",
  npm_config_fund: "false",
  npm_config_audit: "false",
  npm_config_loglevel: "error",
  npm_config_ignore_scripts: "true",
  npm_config_prefer_offline: "true",
};

type RunResult = { status: number | null; output: string };

type ExecOptions = { cwd?: string; allowFailure?: boolean };

function quoteWin(arg: string): string {
  return /\s"/.test(arg) ? `"${arg.replaceAll('"', '""')}"` : arg;
}

function npmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function exec(command: string, args: readonly string[], env: NodeJS.ProcessEnv, options: ExecOptions = {}): RunResult {
  const shell = process.platform === "win32";
  const result = spawnSync(command, shell ? args.map(quoteWin) : [...args], {
    env,
    shell,
    windowsHide: true,
    encoding: "utf8",
    cwd: options.cwd,
  });
  if (result.error) {
    throw new Error(`failed to run ${command}: ${result.error.message}`);
  }
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${command} ${args.join(" ")} exited ${result.status}\n${output}`);
  }
  return { status: result.status ?? 1, output };
}

export function isolatedEnv(base: string): NodeJS.ProcessEnv {
  const home = path.join(base, "home");
  mkdirSync(home, { recursive: true });
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    XDG_CONFIG_HOME: path.join(base, "config"),
    ...NPM_QUIET_CONFIG,
  };
}

export function shimCandidates(prefix: string): string[] {
  if (process.platform === "win32") {
    return ["vortex.cmd", "vortex.ps1", "vortex"].map((name) => path.join(prefix, name));
  }
  return [path.join(prefix, "bin", "vortex")];
}

export type SmokeOptions = {
  launcherTarball: string;
  nativeTarball: string;
  /** Regex source the `vortex --version` output must match. Defaults to a semver. */
  expectedPattern?: string;
  /** Directory in which the isolated prefix/home are created. Defaults to os.tmpdir(). */
  workDir?: string;
};

export type SmokeResult = {
  versionOutput: string;
  shimRemoved: boolean;
};

export function runSmokeTest(options: SmokeOptions): SmokeResult {
  for (const tarball of [options.launcherTarball, options.nativeTarball]) {
    if (!existsSync(tarball)) {
      throw new Error(`tarball not found: ${tarball}`);
    }
  }
  const base = mkdtempSync(path.join(options.workDir ?? os.tmpdir(), "vortex-smoke-"));
  try {
    const env = isolatedEnv(base);
    const prefix = path.join(base, "prefix");
    exec(
      npmCommand(),
      ["install", "-g", options.launcherTarball, options.nativeTarball, "--prefix", prefix],
      env,
    );
    const candidates = shimCandidates(prefix);
    const shim = candidates[0]!;
    if (!existsSync(shim)) {
      throw new Error(`vortex shim missing after install: ${shim}`);
    }
    const pattern = new RegExp(options.expectedPattern ?? "\\d+\\.\\d+\\.\\d+");
    const version = exec(shim, ["--version"], env);
    if (!pattern.test(version.output)) {
      throw new Error(
        `vortex --version output ${JSON.stringify(version.output)} does not match /${pattern.source}/`,
      );
    }
    exec(npmCommand(), ["uninstall", "-g", LAUNCHER_NAME, "--prefix", prefix], env);
    const remaining = candidates.filter((candidate) => existsSync(candidate));
    if (remaining.length > 0) {
      throw new Error(`shims still present after uninstall: ${remaining.join(", ")}`);
    }
    return { versionOutput: version.output, shimRemoved: true };
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  const [launcherTarball, nativeTarball] = process.argv.slice(2);
  if (!launcherTarball || !nativeTarball) {
    console.error(USAGE);
    process.exit(1);
  }
  try {
    console.log(`smoke: installing ${launcherTarball} + ${nativeTarball}`);
    const result = runSmokeTest({ launcherTarball, nativeTarball });
    console.log(`smoke: vortex --version -> ${JSON.stringify(result.versionOutput)}`);
    console.log("smoke: install, launch, and uninstall OK");
  } catch (error) {
    console.error(`smoke failed: ${(error as Error).message}`);
    process.exit(1);
  }
}
