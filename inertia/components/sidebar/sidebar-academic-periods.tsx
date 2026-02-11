import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronDown, GraduationCap, Eye, Users } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useSidebarClasses } from '../../hooks/queries/use_sidebar_classes'
import type { SharedProps } from '../../lib/types'

interface SidebarCourseProps {
  periodSlug: string
  course: {
    id: string
    name: string
    slug: string
  }
  levels: Record<
    string,
    {
      level: { id: string; name: string; slug: string; order: number | null }
      classes: Array<{ id: string; name: string; slug: string }>
    }
  >
  pathname: string
}

function SidebarCourse({ periodSlug, course, levels, pathname }: SidebarCourseProps) {
  const [isOpen, setIsOpen] = useState(true)
  const baseUrl = `/escola/periodos-letivos/${periodSlug}/cursos/${course.slug}`
  const isActive = pathname.startsWith(baseUrl)

  const sortedLevelGroups = Object.values(levels).sort((a, b) => {
    const orderA = a.level.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.level.order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return a.level.name.localeCompare(b.level.name)
  })

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span className="truncate">{course.name}</span>
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-2">
          <Link
            href={`${baseUrl}/visao-geral`}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              pathname === `${baseUrl}/visao-geral`
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Visão Geral
          </Link>
          <Link
            href={`${baseUrl}/turmas`}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              pathname === `${baseUrl}/turmas`
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Turmas
          </Link>
          {sortedLevelGroups.length > 0 && (
            <>
              <div className="my-1 border-t" />
              {sortedLevelGroups.map((group) => (
                <div key={group.level.id} className="space-y-0.5">
                  <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                    {group.level.name}
                  </div>
                  {group.classes.map((turma) => {
                    const turmaPath = `${baseUrl}/turmas/${turma.slug}`
                    const isTurmaActive = pathname.startsWith(`${turmaPath}/`)

                    return (
                      <Link
                        key={turma.id}
                        href={`${turmaPath}/atividades`}
                        className={cn(
                          'block rounded-lg px-3 py-1.5 text-sm transition-colors truncate',
                          isTurmaActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {group.level.name} - {turma.name}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface SidebarPeriodProps {
  period: {
    id: string
    name: string
    slug: string
  }
  courses: Record<
    string,
    {
      course: { id: string; name: string; slug: string }
      levels: Record<
        string,
        {
          level: { id: string; name: string; slug: string; order: number | null }
          classes: Array<{ id: string; name: string; slug: string }>
        }
      >
    }
  >
  pathname: string
}

function SidebarPeriod({ period, courses, pathname }: SidebarPeriodProps) {
  const [isOpen, setIsOpen] = useState(true)
  const isActive = pathname.includes(`/periodos-letivos/${period.slug}`)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
          isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )}
      >
        <span className="truncate">{period.name}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1">
          {Object.values(courses).map((courseGroup) => (
            <SidebarCourse
              key={courseGroup.course.id}
              periodSlug={period.slug}
              course={courseGroup.course}
              levels={courseGroup.levels}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SidebarAcademicPeriods() {
  const { url } = usePage<SharedProps>()
  const pathname = url.split('?')[0]
  const { groupedData, isLoading, isError } = useSidebarClasses()

  if (isLoading) {
    return (
      <div className="px-3 py-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (isError) {
    return null
  }

  const periods = Object.values(groupedData)

  if (periods.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Períodos Letivos
        </span>
      </div>
      {periods.map((periodGroup) => (
        <SidebarPeriod
          key={periodGroup.period.id}
          period={periodGroup.period}
          courses={periodGroup.courses}
          pathname={pathname}
        />
      ))}
    </div>
  )
}
