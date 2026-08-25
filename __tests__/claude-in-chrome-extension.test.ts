import { describe, expect, it } from 'bun:test'
import {
  FORK_EXTENSION_ID,
  getExtensionIds,
  getNativeHostAllowedOrigins,
} from '../src/utils/claudeInChrome/setupPortable.js'

describe('Claude in Chrome extension identity', () => {
  it('detects and authorizes official and fork extensions', () => {
    expect(FORK_EXTENSION_ID).toBe('mjfljffcfhkalcgfefkccjcjdpfgifjh')
    expect(getExtensionIds()).toContain(FORK_EXTENSION_ID)
    expect(getNativeHostAllowedOrigins()).toContain(
      `chrome-extension://${FORK_EXTENSION_ID}/`,
    )
  })
})
