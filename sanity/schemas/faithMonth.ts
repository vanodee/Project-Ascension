import { defineField, defineType } from 'sanity'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default defineType({
  name: 'faithMonth',
  title: 'Deepening the Faith — Monthly Theme',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(2020).max(2100),
    }),
    defineField({
      name: 'month',
      title: 'Month',
      type: 'number',
      options: {
        list: MONTH_NAMES.map((title, i) => ({ title, value: i + 1 })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Theme for the Month',
      type: 'string',
      description: 'e.g. "Life and Spirituality of Saint Francis of Assisi".',
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'monthDesc',
      by: [
        { field: 'year', direction: 'desc' },
        { field: 'month', direction: 'desc' },
      ],
    },
  ],
  initialValue: () => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  },
  preview: {
    select: { year: 'year', month: 'month', theme: 'theme' },
    prepare({ year, month, theme }: { year?: number; month?: number; theme?: string }) {
      const name = month ? MONTH_NAMES[month - 1] : undefined
      return {
        title: [name, year].filter(Boolean).join(' ') || 'Untitled month',
        subtitle: theme,
      }
    },
  },
})
