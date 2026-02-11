import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: 'database',
  stores: {
    database: stores.database({
      tableName: 'rate_limits',
    }),
  },
})

export default limiterConfig
