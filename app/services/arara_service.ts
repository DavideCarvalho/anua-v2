import { createHmac } from 'node:crypto'
import araraConfig from '#config/arara'

export interface SendMessageParams {
  receiver: string
  templateName: string
  variables: string[]
}

export interface SendSessionMessageParams {
  receiver: string
  body: string
}

export interface MessageResponse {
  id: string
  receiver: string
  status: string
  messageType: string
  createdAt: string
}

export interface TemplateParams {
  name: string
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'
  language: string
  body: string
  headerType?: 'text' | 'media' | 'document'
  header?: string
  footer?: string
}

export class AraraApiError extends Error {
  constructor(
    public status: number,
    public errors: Array<{ code: string; description: string }>
  ) {
    super(errors.map((e) => e.description).join('; '))
    this.name = 'AraraApiError'
  }
}

export class AraraService {
  constructor(
    private apiKey: string,
    private webhookSecret: string,
    private baseUrl: string = 'https://api.ararahq.com/api/v1'
  ) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers },
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        errors?: Array<{ code: string; description: string }>
      } | null
      throw new AraraApiError(
        response.status,
        body?.errors || [{ code: 'UNKNOWN', description: `HTTP ${response.status}` }]
      )
    }

    return (await response.json()) as T
  }

  async sendTemplate(params: SendMessageParams): Promise<MessageResponse> {
    return this.request<MessageResponse>('/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver: params.receiver,
        templateName: params.templateName,
        variables: params.variables,
      }),
    })
  }

  async sendSessionMessage(params: SendSessionMessageParams): Promise<MessageResponse> {
    return this.request<MessageResponse>('/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver: params.receiver,
        body: params.body,
      }),
    })
  }

  async getMessageStatus(messageId: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/messages/${messageId}`)
  }

  async createTemplate(
    params: TemplateParams
  ): Promise<{ id: string; name: string; status: string }> {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        category: params.category,
        language: params.language,
        body: params.body,
        headerType: params.headerType,
        header: params.header,
        footer: params.footer,
      }),
    })
  }

  verifyWebhook(body: string, signature: string): boolean {
    const hmac = createHmac('sha256', this.webhookSecret).update(body).digest('hex')
    return signature === hmac
  }
}

export const NOTIFICATION_TEMPLATE_MAP: Record<
  string,
  { templateName: string; buildVariables: (data: Record<string, unknown>) => string[] }
> = {
  PAYMENT_DUE: {
    templateName: 'payment_due_reminder',
    buildVariables: (data) => [
      data.responsibleName as string,
      data.studentName as string,
      data.dueDate as string,
      String(data.amount as number),
    ],
  },
  PAYMENT_OVERDUE: {
    templateName: 'payment_overdue',
    buildVariables: (data) => [
      data.responsibleName as string,
      data.studentName as string,
      String(data.amount as number),
      data.dueDate as string,
      data.paymentUrl as string,
    ],
  },
  GRADE_PUBLISHED: {
    templateName: 'grade_published',
    buildVariables: (data) => [
      data.responsibleName as string,
      data.subjectName as string,
      data.studentName as string,
    ],
  },
  SYSTEM_ANNOUNCEMENT: {
    templateName: 'school_announcement',
    buildVariables: (data) => [
      data.schoolName as string,
      data.announcementSummary as string,
      data.viewUrl as string,
    ],
  },
  OCCURRENCE_CREATED: {
    templateName: 'occurrence_alert',
    buildVariables: (data) => [
      data.responsibleName as string,
      data.studentName as string,
      data.occurrenceDate as string,
      data.viewUrl as string,
    ],
  },
  ASSIGNMENT_CREATED: {
    templateName: 'new_assignment',
    buildVariables: (data) => [
      data.responsibleName as string,
      data.studentName as string,
      data.subjectName as string,
      data.dueDate as string,
    ],
  },
  INQUIRY_MESSAGE: {
    templateName: 'inquiry_message',
    buildVariables: (data) => [data.studentName as string],
  },
}

let araraServiceInstance: AraraService | null = null

export function getAraraService(): AraraService {
  if (!araraServiceInstance) {
    araraServiceInstance = new AraraService(
      araraConfig.apiKey,
      araraConfig.webhookSecret,
      araraConfig.baseUrl
    )
  }
  return araraServiceInstance
}
