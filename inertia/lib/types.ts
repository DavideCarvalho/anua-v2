// Shared types for frontend

export interface RoleDto {
  id: string
  name: string
  description: string | null
}

export interface SchoolDto {
  id: string
  name: string
  slug: string
  legalName: string | null
  cnpj: string | null
  email: string | null
  phone: string | null
  logoUrl: string | null
  headerUrl: string | null
  active: boolean
  schoolChainId: string | null
}

export interface UserDto {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  whatsappContact: boolean
  birthDate: string | null
  documentType: string | null
  documentNumber: string | null
  imageUrl: string | null
  active: boolean
  grossSalary: number
  roleId: string | null
  schoolId: string | null
  schoolChainId: string | null
  createdAt: string
  updatedAt: string | null
  role?: RoleDto
  school?: SchoolDto
}

export interface SharedProps {
  [key: string]: unknown
  user: UserDto | null
}

// Role names from the system
export type RoleName =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SCHOOL_DIRECTOR'
  | 'SCHOOL_COORDINATOR'
  | 'SCHOOL_ADMIN'
  | 'SCHOOL_ADMINISTRATIVE'
  | 'SCHOOL_TEACHER'
  | 'SCHOOL_CANTEEN'
  | 'TEACHER'
  | 'STUDENT'
  | 'RESPONSIBLE'
  | 'STUDENT_RESPONSIBLE'

// Helper to check user roles
export function hasRole(user: UserDto | null, roles: RoleName[]): boolean {
  if (!user?.role) return false
  return roles.includes(user.role.name as RoleName)
}

export function isAdmin(user: UserDto | null): boolean {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN'])
}

export function isSchoolUser(user: UserDto | null): boolean {
  return hasRole(user, [
    'SCHOOL_DIRECTOR',
    'SCHOOL_COORDINATOR',
    'SCHOOL_ADMIN',
    'SCHOOL_ADMINISTRATIVE',
    'SCHOOL_TEACHER',
    'SCHOOL_CANTEEN',
  ])
}

export function isResponsible(user: UserDto | null): boolean {
  return hasRole(user, ['RESPONSIBLE', 'STUDENT_RESPONSIBLE'])
}

export function isStudent(user: UserDto | null): boolean {
  return hasRole(user, ['STUDENT'])
}
