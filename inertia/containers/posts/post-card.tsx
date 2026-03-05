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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { Route } from '@tuyau/core/types'

type Post = Route.Response<'api.v1.posts.index'>['data'][number]

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

interface PostCardProps {
  post: Post
  currentUserId?: string
  onCommentClick?: (postId: string) => void
}

export function PostCard({ post, currentUserId, onCommentClick }: PostCardProps) {
  const postRecord = asRecord(post)
  const authorRecord = asRecord(postRecord.author ?? postRecord.user)
  const extras = asRecord(postRecord.$extras)

  const postId = String(post.id)
  const authorId = String(authorRecord.id ?? post.userId ?? '')
  const authorName = typeof authorRecord.name === 'string' ? authorRecord.name : 'Usuario'
  const authorAvatarUrl = typeof authorRecord.avatarUrl === 'string' ? authorRecord.avatarUrl : null
  const postType = typeof postRecord.type === 'string' ? postRecord.type : 'TEXT'
  const visibility =
    typeof postRecord.visibility === 'string' ? postRecord.visibility : 'SCHOOL_ONLY'
  const attachmentUrl =
    typeof postRecord.attachmentUrl === 'string' ? postRecord.attachmentUrl : null
  const createdAt = post.createdAt ? String(post.createdAt) : new Date().toISOString()
  const commentsCount = typeof extras.comments_count === 'number' ? extras.comments_count : 0

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(
    typeof extras.likes_count === 'number' ? extras.likes_count : 0
  )

  const queryClient = useQueryClient()
  const likeMutation = useMutation(api.api.v1.posts.like.mutationOptions())
  const unlikeMutation = useMutation(api.api.v1.posts.unlike.mutationOptions())
  const deleteMutation = useMutation(api.api.v1.posts.destroy.mutationOptions())

  const isAuthor = currentUserId === authorId

  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false)
      setLikeCount((c) => c - 1)
      try {
        await unlikeMutation.mutateAsync({ params: { id: postId } })
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      } catch {
        setIsLiked(true)
        setLikeCount((c) => c + 1)
        toast.error('Erro ao descurtir')
      }
    } else {
      setIsLiked(true)
      setLikeCount((c) => c + 1)
      try {
        await likeMutation.mutateAsync({ params: { id: postId } })
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      } catch {
        setIsLiked(false)
        setLikeCount((c) => c - 1)
        toast.error('Erro ao curtir')
      }
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ params: { id: postId } })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post excluido!')
    } catch {
      toast.error('Erro ao excluir post')
    }
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
            <AvatarImage src={authorAvatarUrl || undefined} />
            <AvatarFallback>
              {authorName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{authorName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              <span>•</span>
              <span>{getVisibilityLabel(visibility)}</span>
              {postType === 'ANNOUNCEMENT' && (
                <>
                  <span>•</span>
                  <span className="font-medium text-primary">{getTypeLabel(postType)}</span>
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
        {attachmentUrl && (
          <div className="mt-3">
            <img
              src={attachmentUrl}
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
            onClick={() => onCommentClick?.(postId)}
          >
            <MessageCircle className="h-4 w-4" />
            {commentsCount > 0 && <span>{commentsCount}</span>}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
