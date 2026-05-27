import {defineField} from 'sanity'

export const localizedString = (name, title, options = {}) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({
        name: 'en',
        title: 'English',
        type: options.long ? 'text' : 'string',
        rows: options.long ? 3 : undefined,
        validation: options.required ? (Rule) => Rule.required() : undefined,
      }),
      defineField({
        name: 'ar',
        title: 'Arabic',
        type: options.long ? 'text' : 'string',
        rows: options.long ? 3 : undefined,
      }),
    ],
  })
