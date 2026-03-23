import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const CreateGameCharacterController = () =>
  import('#controllers/api/game/create_game_character_controller')

export function registerGameApiRoutes() {
  router
    .group(() => {
      router.post('/characters', [CreateGameCharacterController]).as('create_character')
    })
    .prefix('/game')
    .use([middleware.auth(), middleware.impersonation()])
    .as('game')
}
