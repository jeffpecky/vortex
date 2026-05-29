import { describe, expect, it } from 'bun:test'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

describe('gitignore configuration', () => {
  it('should have .gitignore file', () => {
    const gitignorePath = resolve(process.cwd(), '.gitignore')
    expect(existsSync(gitignorePath)).toBe(true)
  })

  it('should ignore node_modules', () => {
    const gitignorePath = resolve(process.cwd(), '.gitignore')
    const content = readFileSync(gitignorePath, 'utf8')
    
    expect(content).toContain('node_modules/')
  })

  it('should ignore dist directory', () => {
    const gitignorePath = resolve(process.cwd(), '.gitignore')
    const content = readFileSync(gitignorePath, 'utf8')
    
    expect(content).toContain('dist/')
  })

  it('should ignore build artifacts', () => {
    const gitignorePath = resolve(process.cwd(), '.gitignore')
    const content = readFileSync(gitignorePath, 'utf8')
    
    expect(content).toContain('*.js.map')
    expect(content).toContain('cli.js.map')
  })

  it('should ignore vendor directory', () => {
    const gitignorePath = resolve(process.cwd(), '.gitignore')
    const content = readFileSync(gitignorePath, 'utf8')
    
    expect(content).toContain('vendor/')
  })

  it('should ignore OS-specific files', () => {
    const gitignorePath = resolve(process.cwd(), '.gitignore')
    const content = readFileSync(gitignorePath, 'utf8')
    
    expect(content).toContain('.DS_Store')
  })
})
