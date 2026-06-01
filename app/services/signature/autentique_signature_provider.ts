import type {
  SignatureProvider,
  CreateDocumentInput,
  DocumentResult,
  DocumentDetails,
  SignatureLinkResult,
  SignerInput,
} from './signature_provider.js'

const API_URL = 'https://api.autentique.com.br/v2/graphql'

interface AutentiqueSignature {
  public_id: string
  name: string
  email: string | null
  created_at: string
  action: { name: string } | null
  link: { short_link: string } | null
  signed: { created_at: string } | null
}

interface AutentiqueDocument {
  id: string
  name: string
  created_at: string
  files?: { signed: string | null }
  signatures: AutentiqueSignature[]
}

export default class AutentiqueSignatureProvider implements SignatureProvider {
  constructor(private apiKey: string) {}

  async createDocument(input: CreateDocumentInput): Promise<DocumentResult> {
    const mutation = `
      mutation CreateDocumentMutation(
        $document: DocumentInput!,
        $signers: [SignerInput!]!,
        $file: Upload!
      ) {
        createDocument(
          document: $document,
          signers: $signers,
          file: $file
        ) {
          id
          name
          created_at
          signatures {
            public_id
            name
            email
            created_at
            action { name }
            link { short_link }
          }
        }
      }
    `

    const signers = input.signers.map((s) => this.mapSigner(s))

    const variables = {
      document: {
        name: input.name,
        message: input.message ?? null,
      },
      signers,
      file: null,
    }

    const operations = JSON.stringify({ query: mutation, variables })
    const map = JSON.stringify({ file: ['variables.file'] })

    const form = new FormData()
    form.append('operations', operations)
    form.append('map', map)
    form.append('file', new Blob([new Uint8Array(input.file)]), input.fileName)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    })

    const json = await this.parseResponse<{ createDocument: AutentiqueDocument }>(response)
    const doc = json.createDocument

    return {
      documentId: doc.id,
      name: doc.name,
      status: 'PENDING',
      createdAt: doc.created_at,
      signatures: doc.signatures.map(this.mapSignatureResponse),
    }
  }

  async getDocument(documentId: string): Promise<DocumentDetails> {
    const query = `
      query {
        document(id: "${documentId}") {
          id
          name
          created_at
          files { signed }
          signatures {
            public_id
            name
            email
            created_at
            action { name }
            link { short_link }
            signed { created_at }
          }
        }
      }
    `

    const data = await this.graphql<{ document: AutentiqueDocument }>(query)
    const doc = data.document
    const allSigned = doc.signatures.every((s) => s.signed)

    return {
      documentId: doc.id,
      name: doc.name,
      status: allSigned ? 'SIGNED' : 'PENDING',
      createdAt: doc.created_at,
      fileUrl: doc.files?.signed ?? null,
      signatures: doc.signatures.map(this.mapSignatureResponse),
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.graphql(`mutation { deleteDocument(id: "${documentId}") }`)
  }

  async createSignatureLink(signaturePublicId: string): Promise<SignatureLinkResult> {
    const data = await this.graphql<{
      createLinkToSignature: { short_link: string }
    }>(`mutation { createLinkToSignature(public_id: "${signaturePublicId}") { short_link } }`)

    return { signatureLink: data.createLinkToSignature.short_link }
  }

  async resendSignature(documentId: string): Promise<void> {
    await this.graphql(`mutation { resendDocument(id: "${documentId}") }`)
  }

  private mapSigner(signer: SignerInput) {
    const mapped: Record<string, unknown> = {
      name: signer.name,
      action: signer.action,
    }

    // Autentique exige apenas UM canal por signer (email XOR phone).
    if (signer.email) {
      mapped.email = signer.email
      mapped.delivery_method = 'DELIVERY_METHOD_EMAIL'
    } else if (signer.phone) {
      mapped.phone = signer.phone
      mapped.delivery_method =
        signer.deliveryMethod === 'SMS' ? 'DELIVERY_METHOD_SMS' : 'DELIVERY_METHOD_WHATSAPP'
    }
    if (signer.cpf) mapped.configs = { cpf: signer.cpf }
    if (signer.positions?.length) {
      mapped.positions = signer.positions.map((p) => ({
        x: p.x,
        y: p.y,
        z: p.z,
        element: p.element,
      }))
    }

    return mapped
  }

  private mapSignatureResponse(sig: AutentiqueSignature) {
    return {
      publicId: sig.public_id,
      name: sig.name,
      email: sig.email,
      signedAt: sig.signed?.created_at ?? null,
      action: sig.action?.name ?? 'SIGN',
      signatureLink: sig.link?.short_link ?? null,
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text()
    let json: { data?: T; errors?: Array<{ message: string; extensions?: unknown }> }
    try {
      json = JSON.parse(text)
    } catch {
      throw new Error(
        `Autentique resposta não-JSON (status ${response.status}): ${text.slice(0, 500)}`
      )
    }
    if (json.errors && json.errors.length > 0) {
      const details = json.errors
        .map((e) => `${e.message}${e.extensions ? ` | ${JSON.stringify(e.extensions)}` : ''}`)
        .join(' | ')
      throw new Error(`Autentique: ${details}`)
    }
    if (!json.data) {
      throw new Error(
        `Autentique resposta sem data (status ${response.status}): ${text.slice(0, 500)}`
      )
    }
    return json.data
  }

  private async graphql<T>(query: string): Promise<T> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
    return this.parseResponse<T>(response)
  }
}
