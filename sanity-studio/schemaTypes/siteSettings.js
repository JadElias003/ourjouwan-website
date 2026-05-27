import {defineField, defineType} from 'sanity'
import {localizedString} from './localized.js'

const localizedCard = (name, title) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      localizedString('label', 'Label'),
      localizedString('title', 'Title'),
      localizedString('description', 'Description', {long: true}),
    ],
  })

const imageField = (name, title) =>
  defineField({
    name,
    title,
    type: 'image',
    options: {hotspot: true},
  })

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Website Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'venue',
      title: 'Venue, Contact & Hours',
      type: 'object',
      fields: [
        defineField({name: 'name', title: 'Business Name', type: 'string'}),
        defineField({name: 'phone', title: 'WhatsApp Phone', type: 'string'}),
        defineField({name: 'latitude', title: 'Map Latitude', type: 'number'}),
        defineField({name: 'longitude', title: 'Map Longitude', type: 'number'}),
        defineField({name: 'weatherLatitude', title: 'Weather Latitude', type: 'number'}),
        defineField({name: 'weatherLongitude', title: 'Weather Longitude', type: 'number'}),
        defineField({name: 'openingMinutes', title: 'Opening Minutes After Midnight', type: 'number'}),
        defineField({name: 'closingMinutes', title: 'Closing Minutes After Midnight', type: 'number'}),
        defineField({name: 'hoursLabel', title: 'Hours Label', type: 'string'}),
        defineField({name: 'eventMessage', title: 'WhatsApp Event Message', type: 'text', rows: 3}),
      ],
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation Labels',
      type: 'array',
      of: [
        defineField({
          name: 'navItem',
          title: 'Navigation Item',
          type: 'object',
          fields: [
            defineField({
              name: 'page',
              title: 'Page',
              type: 'string',
              options: {
                list: [
                  {title: 'Home', value: 'home'},
                  {title: 'Menu', value: 'menu'},
                  {title: 'Events & Gallery', value: 'gallery'},
                ],
              },
            }),
            localizedString('label', 'Label'),
          ],
          preview: {select: {title: 'label.en', subtitle: 'page'}},
        }),
      ],
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        imageField('logoImage', 'Logo Image'),
        localizedString('tagline', 'Tagline'),
        localizedString('since', 'Small Line'),
        localizedString('primaryCta', 'Primary Button'),
        localizedString('secondaryCta', 'Secondary Button'),
      ],
    }),
    localizedCard('menuIntro', 'Menu Page Intro'),
    defineField({
      name: 'guestMoments',
      title: 'Guest Moments',
      type: 'object',
      fields: [
        localizedString('label', 'Label'),
        localizedString('title', 'Title'),
        localizedString('description', 'Description', {long: true}),
        defineField({
          name: 'moments',
          title: 'Moment Tabs',
          type: 'array',
          of: [
            defineField({
              name: 'moment',
              title: 'Moment',
              type: 'object',
              fields: [
                localizedString('label', 'Tab Label'),
                localizedString('kicker', 'Caption Kicker'),
                localizedString('title', 'Caption Title'),
                localizedString('description', 'Caption Description', {long: true}),
                imageField('image', 'Photo'),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'Experience Section',
      type: 'object',
      fields: [
        localizedString('label', 'Label'),
        localizedString('title', 'Title'),
        localizedString('description', 'Description', {long: true}),
        defineField({
          name: 'features',
          title: 'Feature Cards',
          type: 'array',
          of: [
            defineField({
              name: 'feature',
              title: 'Feature',
              type: 'object',
              fields: [
                localizedString('title', 'Title'),
                localizedString('description', 'Description', {long: true}),
              ],
            }),
          ],
        }),
      ],
    }),
    localizedCard('atmosphere', 'Atmosphere Section'),
    defineField({
      name: 'atmosphereImages',
      title: 'Atmosphere Photos',
      type: 'array',
      of: [
        defineField({
          name: 'atmosphereImage',
          title: 'Atmosphere Photo',
          type: 'object',
          fields: [
            imageField('image', 'Photo'),
            localizedString('alt', 'Alt Text'),
          ],
          preview: {
            select: {title: 'alt.en', media: 'image'},
          },
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Events & Gallery Page',
      type: 'object',
      fields: [
        localizedString('label', 'Label'),
        localizedString('title', 'Title'),
        localizedString('description', 'Description', {long: true}),
        defineField({
          name: 'eventCards',
          title: 'Event Cards',
          type: 'array',
          of: [
            defineField({
              name: 'eventCard',
              title: 'Event Card',
              type: 'object',
              fields: [
                localizedString('label', 'Label'),
                localizedString('title', 'Title'),
                localizedString('description', 'Description', {long: true}),
                defineField({
                  name: 'photos',
                  title: 'Gallery Photos',
                  type: 'array',
                  of: [
                    defineField({
                      name: 'galleryPhoto',
                      title: 'Gallery Photo',
                      type: 'object',
                      fields: [
                        imageField('image', 'Photo'),
                        localizedString('alt', 'Alt Text'),
                      ],
                      preview: {
                        select: {title: 'alt.en', media: 'image'},
                      },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    localizedCard('booking', 'Booking CTA'),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        localizedString('brandText', 'Brand Text', {long: true}),
        localizedString('locationLabel', 'Location Label'),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Website Settings'}),
  },
})
