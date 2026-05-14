import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'

const COMPONENT_NAMES = ['SchoolStatsCard', 'StudentAlertsCard', 'DataTable', 'InfoCard'] as const

export function createRenderResult() {
  return defineTool({
    name: 'renderResult',
    description:
      'USE THIS TOOL TO RENDER DATA VISUALLY. After gathering data with other tools, call this to display a component with the results.',
    parameters: z.object({
      component: z.enum(COMPONENT_NAMES).describe('Component to render'),
      title: z.string().describe('Title for the component'),
      data: z.any().describe('Data to pass to the component'),
    }),
    execute: async ({ component, title, data }) => {
      return { component, title, data }
    },
  })
}

toolRegistry.register('gestor', createRenderResult)
toolRegistry.register('comunicador', createRenderResult)
