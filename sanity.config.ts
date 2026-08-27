'use client'

import { defineConfig, type TemplateResolver } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

const singletons = new Set(['aboutPage', 'siteSettings'])

export const basePlugins = [
  structureTool({
    structure: (S) =>
      S.list()
        .title('Content')
        .items([
          S.documentTypeListItem('clergyMember').title('Clergy'),
          S.documentTypeListItem('society').title('Societies'),
          S.documentTypeListItem('announcement').title('Announcements'),
          S.documentTypeListItem('homily').title('Homilies'),
          S.documentTypeListItem('galleryAlbum').title('Gallery Albums'),
          S.documentTypeListItem('sacramentPage').title('Sacrament Pages'),
          S.documentTypeListItem('donationCategory').title('Donation Categories'),
          S.divider(),
          S.listItem()
            .title('About Page')
            .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
          S.listItem()
            .title('Site Settings')
            .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
        ]),
  }),
]

export const sharedConfig = {
  name: 'ascension-parish',
  title: 'Ascension Parish',
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  schema: {
    types: schemaTypes,
    templates: ((templates) =>
      templates.filter(({ schemaType }) => !singletons.has(schemaType))) satisfies TemplateResolver,
  },
}

export default defineConfig({
  ...sharedConfig,
  plugins: basePlugins,
})
