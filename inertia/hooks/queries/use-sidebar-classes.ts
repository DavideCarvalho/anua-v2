import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

const $route = tuyau.api.v1.classes.sidebar.$get

export type SidebarClassesResponse = InferResponseType<typeof $route>

export function useSidebarClassesQueryOptions() {
  return {
    queryKey: ['sidebar-classes'],
    queryFn: () => $route().unwrap(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  } satisfies QueryOptions<SidebarClassesResponse>
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
}

interface ClassInfo {
  id: string
  name: string
  slug: string
}

interface CourseGroup {
  course: CourseInfo
  classes: ClassInfo[]
}

interface PeriodGroup {
  period: AcademicPeriodInfo
  courses: Record<string, CourseGroup>
}

export type SidebarData = Record<string, PeriodGroup>

export function useSidebarClasses() {
  const query = useQuery(useSidebarClassesQueryOptions())

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
          classes: [],
        }
      }

      acc[periodSlug].courses[courseSlug].classes.push({
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
