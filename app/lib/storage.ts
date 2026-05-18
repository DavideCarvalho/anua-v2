import drive from '@adonisjs/drive/services/main'

/**
 * Gera URL assinada de curta duração pra um arquivo armazenado em disco privado.
 * Use para qualquer asset/documento que precisa ser servido ao frontend.
 *
 * O `key` armazenado no banco deve ser o path interno (ex: `schools/abc/logo-xyz.jpg`),
 * não uma URL completa. Esta função converte chave → URL assinada.
 *
 * Se receber algo que parece uma URL legada (começa com http), devolve como está
 * pra back-compat enquanto a migração não termina.
 */
export async function getSignedAssetUrl(
  key: string | null,
  opts: { expiresIn?: string } = {}
): Promise<string | null> {
  if (!key) return null

  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key
  }

  return drive.use().getSignedUrl(key, { expiresIn: opts.expiresIn || '7 days' })
}
