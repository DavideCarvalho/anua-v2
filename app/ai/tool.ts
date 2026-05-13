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
