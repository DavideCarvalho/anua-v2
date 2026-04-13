import { useMemo } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api'

type ClassesNavData = Record<
  string,
  {
    period: { id: string; name: string; slug: string; isActive: boolean }
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
  }
>

export function DashboardClassesNav() {
  const {
    data: classesData,
    isLoading,
    isError,
  } = useQuery(api.api.v1.classes.sidebar.queryOptions({ query: { isActive: true } }))

  const links = useMemo(() => {
    if (!classesData?.data) return []
    const grouped: ClassesNavData = classesData.data.reduce<ClassesNavData>((acc, item) => {
      const periodSlug = item.academicPeriod.slug
      const courseSlug = item.course.slug
      if (!acc[periodSlug]) {
        acc[periodSlug] = { period: item.academicPeriod, courses: {} }
      }
      if (!acc[periodSlug].courses[courseSlug]) {
        acc[periodSlug].courses[courseSlug] = { course: item.course, levels: {} }
      }
      const levelId = item.level.id
      if (!acc[periodSlug].courses[courseSlug].levels[levelId]) {
        acc[periodSlug].courses[courseSlug].levels[levelId] = {
          level: item.level,
          classes: [],
        }
      }
      acc[periodSlug].courses[courseSlug].levels[levelId].classes.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
      })
      return acc
    }, {})

    const result: Array<{ label: string; href: string }> = []
    const periods = Object.values(grouped)
    for (const periodGroup of periods) {
      for (const courseGroup of Object.values(periodGroup.courses)) {
        const sortedLevels = Object.values(courseGroup.levels).sort((a, b) => {
          const orderA = a.level.order ?? Number.MAX_SAFE_INTEGER
          const orderB = b.level.order ?? Number.MAX_SAFE_INTEGER
          if (orderA !== orderB) return orderA - orderB
          return a.level.name.localeCompare(b.level.name)
        })
        for (const group of sortedLevels) {
          for (const turma of group.classes) {
            result.push({
              label: `${group.level.name} - ${turma.name}`,
              href: `/escola/periodos-letivos/${periodGroup.period.slug}/cursos/${courseGroup.course.slug}/turmas/${turma.slug}/atividades`,
            })
          }
        }
      }
    }
    return result
  }, [classesData])

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card px-6 py-5">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError || links.length === 0) return null

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Turmas</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border bg-card px-6 py-5 text-lg font-medium transition-colors hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
