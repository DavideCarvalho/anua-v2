import env from '#start/env'
import type { SignatureProvider } from './signature_provider.js'
import AutentiqueSignatureProvider from './autentique_signature_provider.js'

export function resolveSignatureProvider(): SignatureProvider {
  const provider = env.get('SIGNATURE_PROVIDER', 'autentique')
  const apiKey = env.get('AUTENTIQUE_API_KEY', '')

  switch (provider) {
    case 'autentique':
      if (!apiKey) throw new Error('AUTENTIQUE_API_KEY não configurada')
      return new AutentiqueSignatureProvider(apiKey)
    default:
      throw new Error(`Signature provider "${provider}" não suportado`)
  }
}
