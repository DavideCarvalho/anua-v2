import type { ToolSet } from 'ai'
import type { ChatScope } from './chat_scope.js'

/**
 * Contexto injetado em toda tool. role/scope vêm derivados do user no
 * chat_controller. Tools que leem dados DEVEM filtrar pelo scope — confiar
 * no modelo pra lembrar de filtrar é receita pra vazamento horizontal.
 */
export type ToolContext = {
  schoolId: string
  userId: string
  scope: ChatScope
}

type ToolFactory = (ctx: ToolContext) => ToolSet

class ToolRegistry {
  private personaFactories = new Map<string, ToolFactory[]>()

  register(personaId: string, factory: ToolFactory) {
    const existing = this.personaFactories.get(personaId) ?? []
    existing.push(factory)
    this.personaFactories.set(personaId, existing)
  }

  forPersona(personaId: string, ctx: ToolContext): ToolSet {
    const factories = this.personaFactories.get(personaId) ?? []
    const tools: ToolSet = {}
    for (const factory of factories) {
      Object.assign(tools, factory(ctx))
    }
    return tools
  }
}

export const toolRegistry = new ToolRegistry()
