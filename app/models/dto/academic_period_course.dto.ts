export default class AcademicPeriodCourseDto {
  declare id: string
  declare courseId: string
  declare name: string
  declare levels: {
    id: string
    levelId: string
    name: string
    order: number
    contractId: string | null
    isActive: boolean
    classes: {
      id: string
      name: string
      teachers: {
        id: string
        teacherId: string
        teacherName: string
        subjectId: string
        subjectName: string
        subjectQuantity: number
      }[]
    }[]
  }[]

  constructor(data: AcademicPeriodCourseDto) {
    this.id = data.id
    this.courseId = data.courseId
    this.name = data.name
    this.levels = data.levels
  }

  static fromArray(data: AcademicPeriodCourseDto[]): AcademicPeriodCourseDto[] {
    return data
  }
}
