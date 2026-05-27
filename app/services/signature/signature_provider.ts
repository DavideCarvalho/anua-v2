export type SignerAction = 'SIGN' | 'SIGN_AS_A_WITNESS' | 'APPROVE' | 'RECOGNIZE'

export type DeliveryMethod = 'EMAIL' | 'WHATSAPP' | 'SMS'

export interface SignerInput {
  name: string
  email?: string
  phone?: string
  cpf?: string
  action: SignerAction
  deliveryMethod?: DeliveryMethod
}

export interface CreateDocumentInput {
  name: string
  signers: SignerInput[]
  file: Buffer
  fileName: string
  message?: string
  folderId?: string
}

export interface SignatureInfo {
  publicId: string
  name: string
  email: string | null
  signedAt: string | null
  action: string
  signatureLink: string | null
}

export interface DocumentResult {
  documentId: string
  name: string
  status: string
  createdAt: string
  signatures: SignatureInfo[]
}

export interface DocumentDetails {
  documentId: string
  name: string
  status: string
  createdAt: string
  signatures: SignatureInfo[]
  fileUrl: string | null
}

export interface SignatureLinkResult {
  signatureLink: string
}

export interface SignatureProvider {
  createDocument(input: CreateDocumentInput): Promise<DocumentResult>
  getDocument(documentId: string): Promise<DocumentDetails>
  deleteDocument(documentId: string): Promise<void>
  createSignatureLink(signaturePublicId: string): Promise<SignatureLinkResult>
  resendSignature(documentId: string): Promise<void>
}
