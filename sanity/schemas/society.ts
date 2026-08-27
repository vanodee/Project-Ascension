import { defineArrayMember, defineField, defineType } from 'sanity'

const societyTypes = [
  { title: 'Parish Zone', value: 'parish_zone' },
  { title: 'Demographic Organization', value: 'demographic_organization' },
  { title: 'Pious/Devotional Society', value: 'pious_devotional' },
  { title: 'Charismatic Movement', value: 'charismatic_movement' },
  { title: 'Knightly/Professional Order', value: 'knightly_professional' },
  { title: 'Liturgical Ministry', value: 'liturgical_ministry' },
  { title: 'General / Parish-Wide', value: 'general' },
]

const societyTypeLabels = Object.fromEntries(
  societyTypes.map(({ title, value }) => [value, title]),
)

export default defineType({
  name: 'society',
  title: 'Society',
  type: 'document',
  fieldsets: [
    {
      name: 'keyDetails',
      title: 'Key Details',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'societyType',
      title: 'Society Type',
      type: 'string',
      options: { list: societyTypes },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortName',
      title: 'Short Name',
      type: 'string',
      description: 'Abbreviated name for compact display (e.g. "CWO" for Catholic Women Organization).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Hex color code used to represent this society (e.g. "#8B1E3F").',
      validation: (Rule) =>
        Rule.required().regex(/^#[0-9A-Fa-f]{6}$/, {
          name: 'hex color',
          invert: false,
        }),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
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
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'slogan',
      title: 'Slogan / Greeting',
      description: 'A call-and-response greeting used by the society (e.g. a chant or motto).',
      type: 'object',
      fields: [
        defineField({
          name: 'greeting',
          title: 'Greeting',
          type: 'string',
        }),
        defineField({
          name: 'response',
          title: 'Response',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'zonePatron',
      title: 'Zone Patron',
      type: 'string',
      fieldset: 'keyDetails',
    }),
    defineField({
      name: 'established',
      title: 'Established',
      type: 'string',
      fieldset: 'keyDetails',
    }),
    defineField({
      name: 'meetingDay',
      title: 'Meeting Day',
      type: 'string',
      fieldset: 'keyDetails',
    }),
    defineField({
      name: 'zoneLeader',
      title: 'Zone Leader',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'keyDetails',
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'keyDetails',
    }),
  ],
  orderings: [
    {
      title: 'Name A–Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', societyType: 'societyType', media: 'logo' },
    prepare({ title, societyType, media }) {
      return {
        title,
        subtitle: societyTypeLabels[societyType] ?? societyType,
        media,
      }
    },
  },
})
