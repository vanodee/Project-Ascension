import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'parishName',
      title: 'Parish Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortName',
      title: 'Short Name',
      type: 'string',
      description: 'Abbreviated name used in tight UI spaces.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'youtubeChannelId',
      title: 'YouTube Channel ID',
      type: 'string',
    }),
    defineField({
      name: 'massTimes',
      title: 'Mass Times',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              description: 'e.g. "Sundays" or "Weekdays"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'times',
              title: 'Times',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              description: 'e.g. ["7:00 AM", "9:00 AM", "11:00 AM"]',
            }),
            defineField({
              name: 'note',
              title: 'Note',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'heading' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'parishName' },
  },
})
