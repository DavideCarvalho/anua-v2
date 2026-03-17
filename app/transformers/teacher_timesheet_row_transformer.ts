import { BaseTransformer } from '@adonisjs/core/transformers'

export interface TeacherTimesheetRow {
  id: string
  user: {
    name: string | undefined
  }
  totalClasses: number
  totalAbsences: number
  excusedAbsences: number
  unexcusedAbsences: number
  approvedUnexcusedAbsences: number
  classValue: number
  baseSalary: number
  benefits: {
    total: number
    deductions: number
  }
  finalSalary: number
  month: number
  year: number
}

export default class TeacherTimesheetRowTransformer extends BaseTransformer<TeacherTimesheetRow> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'user',
        'totalClasses',
        'totalAbsences',
        'excusedAbsences',
        'unexcusedAbsences',
        'approvedUnexcusedAbsences',
        'classValue',
        'baseSalary',
        'benefits',
        'finalSalary',
        'month',
        'year',
      ]),
    }
  }
}
