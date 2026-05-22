import type { ComponentProps } from 'react'
import type { Link } from '@adonisjs/inertia/react'

import type { PedagogicalAlertKey } from '../pedagogical-alert-sheet'

export type Severity = 'critical' | 'warn' | 'info'
export type Category = 'pedagogical' | 'financial' | 'enrollment'

type LinkRouteProp = ComponentProps<typeof Link>['route']

export interface AttentionItem {
  id: string
  severity: Severity
  category: Category
  title: string
  subtitle?: string
  count: number
  // route + destinationLabel são opcionais: itens com pedagogicalAlertKey
  // abrem a sheet inline pelo attention-drawer, sem precisar navegar.
  route?: LinkRouteProp
  destinationLabel?: string
  action: string
  // Present when the item maps to a row in the pedagogical-alerts payload —
  // the drawer can then show the rich student/exam/activity table.
  pedagogicalAlertKey?: PedagogicalAlertKey
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warn: 1,
  info: 2,
}

export const CATEGORY_LABEL: Record<Category, string> = {
  pedagogical: 'Pedagógico',
  financial: 'Financeiro',
  enrollment: 'Matrículas',
}
