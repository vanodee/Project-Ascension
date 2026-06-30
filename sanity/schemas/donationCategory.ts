import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'donationCategory',
  title: 'Donation Category',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      description: 'Internal identifier, e.g. "building-fund".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Display name shown to donors, e.g. "Building Fund".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'id' },
  },
})
