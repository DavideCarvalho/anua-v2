import { BaseDto } from '@adocasts.com/dto/base'

interface EmployeeRole {
  id: string
  name: string
}

interface EmployeeData {
  id: string
  name: string
  email: string | null
  active: boolean
  createdAt: string
  role: EmployeeRole
}

export class EmployeeDto extends BaseDto {
  declare id: string
  declare name: string
  declare email: string | null
  declare active: boolean
  declare createdAt: string
  declare role: EmployeeRole

  constructor(employee: EmployeeData) {
    super()
    this.id = employee.id
    this.name = employee.name
    this.email = employee.email
    this.active = employee.active
    this.createdAt = employee.createdAt
    this.role = employee.role
  }
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

export class EmployeeListDto extends BaseDto {
  declare data: EmployeeDto[]
  declare meta: PaginationMeta

  constructor(employees: EmployeeData[], meta: PaginationMeta) {
    super()
    this.data = employees.map((e) => new EmployeeDto(e))
    this.meta = meta
  }
}
