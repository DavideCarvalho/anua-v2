import User from '#models/user'
import Role from '#models/role'
import School from '#models/school'
import UserHasSchool from '#models/user_has_school'

export async function createEscolaAuthUser() {
  const directorRole = await Role.create({ name: 'DIRECTOR' })
  await Role.create({ name: 'STUDENT' })
  await Role.create({ name: 'STUDENT_RESPONSIBLE' })

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
