import { BaseTransformer } from '@adonisjs/core/transformers'

interface TeacherListUser {
  id: string
  name: string
  email: string | null
  active: boolean
}

interface TeacherListSubject {
  id: string
  name: string
}

export interface TeacherListItem {
  id: string
  hourlyRate: number | null
  user: TeacherListUser
  subjects: TeacherListSubject[]
}

export default class TeacherListItemTransformer extends BaseTransformer<TeacherListItem> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'hourlyRate', 'user', 'subjects']),
    }
  }
}
