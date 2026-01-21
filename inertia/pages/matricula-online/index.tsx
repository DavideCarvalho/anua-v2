import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { GraduationCap } from 'lucide-react'

import {
  EnrollmentForm,
  EnrollmentFormSkeleton,
} from '../../containers/online-enrollment/enrollment-form'

interface PageProps {
  schoolSlug: string
  academicPeriodSlug: string
  courseSlug: string
  [key: string]: any
}

export default function MatriculaOnlinePage() {
  const { schoolSlug, academicPeriodSlug, courseSlug } = usePage<PageProps>().props

  return (
    <>
      <Head title="Matrícula Online" />

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Matrícula Online</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Suspense fallback={<EnrollmentFormSkeleton />}>
            <EnrollmentForm
              schoolSlug={schoolSlug}
              academicPeriodSlug={academicPeriodSlug}
              courseSlug={courseSlug}
            />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Anua - Sistema de Gestão Escolar</p>
          </div>
        </footer>
      </div>
    </>
  )
}
