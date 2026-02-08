import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Posts
const ListPostsController = () => import('#controllers/posts/list_posts_controller')
const ShowPostController = () => import('#controllers/posts/show_post_controller')
const CreatePostController = () => import('#controllers/posts/create_post_controller')
const UpdatePostController = () => import('#controllers/posts/update_post_controller')
const DeletePostController = () => import('#controllers/posts/delete_post_controller')
const LikePostController = () => import('#controllers/posts/like_post_controller')
const UnlikePostController = () => import('#controllers/posts/unlike_post_controller')

// Comments
const ListPostCommentsController = () =>
  import('#controllers/comments/list_post_comments_controller')
const CreateCommentController = () => import('#controllers/comments/create_comment_controller')
const UpdateCommentController = () => import('#controllers/comments/update_comment_controller')
const DeleteCommentController = () => import('#controllers/comments/delete_comment_controller')
const LikeCommentController = () => import('#controllers/comments/like_comment_controller')

export function registerPostApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListPostsController]).as('posts.index')
      router.post('/', [CreatePostController]).as('posts.store')
      router.get('/:id', [ShowPostController]).as('posts.show')
      router.put('/:id', [UpdatePostController]).as('posts.update')
      router.delete('/:id', [DeletePostController]).as('posts.destroy')
      router.post('/:id/like', [LikePostController]).as('posts.like')
      router.post('/:id/unlike', [UnlikePostController]).as('posts.unlike')

      // Comments
      router.get('/:postId/comments', [ListPostCommentsController]).as('posts.comments.index')
      router.post('/:postId/comments', [CreateCommentController]).as('posts.comments.store')
    })
    .prefix('/posts')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerCommentApiRoutes() {
  router
    .group(() => {
      router.put('/:id', [UpdateCommentController]).as('comments.update')
      router.delete('/:id', [DeleteCommentController]).as('comments.destroy')
      router.post('/:id/like', [LikeCommentController]).as('comments.like')
    })
    .prefix('/comments')
    .use([middleware.auth(), middleware.impersonation()])
}
