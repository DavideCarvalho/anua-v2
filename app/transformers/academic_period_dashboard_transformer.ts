import { BaseTransformer } from '@adonisjs/core/transformers'

type DashboardLevel = {
  id: string
  levelId: string
  courseHasAcademicPeriodId: string
  isActive: boolean
  studentsCount: number
  classesCount: number
  level: {
    id: string
    name: string
    slug: string
    order: number
    contractId: string | null
    isActive: boolean
  } | null
}

type DashboardCourse = {
  id: string
  courseId: string
  academicPeriodId: string
  course: {
    id: string
    name: string
    slug: string
    enrollmentMinimumAge: number | null
    enrollmentMaximumAge: number | null
    maxStudentsPerClass: number | null
  } | null
  metrics: {
    levelsCount: number
    activeLevelsCount: number
    inactiveLevelsCount: number
    studentsCount: number
    classesCount: number
  }
  levelAssignments: DashboardLevel[]
}

type AcademicPeriodDashboard = {
  id: string
  name: string
  slug: string
  startDate: unknown
  endDate: unknown
  enrollmentStartDate: unknown
  enrollmentEndDate: unknown
  isActive: boolean
  segment: string
  isClosed: boolean
  metrics: {
    coursesCount: number
    levelsCount: number
    studentsCount: number
    classesCount: number
  }
  courseAcademicPeriods: DashboardCourse[]
}

export default class AcademicPeriodDashboardTransformer extends BaseTransformer<AcademicPeriodDashboard> {
  toObject() {
    return this.resource
  }
}
