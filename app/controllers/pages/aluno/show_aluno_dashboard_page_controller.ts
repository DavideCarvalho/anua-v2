import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Student from '#models/student'
import StudentAvatar from '#models/student_avatar'
import StudentGamification from '#models/student_gamification'
import StudentAchievement from '#models/student_achievement'
import Calendar from '#models/calendar'
import CalendarSlot from '#models/calendar_slot'
import AppException from '#exceptions/app_exception'

type TodayClass = {
  id: string
  startTime: string
  endTime: string
  subject: string | null
  teacherName: string | null
}

async function getTodayClasses(student: Student): Promise<TodayClass[]> {
  if (!student.classId) return []

  // Calendário ativo é a fonte da verdade dos slots — buscamos direto por turma
  // (sem resolver período antes, que pode ser ambíguo com períodos duplicados).
  const calendar = await Calendar.query()
    .where('classId', student.classId)
    .where('isActive', true)
    .where('isCanceled', false)
    .orderBy('createdAt', 'desc')
    .first()
  if (!calendar) return []

  // CalendarSlot.classWeekDay usa convenção JS (0=domingo). Luxon weekday é 1=segunda..7=domingo.
  const weekday = DateTime.now().weekday % 7

  const slots = await CalendarSlot.query()
    .where('calendarId', calendar.id)
    .where('classWeekDay', weekday)
    .where('isBreak', false)
    .preload('teacherHasClass', (query) => {
      query.preload('teacher', (tq) => tq.preload('user'))
      query.preload('subject')
    })
    .orderBy('startTime')

  return slots
    .filter((slot) => slot.teacherHasClass)
    .map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.teacherHasClass?.subject?.name ?? null,
      teacherName: slot.teacherHasClass?.teacher?.user?.name ?? null,
    }))
}

export default class ShowAlunoDashboardPageController {
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

    const todayClasses = await getTodayClasses(student)

    const birthDate = user.birthDate
    const isKids = birthDate ? Math.floor(Math.abs(birthDate.diffNow('years').years)) <= 14 : true

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

    const recentAchievements = gamification
      ? await StudentAchievement.query()
          .where('studentGamificationId', gamification.id)
          .whereHas('achievement', (q) => q.whereNull('deletedAt'))
          .preload('achievement')
          .orderBy('unlockedAt', 'desc')
          .limit(3)
      : []

    const points = gamification?.totalPoints ?? 0
    const currentLevel = gamification?.currentLevel ?? 1
    const levelProgress = gamification?.levelProgress ?? 0
    const streak = gamification?.streak ?? 0

    return inertia.render((isKids ? 'aluno/kids_dashboard' : 'aluno/dashboard') as any, {
      isKids,
      student: {
        id: student.id,
        name: student.user?.name ?? 'Aluno',
      },
      todayClasses,
      avatar: {
        id: avatar.id,
        skinTone: avatar.skinTone,
        hairStyle: avatar.hairStyle,
        hairColor: avatar.hairColor,
        outfit: avatar.outfit,
        accessories: avatar.accessories,
      },
      gamification: {
        totalPoints: points,
        currentLevel,
        levelProgress,
        streak,
      },
      recentAchievements: recentAchievements.map((sa) => ({
        id: sa.achievement.id,
        name: sa.achievement.name,
        description: sa.achievement.description,
        icon: sa.achievement.icon,
        rarity: sa.achievement.rarity,
        unlockedAt: sa.unlockedAt.toISO(),
      })),
    })
  }
}
