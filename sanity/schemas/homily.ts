import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'homily',
  title: 'Homily',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'clergyMember' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'scriptureReference',
      title: 'Scripture Reference',
      type: 'string',
      description: 'e.g. "John 3:16–21"',
    }),
    defineField({
      name: 'liturgicalSeason',
      title: 'Liturgical Season',
      type: 'string',
      options: {
        list: [
          { title: 'Ordinary Time', value: 'ordinary' },
          { title: 'Advent', value: 'advent' },
          { title: 'Christmas', value: 'christmas' },
          { title: 'Lent', value: 'lent' },
          { title: 'Easter', value: 'easter' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Homily Text',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'audioFile',
      title: 'Audio Recording',
      type: 'file',
      options: { accept: 'audio/*' },
    }),
    defineField({
      name: 'audioDuration',
      title: 'Audio Duration',
      type: 'string',
      description: 'Enter manually in MM:SS format, e.g. "18:04".',
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author.name',
    },
  },
})
