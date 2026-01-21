import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'

import { PostsFeed, PostsFeedSkeleton } from '../../containers/posts/posts-feed'
import { NewPostModal } from '../../containers/posts/new-post-modal'

interface PageProps {
  schoolId: string
  currentUserId?: string
  [key: string]: any
}

export default function MuralPage() {
  const { schoolId, currentUserId } = usePage<PageProps>().props
  const [newModalOpen, setNewModalOpen] = useState(false)

  return (
    <EscolaLayout>
      <Head title="Mural" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mural</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe as publicacoes e anuncios da escola
            </p>
          </div>
          <Button onClick={() => setNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova publicacao
          </Button>
        </div>

        <Suspense fallback={<PostsFeedSkeleton />}>
          <PostsFeed schoolId={schoolId} currentUserId={currentUserId} />
        </Suspense>

        <NewPostModal
          schoolId={schoolId}
          open={newModalOpen}
          onOpenChange={setNewModalOpen}
        />
      </div>
    </EscolaLayout>
  )
}
