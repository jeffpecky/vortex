import { describe, it, expect } from 'bun:test'

describe('Bundled Skills - Deploy Skills', () => {
  describe('cloudflare-deploy', () => {
    it('should load SKILL.MD content', async () => {
      const { SKILL_MD } = await import('../src/skills/bundled/cloudflareDeployContent.js')
      expect(SKILL_MD).toBeDefined()
      expect(typeof SKILL_MD).toBe('string')
      expect(SKILL_MD.length).toBeGreaterThan(0)
      // Bun converts markdown to HTML, so check for HTML content
      expect(SKILL_MD).toContain('cloudflare-deploy')
    })

    it('should have reference files', async () => {
      const { SKILL_FILES } = await import('../src/skills/bundled/cloudflareDeployContent.js')
      expect(SKILL_FILES).toBeDefined()
      expect(typeof SKILL_FILES).toBe('object')
      expect(Object.keys(SKILL_FILES).length).toBeGreaterThan(0)
      
      // Check some key reference files exist
      expect(SKILL_FILES['references/workers/README.md']).toBeDefined()
      expect(SKILL_FILES['references/pages/README.md']).toBeDefined()
      expect(SKILL_FILES['references/d1/README.md']).toBeDefined()
    })

    it('should register correctly', async () => {
      const { registerCloudflareDeploySkill } = await import('../src/skills/bundled/cloudflareDeploy.js')
      expect(registerCloudflareDeploySkill).toBeDefined()
      expect(typeof registerCloudflareDeploySkill).toBe('function')
    })
  })

  describe('netlify-deploy', () => {
    it('should load SKILL.MD content', async () => {
      const { SKILL_MD } = await import('../src/skills/bundled/netlifyDeployContent.js')
      expect(SKILL_MD).toBeDefined()
      expect(typeof SKILL_MD).toBe('string')
      expect(SKILL_MD.length).toBeGreaterThan(0)
      // Bun converts markdown to HTML, so check for HTML content
      expect(SKILL_MD).toContain('netlify-deploy')
    })

    it('should have reference files', async () => {
      const { SKILL_FILES } = await import('../src/skills/bundled/netlifyDeployContent.js')
      expect(SKILL_FILES).toBeDefined()
      expect(Object.keys(SKILL_FILES).length).toBe(3)
      expect(SKILL_FILES['references/cli-commands.md']).toBeDefined()
      expect(SKILL_FILES['references/deployment-patterns.md']).toBeDefined()
      expect(SKILL_FILES['references/netlify-toml.md']).toBeDefined()
    })

    it('should register correctly', async () => {
      const { registerNetlifyDeploySkill } = await import('../src/skills/bundled/netlifyDeploy.js')
      expect(registerNetlifyDeploySkill).toBeDefined()
      expect(typeof registerNetlifyDeploySkill).toBe('function')
    })
  })

  describe('render-deploy', () => {
    it('should load SKILL.MD content', async () => {
      const { SKILL_MD } = await import('../src/skills/bundled/renderDeployContent.js')
      expect(SKILL_MD).toBeDefined()
      expect(typeof SKILL_MD).toBe('string')
      expect(SKILL_MD.length).toBeGreaterThan(0)
      // Bun converts markdown to HTML, so check for HTML content
      expect(SKILL_MD).toContain('render-deploy')
    })

    it('should have reference and asset files', async () => {
      const { SKILL_FILES } = await import('../src/skills/bundled/renderDeployContent.js')
      expect(SKILL_FILES).toBeDefined()
      expect(Object.keys(SKILL_FILES).length).toBe(16)
      
      // Check reference files
      expect(SKILL_FILES['references/blueprint-spec.md']).toBeDefined()
      expect(SKILL_FILES['references/codebase-analysis.md']).toBeDefined()
      
      // Check asset files (YAML templates)
      expect(SKILL_FILES['assets/docker.yaml']).toBeDefined()
      expect(SKILL_FILES['assets/nextjs-postgres.yaml']).toBeDefined()
    })

    it('should register correctly', async () => {
      const { registerRenderDeploySkill } = await import('../src/skills/bundled/renderDeploy.js')
      expect(registerRenderDeploySkill).toBeDefined()
      expect(typeof registerRenderDeploySkill).toBe('function')
    })
  })

  describe('vercel-deploy', () => {
    it('should load SKILL.MD content', async () => {
      const { SKILL_MD } = await import('../src/skills/bundled/vercelDeployContent.js')
      expect(SKILL_MD).toBeDefined()
      expect(typeof SKILL_MD).toBe('string')
      expect(SKILL_MD.length).toBeGreaterThan(0)
      // Bun converts markdown to HTML, so check for HTML content
      expect(SKILL_MD).toContain('vercel-deploy')
    })

    it('should have script files', async () => {
      const { SKILL_FILES } = await import('../src/skills/bundled/vercelDeployContent.js')
      expect(SKILL_FILES).toBeDefined()
      expect(Object.keys(SKILL_FILES).length).toBe(1)
      expect(SKILL_FILES['scripts/deploy.sh']).toBeDefined()
      expect(SKILL_FILES['scripts/deploy.sh']).toContain('#!/bin/bash')
    })

    it('should register correctly', async () => {
      const { registerVercelDeploySkill } = await import('../src/skills/bundled/vercelDeploy.js')
      expect(registerVercelDeploySkill).toBeDefined()
      expect(typeof registerVercelDeploySkill).toBe('function')
    })
  })
})

