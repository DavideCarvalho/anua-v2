import { tool as aiTool } from 'ai'
import { type z } from 'zod'

export type ToolConfig = {
  name: string
  description: string
  parameters: z.ZodObject<any>
  execute: (args: any, ctx: Record<string, any>) => Promise<any>
}

export function defineTool(config: ToolConfig) {
  return {
    [config.name]: aiTool({
      description: config.description,
      inputSchema: config.parameters,
      execute: async (args, options) => config.execute(args, options as Record<string, any>),
    }),
  }
}

export type ActionToolConfig = {
  name: string
  description: string
  parameters: z.ZodObject<any>
}

/**
 * Action tool: NÃO tem execute. O modelo emite o input e o stream termina
 * sem resultado — record_tool_calls grava o row como pending_approval e a
 * audit page expõe Approve/Reject. O dispatch real da ação roda só após
 * decisão humana, no controller de approve.
 */
export function defineActionTool(config: ActionToolConfig) {
  return {
    [config.name]: aiTool({
      description: `${config.description}\n\nEsta ferramenta REQUER APROVAÇÃO. O usuário precisa confirmar antes de executar.`,
      inputSchema: config.parameters,
      // sem execute — stream halta em input-available, frontend mostra
      // aprovar/rejeitar.
    }),
  }
}
