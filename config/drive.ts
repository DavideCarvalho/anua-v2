import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const gcsKeyFilename = env.get('GCS_KEY_FILENAME')
const gcsBucket = env.get('GCS_BUCKET')

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK', 'fs'),

  services: {
    fs: services.fs({
      location: app.makePath('storage'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'public',
    }),

    ...(gcsBucket
      ? {
          gcs: services.gcs({
            // In Cloud Run, credentials are provided automatically
            // For local development, use GCS_KEY_FILENAME
            ...(gcsKeyFilename ? { keyFilename: gcsKeyFilename } : {}),
            bucket: gcsBucket,
            visibility: 'public',
            usingUniformAcl: true,
          }),
        }
      : {}),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
