export type StudentStatusType =
  | 'APPROVED'
  | 'FAILED'
  | 'AT_RISK_GRADE'
  | 'AT_RISK_ATTENDANCE'
  | 'IN_PROGRESS'

export default class StudentStatusResultDto {
  declare id: string
  declare name: string
  declare status: StudentStatusType
  declare failureReason: 'GRADE' | 'ATTENDANCE' | 'BOTH' | null
  declare finalGrade: number
  declare maxPossibleGrade: number
  declare attendancePercentage: number
  declare pointsUntilPass: number | null
  declare classesUntilFail: number | null
  declare missedAssignments: {
    type?: 'ASSIGNMENT' | 'EXAM'
    id: string
    name: string
    dueDate: string
  }[]

  constructor(data: StudentStatusResultDto) {
    this.id = data.id
    this.name = data.name
    this.status = data.status
    this.failureReason = data.failureReason
    this.finalGrade = data.finalGrade
    this.maxPossibleGrade = data.maxPossibleGrade
    this.attendancePercentage = data.attendancePercentage
    this.pointsUntilPass = data.pointsUntilPass
    this.classesUntilFail = data.classesUntilFail
    this.missedAssignments = data.missedAssignments
  }

  static fromArray(data: StudentStatusResultDto[]): StudentStatusResultDto[] {
    return data
  }
}
