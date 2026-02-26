export default class TeacherTimesheetRowDto {
  declare id: string
  declare user: {
    name: string | undefined
  }
  declare totalClasses: number
  declare totalAbsences: number
  declare excusedAbsences: number
  declare unexcusedAbsences: number
  declare approvedUnexcusedAbsences: number
  declare classValue: number
  declare baseSalary: number
  declare benefits: {
    total: number
    deductions: number
  }
  declare finalSalary: number
  declare month: number
  declare year: number

  constructor(data: TeacherTimesheetRowDto) {
    this.id = data.id
    this.user = data.user
    this.totalClasses = data.totalClasses
    this.totalAbsences = data.totalAbsences
    this.excusedAbsences = data.excusedAbsences
    this.unexcusedAbsences = data.unexcusedAbsences
    this.approvedUnexcusedAbsences = data.approvedUnexcusedAbsences
    this.classValue = data.classValue
    this.baseSalary = data.baseSalary
    this.benefits = data.benefits
    this.finalSalary = data.finalSalary
    this.month = data.month
    this.year = data.year
  }

  static fromArray(data: TeacherTimesheetRowDto[]): TeacherTimesheetRowDto[] {
    return data
  }
}
