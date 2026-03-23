import { defineConfig, store, drivers } from '@adonisjs/cache'
import env from '#start/env'

const cacheConfig = defineConfig({
  default: env.get('NODE_ENV') === 'test' ? 'memoryOnly' : 'default',

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    default: store().useL2Layer(
      drivers.database({
        connectionName: 'postgres',
        autoCreateTable: true,
        tableName: 'bentocache',
      })
    ),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
