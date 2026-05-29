// Content for the theme-factory bundled skill.
// Each file is inlined as a string at build time via Bun's text loader.
import SKILL_md from './theme-factory/SKILL.md'
import themes_arctic_frost_md from './theme-factory/themes/arctic-frost.md'
import themes_botanical_garden_md from './theme-factory/themes/botanical-garden.md'
import themes_desert_rose_md from './theme-factory/themes/desert-rose.md'
import themes_forest_canopy_md from './theme-factory/themes/forest-canopy.md'
import themes_golden_hour_md from './theme-factory/themes/golden-hour.md'
import themes_midnight_galaxy_md from './theme-factory/themes/midnight-galaxy.md'
import themes_modern_minimalist_md from './theme-factory/themes/modern-minimalist.md'
import themes_ocean_depths_md from './theme-factory/themes/ocean-depths.md'
import themes_sunset_boulevard_md from './theme-factory/themes/sunset-boulevard.md'
import themes_tech_innovation_md from './theme-factory/themes/tech-innovation.md'

export const SKILL_MD: string = SKILL_md

export const SKILL_FILES: Record<string, string> = {
  'themes/arctic-frost.md': themes_arctic_frost_md,
  'themes/botanical-garden.md': themes_botanical_garden_md,
  'themes/desert-rose.md': themes_desert_rose_md,
  'themes/forest-canopy.md': themes_forest_canopy_md,
  'themes/golden-hour.md': themes_golden_hour_md,
  'themes/midnight-galaxy.md': themes_midnight_galaxy_md,
  'themes/modern-minimalist.md': themes_modern_minimalist_md,
  'themes/ocean-depths.md': themes_ocean_depths_md,
  'themes/sunset-boulevard.md': themes_sunset_boulevard_md,
  'themes/tech-innovation.md': themes_tech_innovation_md,
}

