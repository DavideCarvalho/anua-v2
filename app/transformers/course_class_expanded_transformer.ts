import { BaseTransformer } from '@adonisjs/core/transformers'

type CourseClassExpanded = {
  id: string
  name: string
  slug: string
  studentCount: number
  teachers: {
    id: string
    name: string
    email: string | null
    subject: {
      id: string
      name: string
    }
  }[]
  lastActivity: {
    type: 'ASSIGNMENT'
    timestamp: Date
    description: string
  } | null
  averageAttendance: number | null
}

export default class CourseClassExpandedTransformer extends BaseTransformer<CourseClassExpanded> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      slug: this.resource.slug,
      studentCount: this.resource.studentCount,
      teachers: this.resource.teachers,
      lastActivity: this.resource.lastActivity,
      averageAttendance: this.resource.averageAttendance,
    }
  }
}
