import { BaseTransformer } from '@adonisjs/core/transformers'

type CourseActivityFeedItem = {
  id: string
  type: 'ASSIGNMENT' | 'ATTENDANCE'
  timestamp: Date
  description: string
  className: string
  subjectName?: string
}

export default class CourseActivityFeedItemTransformer extends BaseTransformer<CourseActivityFeedItem> {
  toObject() {
    return {
      id: this.resource.id,
      type: this.resource.type,
      timestamp: this.resource.timestamp,
      description: this.resource.description,
      className: this.resource.className,
      subjectName: this.resource.subjectName,
    }
  }
}
