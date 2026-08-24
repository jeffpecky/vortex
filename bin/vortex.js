#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getExecutableName, getPlatformPackage } from './platform-package.js'

export function launch({ platform, arch, args, resolvePackage, spawn, writeError }) {
  let packageName
  try {
    packageName = getPlatformPackage(platform, arch)
  } catch (error) {
    writeError(`${error.message}\n`)
    return { status: 1, signal: null }
  }

  let packageJson
  try {
    packageJson = resolvePackage(`${packageName}/package.json`)
  } catch {
    writeError(
      `Missing optional package ${packageName}. Reinstall with: npm install -g @sleepyhallow/vortex\n`,
    )
    return { status: 1, signal: null }
  }

  const executable = join(dirname(packageJson), 'bin', getExecutableName(platform))
  let result
  try {
    result = spawn(executable, args, { stdio: 'inherit', windowsHide: true })
  } catch (error) {
    writeError(`Failed to start ${executable}: ${error.message}\n`)
    return { status: 1, signal: null }
  }
  if (result.error) {
    writeError(`Failed to start ${executable}: ${result.error.message}\n`)
    return { status: 1, signal: null }
  }
  return { status: result.status, signal: result.signal }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const require = createRequire(import.meta.url)
  const result = launch({
    platform: process.platform,
    arch: process.arch,
    args: process.argv.slice(2),
    resolvePackage: require.resolve,
    spawn: spawnSync,
    writeError: (message) => process.stderr.write(message),
  })

  if (result.signal) {
    try {
      process.kill(process.pid, result.signal)
    } catch {
      process.exitCode = 1
    }
  } else {
    process.exitCode = result.status ?? 1
  }
}
