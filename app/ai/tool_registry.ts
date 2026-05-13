class ToolRegistry {
  private personaTools = new Map<string, Record<string, any>>()

  register(personaId: string, toolDef: Record<string, any>) {
    const existing = this.personaTools.get(personaId) ?? {}
    this.personaTools.set(personaId, { ...existing, ...toolDef })
  }

  forPersona(personaId: string): Record<string, any> {
    return this.personaTools.get(personaId) ?? {}
  }
}

export const toolRegistry = new ToolRegistry()
