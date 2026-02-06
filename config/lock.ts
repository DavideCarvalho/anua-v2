import { defineConfig, stores } from '@adonisjs/lock'

const lockConfig = defineConfig({
  default: 'database',
  stores: {
    database: stores.database({
      connectionName: 'postgres',
      tableName: 'locks',
    }),
  },
})

export default lockConfig

declare module '@adonisjs/lock/types' {
  export interface LockStoresList extends InferLockStores<typeof lockConfig> {}
}
