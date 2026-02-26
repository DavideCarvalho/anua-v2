export default class CourseClassExpandedDto {
  declare id: string
  declare name: string
  declare slug: string
  declare studentCount: number
  declare teachers: {
    id: string
    name: string
    email: string | null
    subject: {
      id: string
      name: string
    }
  }[]
  declare lastActivity: {
    type: 'ASSIGNMENT'
    timestamp: Date
    description: string
  } | null
  declare averageAttendance: number | null

  constructor(data: CourseClassExpandedDto) {
    this.id = data.id
    this.name = data.name
    this.slug = data.slug
    this.studentCount = data.studentCount
    this.teachers = data.teachers
    this.lastActivity = data.lastActivity
    this.averageAttendance = data.averageAttendance
  }

  static fromArray(data: CourseClassExpandedDto[]): CourseClassExpandedDto[] {
    return data
  }
}