describe('Bundled Skills - Security Skills', () => {
  describe('security-threat-model', () => {
    it('should load SKILL.MD content', async () => {
      const { SKILL_MD } = await import('../src/skills/bundled/securityThreatModelContent.js')
      expect(SKILL_MD).toBeDefined()
      expect(typeof SKILL_MD).toBe('string')
      expect(SKILL_MD.length).toBeGreaterThan(0)
      expect(SKILL_MD).toContain('threat')
    })

    it('should have reference files', async () => {
      const { SKILL_FILES } = await import('../src/skills/bundled/securityThreatModelContent.js')
      expect(SKILL_FILES).toBeDefined()
      expect(Object.keys(SKILL_FILES).length).toBe(2)
      expect(SKILL_FILES['references/prompt-template.md']).toBeDefined()
      expect(SKILL_FILES['references/security-controls-and-assets.md']).toBeDefined()
    })

    it('should register correctly', async () => {
      const { registerSecurityThreatModelSkill } = await import('../src/skills/bundled/securityThreatModel.js')
      expect(registerSecurityThreatModelSkill).toBeDefined()
      expect(typeof registerSecurityThreatModelSkill).toBe('function')
    })
  })

  describe('security-best-practices', () => {
    it('should load SKILL.MD content', async () => {
      const { SKILL_MD } = await import('../src/skills/bundled/securityBestPracticesContent.js')
      expect(SKILL_MD).toBeDefined()
      expect(typeof SKILL_MD).toBe('string')
      expect(SKILL_MD.length).toBeGreaterThan(0)
      expect(SKILL_MD).toContain('security')
    })

    it('should have reference files for multiple languages', async () => {
      const { SKILL_FILES } = await import('../src/skills/bundled/securityBestPracticesContent.js')
      expect(SKILL_FILES).toBeDefined()
      expect(Object.keys(SKILL_FILES).length).toBe(10)
      
      // Check language-specific reference files
      expect(SKILL_FILES['references/python-django-web-server-security.md']).toBeDefined()
      expect(SKILL_FILES['references/javascript-express-web-server-security.md']).toBeDefined()
      expect(SKILL_FILES['references/golang-general-backend-security.md']).toBeDefined()
      expect(SKILL_FILES['references/javascript-typescript-nextjs-web-server-security.md']).toBeDefined()
    })

    it('should register correctly', async () => {
      const { registerSecurityBestPracticesSkill } = await import('../src/skills/bundled/securityBestPractices.js')
      expect(registerSecurityBestPracticesSkill).toBeDefined()
      expect(typeof registerSecurityBestPracticesSkill).toBe('function')
    })
  })
})

describe('Bundled Skills - Frontmatter Parsing', () => {
  it('should parse cloudflare-deploy frontmatter correctly', async () => {
    // Read raw markdown from disk (Bun text loader converts .md to HTML)
    const rawMd = await Bun.file(
      require.resolve('../src/skills/bundled/cloudflare-deploy/SKILL.md'),
    ).text()
    const { parseFrontmatter } = await import('../src/utils/frontmatterParser.js')
    
    const { frontmatter, content } = parseFrontmatter(rawMd)
    
    expect(frontmatter).toBeDefined()
    expect(frontmatter.name).toBe('cloudflare-deploy')
    expect(frontmatter.description).toBeDefined()
    expect(typeof frontmatter.description).toBe('string')
    expect(content).toBeDefined()
    expect(content.length).toBeGreaterThan(0)
  })

  it('should parse security-threat-model frontmatter correctly', async () => {
    const rawMd = await Bun.file(
      require.resolve('../src/skills/bundled/security-threat-model/SKILL.md'),
    ).text()
    const { parseFrontmatter } = await import('../src/utils/frontmatterParser.js')
    
    const { frontmatter, content } = parseFrontmatter(rawMd)
    
    expect(frontmatter).toBeDefined()
    expect(frontmatter.name).toBe('security-threat-model')
    expect(frontmatter.description).toBeDefined()
    expect(typeof frontmatter.description).toBe('string')
    expect(content).toBeDefined()
  })
})
