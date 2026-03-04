import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import StoreItem from '#models/store_item'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import StudentAvatar from '#models/student_avatar'
import StudentGamification from '#models/student_gamification'
import AppException from '#exceptions/app_exception'

const AVATAR_CATEGORIES = ['AVATAR_HAIR', 'AVATAR_OUTFIT', 'AVATAR_ACCESSORY'] as const
const GAMIFIED_AGE_THRESHOLD = 14

function calculateAge(birthDate: DateTime | null): number | null {
  if (!birthDate || !birthDate.isValid) return null
  const now = DateTime.now()
  return Math.floor(now.diff(birthDate, 'years').years)
}

async function getStudentSchoolIds(studentId: string): Promise<string[]> {
  const schoolIds = new Set<string>()

  const enrollments = await StudentHasLevel.query()
    .where('studentId', studentId)
    .whereNull('deletedAt')
    .preload('level', (q) => q.preload('school'))

  for (const enrollment of enrollments) {
    if (enrollment.level?.school?.id) {
      schoolIds.add(enrollment.level.school.id)
    } else if (enrollment.level?.schoolId) {
      schoolIds.add(enrollment.level.schoolId)
    }
  }

  const student = await Student.query().where('id', studentId).preload('user').first()
  if (student?.user?.schoolId) {
    schoolIds.add(student.user.schoolId)
  }

  return Array.from(schoolIds)
}

export default class ShowAlunoLojaPontosPageController {
  async handle({ inertia, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    await user.load('role')
    if (user.role?.name !== 'STUDENT') {
      throw AppException.forbidden('Acesso restrito a alunos')
    }

    const student = await Student.query().where('id', user.id).preload('user').first()

    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    const birthDate =
      student.user?.birthDate instanceof DateTime
        ? student.user.birthDate
        : student.user?.birthDate
          ? DateTime.fromISO(String(student.user.birthDate))
          : null
    const age = calculateAge(birthDate)
    const gamified = age !== null && age <= GAMIFIED_AGE_THRESHOLD

    const schoolIds = await getStudentSchoolIds(student.id)
    const now = DateTime.now()

    const items = await StoreItem.query()
      .whereIn('schoolId', schoolIds)
      .where('paymentMode', 'POINTS_ONLY')
      .whereIn('category', [...AVATAR_CATEGORIES])
      .whereNull('deletedAt')
      .where('isActive', true)
      .where((q) => {
        q.whereNull('availableFrom').orWhere('availableFrom', '<=', now.toSQL()!)
      })
      .where((q) => {
        q.whereNull('availableUntil').orWhere('availableUntil', '>=', now.toSQL()!)
      })
      .orderBy('category')
      .orderBy('name')
      .limit(50)

    let avatar = await StudentAvatar.query().where('studentId', student.id).first()
    if (!avatar) {
      avatar = await StudentAvatar.create({
        studentId: student.id,
        skinTone: 'medium',
        hairStyle: 'default',
        hairColor: 'brown',
        outfit: 'default',
        accessories: [],
      })
    }

    const gamification = await StudentGamification.query().where('studentId', student.id).first()

    const points = gamification?.totalPoints ?? 0

    const itemsByCategory = {
      AVATAR_HAIR: items.filter((i) => i.category === 'AVATAR_HAIR'),
      AVATAR_OUTFIT: items.filter((i) => i.category === 'AVATAR_OUTFIT'),
      AVATAR_ACCESSORY: items.filter((i) => i.category === 'AVATAR_ACCESSORY'),
    }

    return inertia.render('aluno/loja/pontos', {
      gamified,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        price: i.price,
        category: i.category,
        imageUrl: i.imageUrl,
        metadata: i.metadata,
      })),
      itemsByCategory: {
        AVATAR_HAIR: itemsByCategory.AVATAR_HAIR.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: i.price,
          imageUrl: i.imageUrl,
          metadata: i.metadata,
        })),
        AVATAR_OUTFIT: itemsByCategory.AVATAR_OUTFIT.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: i.price,
          imageUrl: i.imageUrl,
          metadata: i.metadata,
        })),
        AVATAR_ACCESSORY: itemsByCategory.AVATAR_ACCESSORY.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: i.price,
          imageUrl: i.imageUrl,
          metadata: i.metadata,
        })),
      },
      avatar: {
        id: avatar.id,
        skinTone: avatar.skinTone,
        hairStyle: avatar.hairStyle,
        hairColor: avatar.hairColor,
        outfit: avatar.outfit,
        accessories: avatar.accessories,
      },
      points,
    })
  }
}
