import { describe, expect, it } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const WORKFLOW_PATH = resolve(process.cwd(), '.github', 'workflows', 'release-npm.yml')

const TARGET_RUNNERS = [
  { runner: 'windows-latest', platform: 'win32', arch: 'x64', suffix: '.exe' },
  { runner: 'windows-11-arm', platform: 'win32', arch: 'arm64', suffix: '.exe' },
  { runner: 'ubuntu-latest', platform: 'linux', arch: 'x64', suffix: "''" },
  { runner: 'ubuntu-24.04-arm', platform: 'linux', arch: 'arm64', suffix: "''" },
  { runner: 'macos-15-intel', platform: 'darwin', arch: 'x64', suffix: "''" },
  { runner: 'macos-15', platform: 'darwin', arch: 'arm64', suffix: "''" },
] as const

const NATIVE_TARGETS = TARGET_RUNNERS.map((t) => `${t.platform}-${t.arch}`)

function childBlock(text: string, header: string): string[] {
  const lines = text.split('\n')
  const start = lines.indexOf(header)
  if (start === -1) return []
  const indent = header.search(/\S/)
  const body: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim() !== '' && line.search(/\S/) <= indent) break
    body.push(line)
  }
  return body.join('\n').split('\n')
}

function stepBlock(yamlText: string, stepName: string): string {
  const lines = yamlText.split('\n')
  const start = lines.findIndex((line) => line.trim() === `- name: ${stepName}`)
  if (start === -1) return ''
  const out: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s{6}- name:/.test(lines[i]!)) break
    out.push(lines[i]!)
  }
  return out.join('\n')
}

const yaml = existsSync(WORKFLOW_PATH) ? readFileSync(WORKFLOW_PATH, 'utf8') : ''

describe('release-npm workflow structure', () => {
  it('exists', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true)
    expect(yaml.length).toBeGreaterThan(0)
  })

  it('triggers on v* tags and workflow_dispatch', () => {
    const on = childBlock(yaml, 'on:').join('\n')
    expect(on).toContain('push:')
    expect(on).toContain('tags:')
    expect(on).toContain("- 'v*'")
    expect(on).toContain('workflow_dispatch:')
  })

  it('grants least-privilege top-level permissions', () => {
    const perms = childBlock(yaml, 'permissions:').join('\n')
    expect(perms).toContain('contents: read')
    expect(perms).not.toContain('contents: write')
    expect(perms).not.toContain('id-token')
  })

  it('builds exactly six targets on matching runners', () => {
    const entries = yaml.split(/\n(?=\s*- os:)/).slice(1)
    expect(entries).toHaveLength(TARGET_RUNNERS.length)

    for (const target of TARGET_RUNNERS) {
      const entry =
        entries.find((chunk) => chunk.includes(`os: ${target.runner}\n`)) ?? ''
      expect(entry, `matrix entry for ${target.runner}`).toContain(
        `os: ${target.runner}`,
      )
      expect(entry).toContain(`platform: ${target.platform}`)
      expect(entry).toContain(`arch: ${target.arch}`)
      expect(entry).toContain(`suffix: ${target.suffix}`)
    }

    expect(NATIVE_TARGETS).toEqual([
      'win32-x64',
      'win32-arm64',
      'linux-x64',
      'linux-arm64',
      'darwin-x64',
      'darwin-arm64',
    ])
    expect(yaml).toContain('runs-on: ${{ matrix.os }}')
  })

  it('pins every third-party action to a full commit SHA', () => {
    const uses = yaml
      .split('\n')
      .filter((line) => line.trim().startsWith('uses:'))
    expect(uses.length).toBeGreaterThanOrEqual(6)
    for (const line of uses) {
      expect(line.trim()).toMatch(/^uses: \S+@[0-9a-f]{40}(\s+#.*)?$/)
    }
  })
})

