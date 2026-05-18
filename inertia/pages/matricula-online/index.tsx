import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'

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

      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
          <Suspense fallback={<EnrollmentFormSkeleton />}>
            <EnrollmentForm
              schoolSlug={schoolSlug}
              academicPeriodSlug={academicPeriodSlug}
              courseSlug={courseSlug}
            />
          </Suspense>
        </main>

        <footer className="border-t border-border py-6">
          <div className="container mx-auto px-4 max-w-3xl text-xs text-muted-foreground space-y-1">
            <p>
              Os dados informados aqui são tratados conforme a{' '}
              <a
                href="https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:underline hover:text-foreground"
              >
                LGPD
              </a>{' '}
              e usados apenas para fins de matrícula e gestão escolar.
            </p>
            <p>Anua · Sistema de Gestão Escolar</p>
          </div>
        </footer>
      </div>
    </>
  )
}
