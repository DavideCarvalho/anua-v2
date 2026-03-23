import { defineConfig, stores } from '@adonisjs/lock'
import env from '#start/env'

const lockConfig = defineConfig({
  default: env.get('NODE_ENV') === 'test' ? 'memory' : 'database',
  stores: {
    database: stores.database({
      connectionName: 'postgres',
      tableName: 'locks',
    }),
    memory: stores.memory(),
  },
})

export default lockConfig

declare module '@adonisjs/lock/types' {
  export interface LockStoresList extends InferLockStores<typeof lockConfig> {}
}
