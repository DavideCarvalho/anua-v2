import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const gcsKeyFilename = env.get('GCS_KEY_FILENAME')
const gcsBucket = env.get('GCS_BUCKET')
const s3Key = env.get('S3_KEY')
const s3Secret = env.get('S3_SECRET')
const s3Bucket = env.get('S3_BUCKET')
const s3Endpoint = env.get('S3_ENDPOINT')
const s3Region = env.get('S3_REGION')

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
            ...(gcsKeyFilename ? { keyFilename: gcsKeyFilename } : {}),
            bucket: gcsBucket,
            visibility: 'public',
            usingUniformAcl: true,
          }),
        }
      : {}),

    ...(s3Bucket && s3Key && s3Secret && s3Endpoint
      ? {
          s3: services.s3({
            credentials: {
              accessKeyId: s3Key,
              secretAccessKey: s3Secret,
            },
            bucket: s3Bucket,
            region: s3Region || 'auto',
            endpoint: s3Endpoint,
            forcePathStyle: true,
            visibility: 'public',
          }),
        }
      : {}),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
