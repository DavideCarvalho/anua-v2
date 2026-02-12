export enum AppErrorCode {
  OPERATION_FAILED_WITH_PROVIDED_DATA = 'OPERATION_FAILED_WITH_PROVIDED_DATA',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_OR_EXPIRED_CODE = 'INVALID_OR_EXPIRED_CODE',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_WEBHOOK_TOKEN = 'INVALID_WEBHOOK_TOKEN',
  INVALID_WEBHOOK_PAYLOAD = 'INVALID_WEBHOOK_PAYLOAD',
  MISSING_EXTERNAL_REFERENCE = 'MISSING_EXTERNAL_REFERENCE',
  STORE_ORDER_NOT_FOUND = 'STORE_ORDER_NOT_FOUND',
  STORE_ORDER_INVALID_STATUS = 'STORE_ORDER_INVALID_STATUS',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
}

export const APP_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  [AppErrorCode.OPERATION_FAILED_WITH_PROVIDED_DATA]:
    'Não foi possível concluir a operação com os dados informados',
  [AppErrorCode.INVALID_CREDENTIALS]: 'Credenciais inválidas',
  [AppErrorCode.INVALID_OR_EXPIRED_CODE]: 'Código inválido ou expirado.',
  [AppErrorCode.BAD_REQUEST]: 'Requisição inválida',
  [AppErrorCode.FORBIDDEN]: 'Operação não permitida',
  [AppErrorCode.RESOURCE_NOT_FOUND]: 'Recurso não encontrado',
  [AppErrorCode.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor',
  [AppErrorCode.INVALID_WEBHOOK_TOKEN]: 'Token do webhook inválido',
  [AppErrorCode.INVALID_WEBHOOK_PAYLOAD]: 'Payload do webhook inválido',
  [AppErrorCode.MISSING_EXTERNAL_REFERENCE]: 'Referência externa não informada',
  [AppErrorCode.STORE_ORDER_NOT_FOUND]: 'Pedido da loja não encontrado',
  [AppErrorCode.STORE_ORDER_INVALID_STATUS]: 'Status do pedido da loja inválido para esta operação',
  [AppErrorCode.CONTRACT_NOT_FOUND]: 'Contrato não encontrado',
}
