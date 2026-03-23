import User from '#models/user'
import Role from '#models/role'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'

export async function createTestRoles() {
  const rolesToCreate = [
    'SUPER_ADMIN',
    'ADMIN',
    'SCHOOL_ADMIN',
    'SCHOOL_DIRECTOR',
    'SCHOOL_ADMINISTRATIVE',
    'SCHOOL_TEACHER',
    'SCHOOL_COORDINATOR',
    'SCHOOL_CHAIN_DIRECTOR',
    'STUDENT',
    'STUDENT_RESPONSIBLE',
  ]
  for (const roleName of rolesToCreate) {
    await Role.firstOrCreate({ name: roleName }, { name: roleName })
  }
}

export async function createEscolaAuthUser() {
  await createTestRoles()

  const directorRole = await Role.findByOrFail({ name: 'SCHOOL_DIRECTOR' })

  const school = await School.create({
    name: 'Test School',
    slug: `test-school-${Date.now()}`,
  })
  const user = await User.create({
    name: 'Director User',
    slug: `director-${Date.now()}`,
    email: `director-${Date.now()}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: directorRole.id,
  })
  await UserHasSchool.create({
    userId: user.id,
    schoolId: school.id,
    isDefault: true,
  })
  return { user, school, role: directorRole }
}

export async function createEscolaAuthUserByRole(roleName: string) {
  await createTestRoles()

  const role = await Role.findByOrFail({ name: roleName })

  const school = await School.create({
    name: 'Test School',
    slug: `test-school-${Date.now()}`,
  })

  const user = await User.create({
    name: `${roleName} User`,
    slug: `${roleName.toLowerCase()}-${Date.now()}`,
    email: `${roleName.toLowerCase()}-${Date.now()}@example.com`,
    active: true,
    whatsappContact: false,
    grossSalary: 0,
    roleId: role.id,
  })

  await UserHasSchool.create({
    userId: user.id,
    schoolId: school.id,
    isDefault: true,
  })

  return { user, school, role }
}
