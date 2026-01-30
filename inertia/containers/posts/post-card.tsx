import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart, MessageCircle, MoreHorizontal, Trash, Edit } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'

import { useLikePostMutation } from '../../hooks/mutations/use_like_post'
import { useUnlikePostMutation } from '../../hooks/mutations/use_unlike_post'
import { useDeletePostMutation } from '../../hooks/mutations/use_delete_post'

interface Post {
  id: string
  content: string
  type: string
  visibility: string
  attachmentUrl: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
  $extras: {
    likes_count: number
    comments_count: number
  }
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  onCommentClick?: (postId: string) => void
}

export function PostCard({ post, currentUserId, onCommentClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.$extras?.likes_count ?? 0)

  const likeMutation = useLikePostMutation()
  const unlikeMutation = useUnlikePostMutation()
  const deleteMutation = useDeletePostMutation()

  const isAuthor = currentUserId === post.author.id

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false)
      setLikeCount((c) => c - 1)
      try {
        await unlikeMutation.mutateAsync(post.id)
      } catch {
        setIsLiked(true)
        setLikeCount((c) => c + 1)
        toast.error('Erro ao descurtir')
      }
    } else {
      setIsLiked(true)
      setLikeCount((c) => c + 1)
      try {
        await likeMutation.mutateAsync(post.id)
      } catch {
        setIsLiked(false)
        setLikeCount((c) => c - 1)
        toast.error('Erro ao curtir')
      }
    }
  }

  const handleDelete = () => {
    toast.promise(deleteMutation.mutateAsync(post.id), {
      loading: 'Excluindo post...',
      success: 'Post excluido!',
      error: 'Erro ao excluir post',
    })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT: 'Texto',
      IMAGE: 'Imagem',
      VIDEO: 'Video',
      LINK: 'Link',
      ANNOUNCEMENT: 'Anuncio',
    }
    return labels[type] || type
  }

  const getVisibilityLabel = (visibility: string) => {
    const labels: Record<string, string> = {
      PUBLIC: 'Publico',
      SCHOOL_ONLY: 'Escola',
      CLASS_ONLY: 'Turma',
      PRIVATE: 'Privado',
    }
    return labels[visibility] || visibility
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.avatarUrl || undefined} />
            <AvatarFallback>
              {post.author.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              <span>•</span>
              <span>{getVisibilityLabel(post.visibility)}</span>
              {post.type === 'ANNOUNCEMENT' && (
                <>
                  <span>•</span>
                  <span className="font-medium text-primary">{getTypeLabel(post.type)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="pb-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.attachmentUrl && (
          <div className="mt-3">
            <img
              src={post.attachmentUrl}
              alt="Anexo do post"
              className="max-h-96 rounded-lg object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2', isLiked && 'text-red-500')}
            onClick={handleLike}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
          >
            <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onCommentClick?.(post.id)}
          >
            <MessageCircle className="h-4 w-4" />
            {(post.$extras?.comments_count ?? 0) > 0 && (
              <span>{post.$extras.comments_count}</span>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
