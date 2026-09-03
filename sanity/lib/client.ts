import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  // The token is present for authenticated CDN reads; without an explicit
  // perspective the client also returns unpublished drafts, which must never
  // reach the public site.
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN,
})
