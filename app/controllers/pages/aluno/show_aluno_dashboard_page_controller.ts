import type { HttpContext } from '@adonisjs/core/http'
import Student from '#models/student'
import StudentAvatar from '#models/student_avatar'
import StudentGamification from '#models/student_gamification'
import StudentAchievement from '#models/student_achievement'
import AppException from '#exceptions/app_exception'

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

    return inertia.render('aluno/dashboard', {
      student: {
        id: student.id,
        name: student.user?.name ?? 'Aluno',
      },
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
