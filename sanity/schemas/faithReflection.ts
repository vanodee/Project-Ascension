import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'faithReflection',
  title: 'Deepening the Faith — Weekly Reflection',
  type: 'document',
  fields: [
    defineField({
      name: 'month',
      title: 'Monthly Theme',
      type: 'reference',
      to: [{ type: 'faithMonth' }],
      description: 'The month this reflection belongs to — create the Monthly Theme first.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Sunday',
      type: 'date',
      description:
        'The Sunday this reflection is for. It stays hidden on the website until this date.',
      validation: (Rule) => [
        Rule.required(),
        // The date must fall inside the referenced month, or it would be filed
        // under one month's theme while sitting in another month's archive.
        Rule.custom(async (value, context) => {
          const parent = context.parent as { month?: { _ref?: string } } | undefined
          const ref = parent?.month?._ref
          if (!value || !ref) return true
          const month = await context
            .getClient({ apiVersion: '2024-01-01' })
            .fetch<{ year?: number; month?: number } | null>(
              `*[_id in [$id, "drafts." + $id]][0]{ year, month }`,
              { id: ref },
            )
          if (!month?.year || !month.month) return true
          const expected = `${month.year}-${String(month.month).padStart(2, '0')}`
          return value.slice(0, 7) === expected
            ? true
            : 'This date is outside the selected Monthly Theme’s month'
        }),
        Rule.custom((value) => {
          if (!value) return true
          return new Date(`${value}T12:00:00Z`).getUTCDay() === 0
            ? true
            : 'This date is not a Sunday — fine for a special occasion, otherwise double-check it'
        }).warning(),
      ],
    }),
    defineField({
      name: 'topic',
      title: 'Topic for the Week',
      type: 'string',
      description: 'Sentence case, e.g. "Who is Saint Francis of Assisi?" — the site styles the capitals.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'topic', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'biblicalReferences',
      title: 'Biblical References',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'One entry per passage, e.g. "Hebrews 13:7–9".',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'questions',
      title: 'Questions to Ponder',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 3 })],
      description: 'One entry per question — the site numbers them automatically.',
    }),
    defineField({
      name: 'teaching',
      title: 'Teaching',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
      description:
        'One paragraph per block. Use bold for lead-ins (e.g. "Preaching to the Birds:") and italic for quotations.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'suggestedTask',
      title: 'Suggested Task',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'topic', subtitle: 'date' },
  },
})
