import { defineConfig } from '@jrmc/adonis-attachment'

export default defineConfig({
  converters: {
    thumbnail: {
      converter: () => import('@jrmc/adonis-attachment/converters/image_converter'),
      options: {
        resize: 200,
        format: 'webp',
      },
    },
  },
})
