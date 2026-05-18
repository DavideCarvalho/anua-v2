import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerPostApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.posts.ListPosts]).as('posts.index')
      router.post('/', [controllers.posts.CreatePost]).as('posts.store')
      router.get('/:id', [controllers.posts.ShowPost]).as('posts.show')
      router.put('/:id', [controllers.posts.UpdatePost]).as('posts.update')
      router.delete('/:id', [controllers.posts.DeletePost]).as('posts.destroy')
      router.post('/:id/like', [controllers.posts.LikePost]).as('posts.like')
      router.post('/:id/unlike', [controllers.posts.UnlikePost]).as('posts.unlike')

      // Comments
      router
        .get('/:postId/comments', [controllers.comments.ListPostComments])
        .as('posts.comments.index')
      router
        .post('/:postId/comments', [controllers.comments.CreateComment])
        .as('posts.comments.store')
    })
    .prefix('/posts')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCommentApiRoutes() {
  router
    .group(() => {
      router.put('/:id', [controllers.comments.UpdateComment]).as('comments.update')
      router.delete('/:id', [controllers.comments.DeleteComment]).as('comments.destroy')
      router.post('/:id/like', [controllers.comments.LikeComment]).as('comments.like')
    })
    .prefix('/comments')
    .use([middleware.auth(), middleware.impersonation()])
}
