import type { HttpContext } from '@adonisjs/core/http'
import GameCharacter from '#models/game_character'

export default class ShowAlunoJogoPageController {
  async handle({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const student = await user.related('student').query().first()

    if (!student) {
      return inertia.render('aluno/jogo/create-character', {
        studentName: user.name,
      })
    }

    const character = await GameCharacter.query()
      .where('student_id', student.id)
      .preload('equippedWeapon')
      .preload('equippedArmor')
      .preload('equippedAccessory')
      .first()

    if (!character) {
      return inertia.render('aluno/jogo/create-character', {
        studentName: user.name,
      })
    }

    return inertia.render('aluno/jogo/tavern', {
      character: character.serialize(),
    })
  }
}
