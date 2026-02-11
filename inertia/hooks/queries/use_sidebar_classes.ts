import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

const $route = tuyau.api.v1.classes.sidebar.$get

export type SidebarClassesResponse = InferResponseType<typeof $route>

interface SidebarClassesQuery {
  isActive?: boolean
}

export function useSidebarClassesQueryOptions(query: SidebarClassesQuery = { isActive: true }) {
  return {
    queryKey: ['sidebar-classes', query],
    queryFn: () => $route({ query } as any).unwrap(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }
}

interface CourseInfo {
  id: string
  name: string
  slug: string
}

interface AcademicPeriodInfo {
  id: string
  name: string
  slug: string
  isActive: boolean
}

interface LevelInfo {
  id: string
  name: string
  slug: string
  order: number | null
}

interface ClassInfo {
  id: string
  name: string
  slug: string
}

interface LevelGroup {
  level: LevelInfo
  classes: ClassInfo[]
}

interface CourseGroup {
  course: CourseInfo
  levels: Record<string, LevelGroup>
}

interface PeriodGroup {
  period: AcademicPeriodInfo
  courses: Record<string, CourseGroup>
}

export type SidebarData = Record<string, PeriodGroup>

export function useSidebarClasses(options: SidebarClassesQuery = { isActive: true }) {
  const query = useQuery(useSidebarClassesQueryOptions(options))

  const groupedData = useMemo<SidebarData>(() => {
    if (!query.data?.data) return {}

    return query.data.data.reduce<SidebarData>((acc, item) => {
      const periodSlug = item.academicPeriod.slug
      const courseSlug = item.course.slug

      if (!acc[periodSlug]) {
        acc[periodSlug] = {
          period: item.academicPeriod,
          courses: {},
        }
      }

      if (!acc[periodSlug].courses[courseSlug]) {
        acc[periodSlug].courses[courseSlug] = {
          course: item.course,
          levels: {},
        }
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
  }, [query.data])

  return {
    ...query,
    groupedData,
  }
}
