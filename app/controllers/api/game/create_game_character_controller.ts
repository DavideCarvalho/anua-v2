import { DateTime } from 'luxon'
import { HttpContext } from '@adonisjs/core/http'
import GameCharacter from '#models/game_character'
import { CLASS_STATS, type GameClass } from '#models/game_character'
import vine from '@vinejs/vine'

const createGameCharacterValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
    class: vine.enum(['mage', 'warrior', 'barbarian']),
  })
)

export default class CreateGameCharacterController {
  async handle({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const student = await user.related('student').query().first()

    if (!student) {
      return response.forbidden({ message: 'Student not found' })
    }

    const existing = await GameCharacter.query().where('student_id', student.id).first()

    if (existing) {
      return response.conflict({ message: 'Character already exists' })
    }

    const payload = await request.validateUsing(createGameCharacterValidator)
    const stats = CLASS_STATS[payload.class as GameClass]

    const character = await GameCharacter.create({
      studentId: student.id,
      name: payload.name,
      class: payload.class as GameClass,
      attack: stats.attack,
      defense: stats.defense,
      maxHp: stats.hp,
      maxMana: stats.mana,
      energy: 100,
      maxEnergy: 100,
    })

    await character.related('idleState').create({
      currentMonsterWave: 1,
      offlineGoldEarned: 0,
      lastSyncAt: DateTime.now(),
    })

    return response.redirect('/aluno/jogo')
  }
}
