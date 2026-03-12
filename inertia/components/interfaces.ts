/* eslint-disable @typescript-eslint/naming-convention */

import type { TEventColor } from '~/components/types'

export interface IUser {
  id: string
  name: string
  picturePath: string | null
}

export interface IEvent {
  id: number
  startDate: string
  endDate: string
  title: string
  color: TEventColor
  description: string
  user: IUser
  sourceType?: 'EVENT' | 'ASSIGNMENT' | 'EXAM' | 'HOLIDAY' | 'WEEKEND_CLASS_DAY'
  sourceId?: string | null
  readonly?: boolean
}

export interface ICalendarCell {
  day: number
  currentMonth: boolean
  date: Date
}
