import { BaseTransformer } from '@adonisjs/core/transformers'

interface EmployeeListRole {
  id: string
  name: string
}

export interface EmployeeListItem {
  id: string
  name: string
  email: string | null
  active: boolean
  createdAt: string
  role: EmployeeListRole
}

export default class EmployeeListItemTransformer extends BaseTransformer<EmployeeListItem> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'email', 'active', 'createdAt', 'role']),
    }
  }
}
