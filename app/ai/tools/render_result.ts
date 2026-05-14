import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'

const COMPONENT_NAMES = [
  'SchoolStatsCard',
  'StudentAlertsCard',
  'DataTable',
  'InfoCard',
  'Stat',
  'Chart',
] as const

const COMPONENT_GUIDE = `
- SchoolStatsCard: data = { totalStudents, overdueAmountCents }
- StudentAlertsCard: data = { alerts: [{ student, description, priority: 'high' | 'normal' }] }
- DataTable: data = { columns?: string[], rows: Record<string, unknown>[], columnLabels?: Record<string, string> } — Quando os dados vêm crus do queryDatabase, chame formatRows primeiro e use o output ({ rows, columnLabels }) aqui.
- InfoCard: data = { title, description?, value }
- Stat: data = { label, value, delta?: number, deltaLabel?: string, tone?: 'neutral' | 'positive' | 'negative' | 'warning', hint? }
- Chart: data = { type: 'bar' | 'line' | 'pie', data: [{ label, value }], xKey?, yKey?, title?, height? }
`.trim()

export function createRenderResult() {
  return defineTool({
    name: 'renderResult',
    description: `USE THIS TOOL TO RENDER DATA VISUALLY. After gathering data with other tools, call this to display a component with the results. Componentes disponíveis:
${COMPONENT_GUIDE}`,
    parameters: z.object({
      component: z.enum(COMPONENT_NAMES).describe('Component to render'),
      title: z.string().describe('Title for the component'),
      data: z.any().describe('Data to pass to the component, shape depends on component'),
    }),
    execute: async ({ component, title, data }) => {
      return { component, title, data }
    },
  })
}

toolRegistry.register('gestor', createRenderResult)
toolRegistry.register('comunicador', createRenderResult)
toolRegistry.register('coordenador', createRenderResult)
toolRegistry.register('professor', createRenderResult)
toolRegistry.register('responsavel', createRenderResult)
