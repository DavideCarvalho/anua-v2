import env from '#start/env'

export default {
  apiKey: env.get('ARARA_API_KEY', ''),
  webhookSecret: env.get('ARARA_WEBHOOK_SECRET', ''),
  baseUrl: 'https://api.ararahq.com/api/v1',
} as const
