import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const singletons = new Set(['aboutPage', 'siteSettings'])

export default defineConfig({
  name: 'ascension-parish',
  title: 'Ascension Parish',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('clergyMember').title('Clergy'),
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
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
})
