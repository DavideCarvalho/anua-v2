import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerGameApiRoutes() {
  router
    .group(() => {
      router.post('/characters', [controllers.api.game.CreateGameCharacter]).as('create_character')
    })
    .prefix('/game')
    .use([middleware.auth(), middleware.impersonation()])
    .as('game')
}
