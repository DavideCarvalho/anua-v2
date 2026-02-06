// Field labels by entity type
export const FIELD_LABELS: Record<string, Record<string, string>> = {
  Invoice: {
    totalAmount: 'Valor Total',
    dueDate: 'Vencimento',
    status: 'Status',
    paymentMethod: 'Forma de Pagamento',
    month: 'Mês',
    year: 'Ano',
    type: 'Tipo',
    observation: 'Observação',
  },
  StudentPayment: {
    amount: 'Valor',
    totalAmount: 'Valor Original',
    dueDate: 'Vencimento',
    status: 'Status',
    discountPercentage: 'Desconto (%)',
    type: 'Tipo',
    invoiceId: 'Fatura',
    installments: 'Parcelas',
    installmentNumber: 'Parcela Nº',
    month: 'Mês',
    year: 'Ano',
  },
  StudentHasLevel: {
    contractId: 'Contrato',
    scholarshipId: 'Bolsa',
    paymentDay: 'Dia de Vencimento',
    installments: 'Parcelas',
    paymentMethod: 'Forma de Pagamento',
    levelId: 'Nível',
    classId: 'Turma',
    status: 'Status',
  },
  Agreement: {
    totalAmount: 'Valor Total',
    installments: 'Parcelas',
    status: 'Status',
    paymentMethod: 'Forma de Pagamento',
    observation: 'Observação',
  },
  Contract: {
    ammount: 'Valor',
    paymentType: 'Tipo de Pagamento',
    installments: 'Parcelas',
    name: 'Nome',
    description: 'Descrição',
    enrollmentValue: 'Taxa de Matrícula',
  },
}

// Source (route name / job name) to friendly label
export const SOURCE_LABELS: Record<string, string> = {
  // Controllers
  'students.update_enrollment': 'Editar Matrícula',
  'students.enrollments.update': 'Editar Matrícula',
  'student_payments.create': 'Criar Pagamento',
  'student-payments.store': 'Criar Pagamento',
  'student_payments.cancel': 'Cancelar Pagamento',
  'student-payments.cancel': 'Cancelar Pagamento',
  'student_payments.update': 'Editar Pagamento',
  'student-payments.update': 'Editar Pagamento',
  'invoices.markPaid': 'Marcar Fatura como Paga',
  'agreements.store': 'Criar Acordo',
  'contracts.store': 'Criar Contrato',
  'contracts.update': 'Editar Contrato',

  // Jobs
  'GenerateStudentPaymentsJob': 'Sistema - Geração de Pagamentos',
  'ReconcilePaymentInvoiceJob': 'Sistema - Reconciliação de Fatura',
  'GenerateInvoices': 'Sistema - Geração de Faturas',
  'GenerateInvoicesJob': 'Sistema - Geração de Faturas',
  'MarkOverdueInvoicesJob': 'Sistema - Marcação de Atraso',

  // Fallback
  'unknown': 'Sistema',
}

// Event type labels
export const EVENT_LABELS: Record<string, string> = {
  created: 'Criado',
  updated: 'Atualizado',
  deleted: 'Removido',
}

// Entity type labels
export const ENTITY_LABELS: Record<string, string> = {
  Invoice: 'Fatura',
  StudentPayment: 'Pagamento',
  StudentHasLevel: 'Matrícula',
  Agreement: 'Acordo',
  Contract: 'Contrato',
}

// Status labels
export const STATUS_LABELS: Record<string, string> = {
  // Invoice status
  OPEN: 'Aberta',
  PENDING: 'Pendente',
  PAID: 'Paga',
  OVERDUE: 'Atrasada',
  CANCELLED: 'Cancelada',
  RENEGOTIATED: 'Renegociada',

  // Payment status
  NOT_PAID: 'Não Pago',
  FAILED: 'Falhou',

  // Payment type
  ENROLLMENT: 'Matrícula',
  TUITION: 'Mensalidade',
  CANTEEN: 'Cantina',
  COURSE: 'Curso',
  AGREEMENT: 'Acordo',
  STUDENT_LOAN: 'Empréstimo',
  STORE: 'Loja',
  EXTRA_CLASS: 'Aula Avulsa',
  OTHER: 'Outro',

  // Contract payment type
  MONTHLY: 'Mensal',
  UPFRONT: 'Antecipado',

  // Payment method
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
}

// Get label for a field value
export function getFieldLabel(entityType: string, field: string): string {
  return FIELD_LABELS[entityType]?.[field] ?? field
}

// Get label for source
export function getSourceLabel(source: string | null | undefined): string {
  if (!source) return 'Sistema'
  return SOURCE_LABELS[source] ?? source
}

// Get label for event
export function getEventLabel(event: string): string {
  return EVENT_LABELS[event] ?? event
}

// Get label for entity type
export function getEntityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] ?? entityType
}

// Format a value for display
export function formatAuditValue(field: string, value: unknown, entityType: string): string {
  if (value === null || value === undefined) {
    return '—'
  }

  // Money fields
  if (
    ['amount', 'totalAmount', 'ammount', 'enrollmentValue', 'netAmountReceived'].includes(field)
  ) {
    const numValue = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue / 100)
  }

  // Percentage fields
  if (field === 'discountPercentage') {
    return `${value}%`
  }

  // Date fields
  if (field === 'dueDate' || field === 'paidAt') {
    if (typeof value === 'string') {
      const date = new Date(value)
      return date.toLocaleDateString('pt-BR')
    }
    return String(value)
  }

  // Day of month
  if (field === 'paymentDay') {
    return `dia ${value}`
  }

  // Status and type fields
  if (['status', 'type', 'paymentType', 'paymentMethod'].includes(field)) {
    return STATUS_LABELS[String(value)] ?? String(value)
  }

  // ID fields - just show that it changed
  if (field.endsWith('Id')) {
    return value ? '(vinculado)' : '(não vinculado)'
  }

  return String(value)
}