describe('release-npm native job', () => {
  it('installs pinned Bun and nested sandbox-runtime deps', () => {
    expect(yaml).toContain('oven-sh/setup-bun@')
    expect(yaml).toContain('bun-version: 1.3.14')
    expect(yaml).toContain('bun install --frozen-lockfile')
    expect(yaml).toContain(
      'working-directory: src/vendor/@anthropic-ai/sandbox-runtime',
    )
    expect(yaml).toContain('bun install --ignore-scripts')
  })

  it('builds JS bundle and compiles the standalone binary', () => {
    expect(yaml).toContain('bun run build')
    expect(yaml).toContain('bun run build:compile')
  })

  it('runs focused tests', () => {
    expect(yaml).toContain('bun test __tests__ scripts')
  })

  it('smoke-tests the compiled binary and sibling ripgrep', () => {
    expect(yaml).toContain('test -f "dist/vortex${{ matrix.suffix }}"')
    expect(yaml).toContain('"dist/rg${{ matrix.suffix }}" --version')
  })

  it('packages the correct native target into .npm-staged', () => {
    expect(yaml).toContain(
      'package:native -- --platform ${{ matrix.platform }} --arch ${{ matrix.arch }}',
    )
    expect(yaml).toContain('--executable "dist/vortex${{ matrix.suffix }}"')
    expect(yaml).toContain('--output ".npm-staged/${{ env.TARGET }}"')
  })

  it('verifies the staged package', () => {
    expect(yaml).toContain('verify-npm-packages.ts --staged ".npm-staged/')
  })

  it('packs the staged dir and records SHA256SUMS', () => {
    expect(yaml).toMatch(/working-directory: \.npm-staged\//)
    expect(yaml).toContain('npm pack --json --ignore-scripts --offline > pack.json')
    expect(yaml).toContain('sha256sum')
    expect(yaml).toContain('> SHA256SUMS')
  })

  it('uploads the staged package as an artifact', () => {
    expect(yaml).toContain('actions/upload-artifact@')
    expect(yaml).toContain('name: npm-${{ env.TARGET }}')
    expect(yaml).toContain('if-no-files-found: error')
  })

  it('smoke-tests packed installation after uploading the artifact', () => {
    const upload = yaml.indexOf('Upload staged package')
    const smoke = yaml.indexOf('Smoke test packed installation')
    const publishJobStart = yaml.indexOf('  publish:')
    expect(upload).toBeGreaterThanOrEqual(0)
    expect(smoke).toBeGreaterThan(upload)
    expect(smoke).toBeLessThan(publishJobStart)
    expect(yaml).toContain('npm pack --ignore-scripts --offline --pack-destination .smoke')
    expect(yaml).toContain(
      '".npm-staged/${{ env.TARGET }}/sleepyhallow-vortex-${{ env.TARGET }}-$VERSION.tgz"',
    )
  })
})

describe('release-npm publish job', () => {
  const publishJob = childBlock(yaml, '  publish:').join('\n')

  it('runs after all six native builds', () => {
    expect(publishJob).toContain('needs:')
    expect(publishJob).toContain('- native')
  })

  it('grants OIDC and release permissions', () => {
    const perms = childBlock(yaml, '    permissions:').join('\n')
    expect(perms).toContain('id-token: write')
    expect(perms).toContain('contents: write')
  })

  it('derives the version from the tag and matches package.json', () => {
    const versionStep = stepBlock(yaml, 'Check package versions against tag')
    expect(versionStep).toContain('GITHUB_REF_NAME#v')
    expect(versionStep).toContain("require('./package.json').version")
    expect(versionStep).toContain('::error::')
  })

  it('warns non-fatally about already published packages', () => {
    const listStep = stepBlock(yaml, 'List already published packages')
    expect(listStep).toContain('npm view')
    expect(listStep).toContain('::warning::')
    expect(listStep).not.toMatch(/exit 1/)
  })

  it('skips already published natives per package', () => {
    const publishStep = stepBlock(yaml, 'Publish native packages')
    expect(publishStep).toContain('npm view')
    expect(publishStep).toContain('already published; skipping')
    expect(publishStep).toContain('continue')
    expect(publishStep).toContain('--access public --provenance')
  })

  it('skips already published launcher', () => {
    const publishStep = stepBlock(yaml, 'Publish launcher package')
    expect(publishStep).toContain('npm view')
    expect(publishStep).toContain('already published; skipping')
    expect(publishStep).toContain('else')
    expect(publishStep).toContain('--access public --provenance')
  })

  it('downloads all staged artifacts', () => {
    expect(publishJob).toContain('actions/download-artifact@')
    expect(publishJob).toContain('pattern: npm-*')
  })

  it('publishes six natives first, verifies root-only, then launcher last', () => {
    const versionGuard = yaml.indexOf('Check package versions against tag')
    const nativePublish = yaml.indexOf('for target in $TARGETS')
    const rootOnlyVerify = yaml.indexOf('--root-only')
    const rootPack = yaml.indexOf('npm pack --json --ignore-scripts --offline > pack.json', rootOnlyVerify)
    const rootPublish = yaml.indexOf(
      'npm publish "./sleepyhallow-vortex-$VERSION.tgz"',
    )
    expect(versionGuard).toBeGreaterThanOrEqual(0)
    expect(nativePublish).toBeGreaterThanOrEqual(0)
    expect(versionGuard).toBeLessThan(nativePublish)
    expect(rootOnlyVerify).toBeGreaterThan(nativePublish)
    expect(rootPack).toBeGreaterThan(rootOnlyVerify)
    expect(rootPublish).toBeGreaterThan(rootPack)
  })

  it('publishes with public access and provenance', () => {
    const flags = yaml.match(/--access public --provenance/g) ?? []
    expect(flags.length).toBeGreaterThanOrEqual(2)
  })

  it('creates a GitHub release with tarballs and SHA256SUMS', () => {
    const releaseIdx = yaml.indexOf('softprops/action-gh-release@')
    expect(releaseIdx).toBeGreaterThanOrEqual(0)
    const releaseStep = yaml.slice(releaseIdx)
    expect(releaseStep).toContain('SHA256SUMS')
    expect(releaseStep).toMatch(/\.tgz/)
    expect(releaseStep).toContain('GITHUB_TOKEN')
  })
})
