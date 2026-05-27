import {defineField, defineType} from 'sanity'
import {localizedString} from './localized.js'

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Menu Category',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Category ID',
      type: 'slug',
      options: {source: 'title.en'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    localizedString('tabLabel', 'Short Tab Label', {required: true}),
    localizedString('title', 'Section Title', {required: true}),
    defineField({
      name: 'iconKey',
      title: 'Icon',
      type: 'string',
      initialValue: 'sandwiches',
      options: {
        list: [
          {title: 'Sandwiches', value: 'sandwiches'},
          {title: 'Mains', value: 'mains'},
          {title: 'Poolside', value: 'poolside'},
          {title: 'Desserts', value: 'desserts'},
          {title: 'Drinks', value: 'drinks'},
          {title: 'Hot Drinks', value: 'hotDrinks'},
          {title: 'Shisha', value: 'shisha'},
        ],
      },
    }),
    defineField({
      name: 'hidden',
      title: 'Hide this category',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineField({
          name: 'menuItem',
          title: 'Menu Item',
          type: 'object',
          fields: [
            localizedString('name', 'Name', {required: true}),
            defineField({name: 'price', title: 'Price', type: 'string'}),
            localizedString('tag', 'Tag'),
            defineField({
              name: 'hidden',
              title: 'Hide this item',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'name.en', subtitle: 'price'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title.en', subtitle: 'tabLabel.en'},
  },
})
