export default class CourseActivityFeedItemDto {
  declare id: string
  declare type: 'ASSIGNMENT' | 'ATTENDANCE'
  declare timestamp: Date
  declare description: string
  declare className: string
  declare subjectName?: string

  constructor(data: CourseActivityFeedItemDto) {
    this.id = data.id
    this.type = data.type
    this.timestamp = data.timestamp
    this.description = data.description
    this.className = data.className
    this.subjectName = data.subjectName
  }

  static fromArray(data: CourseActivityFeedItemDto[]): CourseActivityFeedItemDto[] {
    return data
  }
}
