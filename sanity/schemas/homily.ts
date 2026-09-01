import { defineArrayMember, defineField, defineType } from 'sanity'
import { AudioFileInput } from '../components/AudioFileInput'

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
      name: 'scriptureReferences',
      title: 'Scripture References',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'One entry per reading covered, e.g. "John 3:16–21".',
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
      description:
        'Always required, even when an audio recording is attached — this is what readers see, and it’s the whole experience for homilies with no recording.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audioFile',
      title: 'Audio Recording',
      type: 'file',
      // No `accept` restriction: Studio checks a dropped/selected file's
      // *browser-reported* MIME type against it, not its real content or
      // extension. Windows' file-type associations for audio extensions vary
      // per machine — a perfectly valid MP3 can get reported as e.g.
      // "video/mpeg" (confirmed: a real MP3 renamed to end in .mpeg was
      // rejected as "no known conversion... (video/mpeg)" until this was
      // removed) or with no type at all. The field is already scoped to
      // audio by its label; Sanity's storage/serving doesn't care about MIME.
      components: { input: AudioFileInput },
    }),
    defineField({
      name: 'audioDurationSeconds',
      title: 'Audio Duration (seconds)',
      type: 'number',
      description:
        'Filled in automatically from the uploaded recording — adjust only if it looks wrong.',
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
