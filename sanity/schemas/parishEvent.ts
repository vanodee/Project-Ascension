import { defineField, defineType } from 'sanity'

const eventTypes = [
  { title: 'Mass', value: 'mass' },
  { title: 'Confession', value: 'confession' },
  { title: 'Parish Event', value: 'parish_event' },
  { title: 'Meeting', value: 'meeting' },
  { title: 'Special Celebration', value: 'celebration' },
]

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export default defineType({
  name: 'parishEvent',
  title: 'One-off Event',
  type: 'document',
  description:
    'A single dated event — an ordination, a procession, a requiem, a retreat. ' +
    'For anything that repeats, use a Recurring Event instead.',
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
      initialValue: 'celebration',
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
      name: 'startDate',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End date (optional)',
      type: 'date',
      description: 'Only for multi-day events (a triduum, a retreat weekend).',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { startDate?: string } | undefined
          if (!value || !parent?.startDate) return true
          return value >= parent.startDate ? true : 'End date is before the start date'
        }),
    }),
    defineField({
      name: 'allDay',
      title: 'All day',
      type: 'boolean',
      initialValue: false,
      description: 'No specific time — shown as "All day".',
    }),
    defineField({
      name: 'startMode',
      title: 'Start',
      type: 'string',
      options: { list: [
        { title: 'Fixed time', value: 'fixed' },
        { title: 'Follows another event', value: 'follows' },
      ], layout: 'radio' },
      initialValue: 'fixed',
      hidden: ({ parent }) => Boolean(parent?.allDay),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { allDay?: boolean } | undefined
          if (parent?.allDay) return true
          return value ? true : 'Choose a fixed time or follow another event'
        }),
    }),
    defineField({
      name: 'startTime',
      title: 'Start time',
      type: 'string',
      description: '24-hour, e.g. 10:00 (Lagos time)',
      hidden: ({ parent }) => Boolean(parent?.allDay) || parent?.startMode === 'follows',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { allDay?: boolean; startMode?: string } | undefined
          if (parent?.allDay || parent?.startMode === 'follows') return true
          if (!value) return 'Required unless the event is all day'
          return TIME_RE.test(value) ? true : 'Use 24-hour HH:MM, e.g. 10:00'
        }),
    }),
    defineField({
      name: 'anchorEvent',
      title: 'Follows this event',
      type: 'reference',
      to: [{ type: 'recurringEvent' }, { type: 'parishEvent' }],
      description: 'Only fixed-time events on the same date are listed.',
      hidden: ({ parent }) => Boolean(parent?.allDay) || parent?.startMode !== 'follows',
      options: {
        filter: ({ document }) => {
          const doc = document as { _id?: string; startDate?: string }
          const bareId = (doc._id ?? '').replace(/^drafts\./, '')
          const selfIds = [bareId, `drafts.${bareId}`]
          const date = doc.startDate ?? null
          const wd = date ? String(new Date(`${date}T12:00:00Z`).getUTCDay()) : null
          // startMode is unset on events created before this field existed —
          // "not follows" means fixed.
          return {
            filter:
              '(_type == "recurringEvent" && active == true && startMode != "follows" && ((frequency == "weekly" && $wd in daysOfWeek) || (frequency == "monthly" && monthlyWeekday == $wd))) || (_type == "parishEvent" && startMode != "follows" && startDate == $date && !(_id in $selfIds))',
            params: { wd, date, selfIds },
          }
        },
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { allDay?: boolean; startMode?: string } | undefined
          if (parent?.allDay || parent?.startMode !== 'follows') return true
          return value ? true : 'Choose the event this one follows'
        }),
    }),
    defineField({
      name: 'anchorRelation',
      title: 'When',
      type: 'string',
      options: { list: [
        { title: 'After — when that event ends', value: 'after' },
        { title: 'Before — just before that event starts', value: 'before' },
        { title: 'During — when that event starts', value: 'during' },
      ], layout: 'radio' },
      initialValue: 'after',
      hidden: ({ parent }) => Boolean(parent?.allDay) || parent?.startMode !== 'follows',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { allDay?: boolean; startMode?: string } | undefined
          if (parent?.allDay || parent?.startMode !== 'follows') return true
          return value ? true : 'Pick after / before / during'
        }),
    }),
    defineField({
      name: 'endTime',
      title: 'End time (optional)',
      type: 'string',
      description: '24-hour, e.g. 13:00',
      hidden: ({ parent }) => Boolean(parent?.allDay),
      validation: (Rule) =>
        Rule.regex(TIME_RE, { name: 'time', invert: false }).warning(),
    }),
  ],
  orderings: [
    {
      title: 'Date',
      name: 'startDateAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      endDate: 'endDate',
      allDay: 'allDay',
      startMode: 'startMode',
      anchorRelation: 'anchorRelation',
      startTime: 'startTime',
    },
    prepare({ title, startDate, endDate, allDay, startMode, anchorRelation, startTime }) {
      const range = endDate && endDate !== startDate ? `${startDate} – ${endDate}` : startDate
      const when = allDay
        ? ' · All day'
        : startMode === 'follows'
          ? ` · ${anchorRelation ?? 'after'} another event`
          : startTime
            ? ` · ${startTime}`
            : ''
      return {
        title,
        subtitle: `${range ?? 'No date'}${when}`,
      }
    },
  },
})
