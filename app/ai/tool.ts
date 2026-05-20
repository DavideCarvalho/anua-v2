import { tool as aiTool } from 'ai'
import { type z } from 'zod'
import logger from '@adonisjs/core/services/logger'

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
      // Wrapping execute em try/catch — quando a tool lança uma exception
      // não tratada, o Vercel AI SDK não inclui o call em step.toolResults,
      // o recordToolCalls grava status='failed' com error/output null, e o
      // dev fica sem rastro do que aconteceu (foi como o bug de
      // "ExamGrade" não existe ficou invisível por dias). Convertendo
      // pra { error: ... } resolve três coisas de uma vez:
      //   1. SDK pareia o result com o call → audit grava error preenchido.
      //   2. Modelo recebe a mensagem do erro → pode adaptar a próxima
      //      escolha de tool em vez de tentar a mesma coisa em loop.
      //   3. Log estruturado com toolName + args fica no logger.error,
      //      navegável por request_id.
      execute: async (args, options) => {
        try {
          return await config.execute(args, options as Record<string, any>)
        } catch (err) {
          logger.error(
            { err, event: 'ai_tool_execute_failed', toolName: config.name, args },
            `AI tool ${config.name} threw`
          )
          const message = err instanceof Error ? err.message : String(err)
          return { error: `Tool execution failed: ${message}` }
        }
      },
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
