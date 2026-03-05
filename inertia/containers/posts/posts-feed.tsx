import { useQuery } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'

import { Card, CardContent } from '../../components/ui/card'

import { api } from '~/lib/api'
import type { Route } from '@tuyau/core/types'
import { PostCard } from './post-card'

type PostsResponse = Route.Response<'api.v1.posts.index'>['data']

interface PostsFeedProps {
  schoolId: string
  classId?: string
  currentUserId?: string
}

export function PostsFeed({ schoolId, classId, currentUserId }: PostsFeedProps) {
  const { data, isLoading } = useQuery(
    api.api.v1.posts.index.queryOptions({ query: { schoolId, classId } })
  )

  const posts: PostsResponse = data?.data ?? []

  if (isLoading) {
    return <PostsFeedSkeleton />
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-12 text-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma publicacao</h3>
            <p className="mt-2 text-sm text-muted-foreground">Ainda não há publicações no mural.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  )
}

export function PostsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
