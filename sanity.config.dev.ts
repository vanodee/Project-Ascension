'use client'

import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { basePlugins, sharedConfig } from './sanity.config'

export default defineConfig({
  ...sharedConfig,
  plugins: [...basePlugins, visionTool()],
})
