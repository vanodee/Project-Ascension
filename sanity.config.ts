import { defineConfig, type TemplateResolver } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const singletons = new Set(['aboutPage', 'siteSettings'])

// Loaded only by the Sanity CLI (`sanity dev`, `sanity build`, `sanity deploy`) —
// the Studio is hosted at https://ascension-parish.sanity.studio, not embedded in
// the Next app. projectId + dataset are public (see CLAUDE.md), matching sanity.cli.ts.
export default defineConfig({
  name: 'ascension-parish',
  title: 'Ascension Parish',
  projectId: 'p3p9t4z1',
  dataset: 'production',
  plugins: [
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
            S.listItem()
              .title('Schedule')
              .child(
                S.list()
                  .title('Schedule')
                  .items([
                    S.documentTypeListItem('recurringEvent').title('Recurring Events'),
                    S.documentTypeListItem('parishEvent').title('One-off Events'),
                  ]),
              ),
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
    templates: ((templates) =>
      templates.filter(({ schemaType }) => !singletons.has(schemaType))) satisfies TemplateResolver,
  },
})
