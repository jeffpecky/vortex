import { feature } from 'bun:bundle'
import { shouldAutoEnableClaudeInChrome } from 'src/utils/claudeInChrome/setup.js'
import { registerAlgorithmicArtSkill } from './algorithmicArt.js'
import { registerBatchSkill } from './batch.js'
import { registerBrandGuidelinesSkill } from './brandGuidelines.js'
import { registerCanvasDesignSkill } from './canvasDesign.js'
import { registerClaudeInChromeSkill } from './claudeInChrome.js'
import { registerCloudflareDeploySkill } from './cloudflareDeploy.js'
import { registerDebugSkill } from './debug.js'
import { registerDocCoauthoringSkill } from './docCoauthoring.js'
import { registerDocxSkill } from './docx.js'
import { registerFrontendDesignSkill } from './frontendDesign.js'
import { registerInternalCommsSkill } from './internalComms.js'
import { registerKeybindingsSkill } from './keybindings.js'
import { registerLoremIpsumSkill } from './loremIpsum.js'
import { registerMcpBuilderSkill } from './mcpBuilder.js'
import { registerNetlifyDeploySkill } from './netlifyDeploy.js'
import { registerPdfSkill } from './pdf.js'
import { registerPptxSkill } from './pptx.js'
import { registerRememberSkill } from './remember.js'
import { registerRenderDeploySkill } from './renderDeploy.js'
import { registerSecurityBestPracticesSkill } from './securityBestPractices.js'
import { registerSecurityThreatModelSkill } from './securityThreatModel.js'
import { registerSimplifySkill } from './simplify.js'
import { registerSkillCreatorSkill } from './skillCreator.js'
import { registerSkillifySkill } from './skillify.js'
import { registerSlackGifCreatorSkill } from './slackGifCreator.js'
import { registerStuckSkill } from './stuck.js'
import { registerThemeFactorySkill } from './themeFactory.js'
import { registerUpdateConfigSkill } from './updateConfig.js'
import { registerVercelDeploySkill } from './vercelDeploy.js'
import { registerVerifySkill } from './verify.js'
import { registerWebArtifactsBuilderSkill } from './webArtifactsBuilder.js'
import { registerWebappTestingSkill } from './webappTesting.js'
import { registerXlsxSkill } from './xlsx.js'

/**
 * Initialize all bundled skills.
 * Called at startup to register skills that ship with the CLI.
 *
 * To add a new bundled skill:
 * 1. Create a new file in src/skills/bundled/ (e.g., myskill.ts)
 * 2. Export a register function that calls registerBundledSkill()
 * 3. Import and call that function here
 */
export function initBundledSkills(): void {
  registerUpdateConfigSkill()
  registerKeybindingsSkill()
  registerVerifySkill()
  registerDebugSkill()
  registerLoremIpsumSkill()
  registerSkillifySkill()
  registerRememberSkill()
  registerSimplifySkill()
  registerBatchSkill()
  registerStuckSkill()
  
  // Skills from external skills repository
  registerAlgorithmicArtSkill()
  registerBrandGuidelinesSkill()
  registerCanvasDesignSkill()
  registerCloudflareDeploySkill()
  registerDocCoauthoringSkill()
  registerDocxSkill()
  registerFrontendDesignSkill()
  registerInternalCommsSkill()
  registerMcpBuilderSkill()
  registerNetlifyDeploySkill()
  registerPdfSkill()
  registerPptxSkill()
  registerRenderDeploySkill()
  registerSecurityBestPracticesSkill()
  registerSecurityThreatModelSkill()
  registerSkillCreatorSkill()
  registerSlackGifCreatorSkill()
  registerThemeFactorySkill()
  registerVercelDeploySkill()
  registerWebArtifactsBuilderSkill()
  registerWebappTestingSkill()
  registerXlsxSkill()
  
  if (feature('KAIROS') || feature('KAIROS_DREAM')) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { registerDreamSkill } = require('./dream.js')
    /* eslint-enable @typescript-eslint/no-require-imports */
    registerDreamSkill()
  }
  if (feature('REVIEW_ARTIFACT')) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { registerHunterSkill } = require('./hunter.js')
    /* eslint-enable @typescript-eslint/no-require-imports */
    registerHunterSkill()
  }
  if (true) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { registerLoopSkill } = require('./loop.js')
    /* eslint-enable @typescript-eslint/no-require-imports */
    // /loop's isEnabled delegates to isKairosCronEnabled() — same lazy
    // per-invocation pattern as the cron tools. Registered unconditionally;
    // the skill's own isEnabled callback decides visibility.
    registerLoopSkill()
  }
  if (feature('AGENT_TRIGGERS_REMOTE')) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const {
      registerScheduleRemoteAgentsSkill,
    } = require('./scheduleRemoteAgents.js')
    /* eslint-enable @typescript-eslint/no-require-imports */
    registerScheduleRemoteAgentsSkill()
  }
  if (feature('BUILDING_CLAUDE_APPS')) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { registerClaudeApiSkill } = require('./claudeApi.js')
    /* eslint-enable @typescript-eslint/no-require-imports */
    registerClaudeApiSkill()
  }
  if (shouldAutoEnableClaudeInChrome()) {
    registerClaudeInChromeSkill()
  }
  if (feature('RUN_SKILL_GENERATOR')) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { registerRunSkillGeneratorSkill } = require('./runSkillGenerator.js')
    /* eslint-enable @typescript-eslint/no-require-imports */
    registerRunSkillGeneratorSkill()
  }
}
