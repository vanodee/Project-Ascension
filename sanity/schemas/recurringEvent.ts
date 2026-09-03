import { defineArrayMember, defineField, defineType } from 'sanity'

const eventTypes = [
  { title: 'Mass', value: 'mass' },
  { title: 'Confession', value: 'confession' },
  { title: 'Parish Event', value: 'parish_event' },
  { title: 'Meeting', value: 'meeting' },
  { title: 'Special Celebration', value: 'celebration' },
]

const weekdays = [
  { title: 'Sunday', value: '0' },
  { title: 'Monday', value: '1' },
  { title: 'Tuesday', value: '2' },
  { title: 'Wednesday', value: '3' },
  { title: 'Thursday', value: '4' },
  { title: 'Friday', value: '5' },
  { title: 'Saturday', value: '6' },
]

const ordinals = [
  { title: 'First', value: 'first' },
  { title: 'Second', value: 'second' },
  { title: 'Third', value: 'third' },
  { title: 'Fourth', value: 'fourth' },
  { title: 'Last', value: 'last' },
]

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const weekdayTitles = Object.fromEntries(weekdays.map(({ title, value }) => [value, title.slice(0, 3)]))

export default defineType({
  name: 'recurringEvent',
  title: 'Recurring Event',
  type: 'document',
  description:
    'A repeating entry on the parish schedule (e.g. Sunday Mass, a weekly society meeting). ' +
    'One recurring event = one time slot. Use "Exceptions" to cancel or adjust a single date.',
  fieldsets: [
    { name: 'recurrence', title: 'Recurrence', options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: { list: eventTypes, layout: 'radio' },
      initialValue: 'mass',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'frequency',
      title: 'Repeats',
      type: 'string',
      fieldset: 'recurrence',
      options: { list: [
        { title: 'Weekly', value: 'weekly' },
        { title: 'Monthly', value: 'monthly' },
      ], layout: 'radio' },
      initialValue: 'weekly',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'daysOfWeek',
      title: 'On these days',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'recurrence',
      options: { list: weekdays, layout: 'grid' },
      hidden: ({ parent }) => parent?.frequency !== 'weekly',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { frequency?: string } | undefined
          if (parent?.frequency !== 'weekly') return true
          return value && value.length > 0 ? true : 'Pick at least one day'
        }),
    }),
    defineField({
      name: 'monthlyOrdinal',
      title: 'Which occurrence',
      type: 'string',
      fieldset: 'recurrence',
      options: { list: ordinals, layout: 'radio' },
      hidden: ({ parent }) => parent?.frequency !== 'monthly',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { frequency?: string } | undefined
          if (parent?.frequency !== 'monthly') return true
          return value ? true : 'Required for monthly events'
        }),
    }),
    defineField({
      name: 'monthlyWeekday',
      title: 'Day of week',
      type: 'string',
      fieldset: 'recurrence',
      options: { list: weekdays, layout: 'radio' },
      hidden: ({ parent }) => parent?.frequency !== 'monthly',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { frequency?: string } | undefined
          if (parent?.frequency !== 'monthly') return true
          return value ? true : 'Required for monthly events'
        }),
    }),
    defineField({
      name: 'startMode',
      title: 'Start',
      type: 'string',
      fieldset: 'recurrence',
      options: { list: [
        { title: 'Fixed time', value: 'fixed' },
        { title: 'Follows another event', value: 'follows' },
      ], layout: 'radio' },
      initialValue: 'fixed',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'time',
      title: 'Start time',
      type: 'string',
      fieldset: 'recurrence',
      description: '24-hour, e.g. 07:00 or 18:30 (Lagos time)',
      hidden: ({ parent }) => parent?.startMode === 'follows',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { startMode?: string } | undefined
          if (parent?.startMode === 'follows') return true
          if (!value) return 'Required for a fixed-time event'
          return TIME_RE.test(value) ? true : 'Use 24-hour HH:MM, e.g. 07:00'
        }),
    }),
    defineField({
      name: 'anchorEvent',
      title: 'Follows this event',
      type: 'reference',
      fieldset: 'recurrence',
      to: [{ type: 'recurringEvent' }],
      description: 'Only events that can fall on the same day are listed.',
      hidden: ({ parent }) => parent?.startMode !== 'follows',
      options: {
        filter: ({ document }) => {
          const doc = document as {
            _id?: string
            frequency?: string
            daysOfWeek?: string[]
            monthlyOrdinal?: string
            monthlyWeekday?: string
          }
          const bareId = (doc._id ?? '').replace(/^drafts\./, '')
          const selfIds = [bareId, `drafts.${bareId}`]
          // startMode is unset on events created before this field existed — treat
          // "not follows" as fixed so those events remain pickable as anchors.
          const base = 'active == true && startMode != "follows" && !(_id in $selfIds)'
          if (doc.frequency === 'monthly') {
            return {
              filter: `${base} && ((frequency == "weekly" && $wd in daysOfWeek) || (frequency == "monthly" && monthlyWeekday == $wd && monthlyOrdinal == $ord))`,
              params: { wd: doc.monthlyWeekday ?? null, ord: doc.monthlyOrdinal ?? null, selfIds },
            }
          }
          return {
            filter: `${base} && ((frequency == "weekly" && count(daysOfWeek[@ in $days]) > 0) || (frequency == "monthly" && monthlyWeekday in $days))`,
            params: { days: doc.daysOfWeek ?? [], selfIds },
          }
        },
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { startMode?: string } | undefined
          if (parent?.startMode !== 'follows') return true
          return value ? true : 'Choose the event this one follows'
        }),
    }),
    defineField({
      name: 'anchorRelation',
      title: 'When',
      type: 'string',
      fieldset: 'recurrence',
      options: { list: [
        { title: 'After — when that event ends', value: 'after' },
        { title: 'Before — just before that event starts', value: 'before' },
        { title: 'During — when that event starts', value: 'during' },
      ], layout: 'radio' },
      initialValue: 'after',
      hidden: ({ parent }) => parent?.startMode !== 'follows',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { startMode?: string } | undefined
          if (parent?.startMode !== 'follows') return true
          return value ? true : 'Pick after / before / during'
        }),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      fieldset: 'recurrence',
      description: 'Optional — leave blank if there is no set end time.',
      validation: (Rule) => Rule.positive().integer(),
    }),
    defineField({
      name: 'startDate',
      title: 'First date (optional)',
      type: 'date',
      fieldset: 'recurrence',
      description: 'Leave blank for "always". Set for seasonal items (a novena, Lenten devotions).',
    }),
    defineField({
      name: 'endDate',
      title: 'Last date (optional)',
      type: 'date',
      fieldset: 'recurrence',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Turn off to hide this event from the schedule without deleting it.',
    }),
    defineField({
      name: 'overrides',
      title: 'Exceptions',
      type: 'array',
      description: 'Cancel or adjust individual dates. Old exceptions can be deleted once past.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'mode',
              title: 'What happens',
              type: 'string',
              options: { list: [
                { title: 'Cancelled — does not hold this date', value: 'cancelled' },
                { title: 'Modified — different time / details this date', value: 'modified' },
              ], layout: 'radio' },
              initialValue: 'cancelled',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'time',
              title: 'New start time',
              type: 'string',
              description: '24-hour, e.g. 08:00',
              hidden: ({ parent }) => parent?.mode !== 'modified',
              validation: (Rule) =>
                Rule.regex(TIME_RE, { name: 'time', invert: false }).warning(),
            }),
            defineField({
              name: 'location',
              title: 'New location',
              type: 'string',
              hidden: ({ parent }) => parent?.mode !== 'modified',
            }),
            defineField({
              name: 'title',
              title: 'New title',
              type: 'string',
              hidden: ({ parent }) => parent?.mode !== 'modified',
            }),
            defineField({
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2,
              description: 'Shown in the event details (e.g. "Moved for the Harvest Bazaar").',
              hidden: ({ parent }) => parent?.mode !== 'modified',
            }),
          ],
          preview: {
            select: { date: 'date', mode: 'mode', title: 'title' },
            prepare({ date, mode, title }) {
              return {
                title: date ?? 'No date',
                subtitle: mode === 'modified' ? `Modified${title ? ` — ${title}` : ''}` : 'Cancelled',
              }
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((rows) => {
          if (!rows) return true
          const dates = (rows as { date?: string }[]).map((r) => r.date).filter(Boolean)
          return new Set(dates).size === dates.length
            ? true
            : 'Two exceptions share the same date'
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      frequency: 'frequency',
      daysOfWeek: 'daysOfWeek',
      monthlyOrdinal: 'monthlyOrdinal',
      monthlyWeekday: 'monthlyWeekday',
      startMode: 'startMode',
      anchorRelation: 'anchorRelation',
      time: 'time',
      active: 'active',
    },
    prepare({ title, frequency, daysOfWeek, monthlyOrdinal, monthlyWeekday, startMode, anchorRelation, time, active }) {
      const when =
        frequency === 'monthly'
          ? `Monthly · ${monthlyOrdinal ?? '?'} ${weekdayTitles[monthlyWeekday] ?? '?'}`
          : `Weekly · ${((daysOfWeek as string[]) ?? []).map((d) => weekdayTitles[d]).join(', ') || '?'}`
      const start = startMode === 'follows' ? `${anchorRelation ?? 'after'} another event` : (time ?? '?')
      return {
        title: active === false ? `${title} (inactive)` : title,
        subtitle: `${when} · ${start}`,
      }
    },
  },
})
