import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'sacramentPage',
  title: 'Sacrament Page',
  type: 'document',
  fields: [
    defineField({
      name: 'sacrament',
      title: 'Sacrament',
      type: 'string',
      options: {
        list: [
          { title: 'RCIA', value: 'rcia' },
          { title: 'Baptism', value: 'baptism' },
          { title: 'Eucharist', value: 'eucharist' },
          { title: 'Confirmation', value: 'confirmation' },
          { title: 'Reconciliation', value: 'reconciliation' },
          { title: 'Anointing of the Sick', value: 'anointing' },
          { title: 'Matrimony', value: 'matrimony' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Nav Label',
      type: 'string',
      description: 'Short label used in navigation tabs.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'One-paragraph summary shown below the hero.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'tallyFormId',
      title: 'Tally Form ID',
      type: 'string',
      description: 'Tally.so form ID to embed an enquiry form on this page.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'sacrament', media: 'heroImage' },
  },
})
