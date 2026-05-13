type ToolFactory = (ctx: { schoolId: string; userId: string }) => Record<string, any>

class ToolRegistry {
  private personaFactories = new Map<string, ToolFactory[]>()

  register(personaId: string, factory: ToolFactory) {
    const existing = this.personaFactories.get(personaId) ?? []
    existing.push(factory)
    this.personaFactories.set(personaId, existing)
  }

  forPersona(personaId: string, ctx: { schoolId: string; userId: string }): Record<string, any> {
    const factories = this.personaFactories.get(personaId) ?? []
    const tools: Record<string, any> = {}
    for (const factory of factories) {
      Object.assign(tools, factory(ctx))
    }
    return tools
  }
}

export const toolRegistry = new ToolRegistry()
