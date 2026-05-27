import {defineCliConfig} from 'sanity/cli'
import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '8mb28mnv'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const studioRoot = dirname(fileURLToPath(import.meta.url))

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  vite: {
    server: {
      fs: {
        allow: [studioRoot],
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
  },
})
