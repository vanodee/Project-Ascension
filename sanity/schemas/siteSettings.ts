import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fieldsets: [
    {
      name: 'seo',
      title: 'Location & identity (for search engines)',
      description:
        'Feeds the structured data (JSON-LD) that Google and social platforms read. ' +
        'Keep the street/city/state here consistent with the Address field above.',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      name: 'streetAddress',
      title: 'Street address',
      type: 'string',
      description: 'Road / street only, e.g. "Murtala Muhammed International Airport Road".',
      fieldset: 'seo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'addressLocality',
      title: 'City / town',
      type: 'string',
      initialValue: 'Ikeja',
      fieldset: 'seo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'addressRegion',
      title: 'State',
      type: 'string',
      initialValue: 'Lagos',
      fieldset: 'seo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'postalCode',
      title: 'Postal code',
      type: 'string',
      fieldset: 'seo',
    }),
    defineField({
      name: 'addressCountry',
      title: 'Country code',
      type: 'string',
      description: 'Two-letter ISO country code, e.g. "NG".',
      initialValue: 'NG',
      fieldset: 'seo',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      description:
        'Decimal degrees. In Google Maps, right-click the church → the first number in the menu.',
      fieldset: 'seo',
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      description: 'Decimal degrees. The second number from the Google Maps right-click menu.',
      fieldset: 'seo',
    }),
    defineField({
      name: 'logo',
      title: 'Parish logo / crest',
      type: 'image',
      description:
        'Square image. Used by search engines and as a fallback icon on social shares.',
      fieldset: 'seo',
    }),
    defineField({
      name: 'foundingYear',
      title: 'Year founded',
      type: 'string',
      description: 'The year the parish was established, e.g. "1985".',
      fieldset: 'seo',
    }),
    defineField({
      name: 'diocese',
      title: 'Diocese / archdiocese',
      type: 'string',
      initialValue: 'Catholic Archdiocese of Lagos',
      fieldset: 'seo',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'parishName' },
  },
})
