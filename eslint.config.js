import { configApp } from '@adonisjs/eslint-config'

const baseConfig = configApp()

export default [
  ...baseConfig,
  {
    files: ['inertia/engine/**/*.{ts,tsx}', 'inertia/lib/**/*.{ts,tsx}'],
    rules: {
      '@unicorn/filename-case': 'off',
    },
  },
]
