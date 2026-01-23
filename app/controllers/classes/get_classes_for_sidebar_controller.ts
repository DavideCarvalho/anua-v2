import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { SidebarClassListDto } from '#dtos/sidebar_class_dto'

interface UserSchoolRow {
  schoolId: string
}

interface SidebarClassRow {
  classId: string
  className: string
  classSlug: string
  courseId: string
  courseName: string
  courseSlug: string
  academicPeriodId: string
  academicPeriodName: string
  academicPeriodSlug: string
}

export default class GetClassesForSidebarController {
  async handle(ctx: HttpContext) {
    const { auth } = ctx
    const user = ctx.effectiveUser ?? auth.user!

    // Get schools the user has access to
    const userSchoolsResult = await db.rawQuery<{ rows: UserSchoolRow[] }>(
      `SELECT "schoolId" FROM "UserHasSchool" WHERE "userId" = :userId`,
      { userId: user.id }
    )

    const schoolIds = userSchoolsResult.rows.map((row) => row.schoolId).filter(Boolean)

    if (schoolIds.length === 0) {
      return new SidebarClassListDto([])
    }

    // Query to get classes with their course and academic period info
    // Using ClassHasAcademicPeriod for direct class-period linkage
    const query = `
      SELECT DISTINCT
        c.id as "classId",
        c.name as "className",
        c.slug as "classSlug",
        co.id as "courseId",
        co.name as "courseName",
        co.slug as "courseSlug",
        ap.id as "academicPeriodId",
        ap.name as "academicPeriodName",
        ap.slug as "academicPeriodSlug"
      FROM "Class" c
      JOIN "ClassHasAcademicPeriod" chap_class ON chap_class."classId" = c.id
      JOIN "AcademicPeriod" ap ON chap_class."academicPeriodId" = ap.id
      JOIN "Level" l ON c."levelId" = l.id
      JOIN "LevelAssignedToCourseHasAcademicPeriod" lacap ON lacap."levelId" = l.id
        AND lacap."isActive" = true
      JOIN "CourseHasAcademicPeriod" chap ON lacap."courseHasAcademicPeriodId" = chap.id
        AND chap."academicPeriodId" = ap.id
      JOIN "Course" co ON chap."courseId" = co.id
      WHERE c."schoolId" = ANY(:schoolIds)
        AND ap."isActive" = true
        AND c."isArchived" = false
      ORDER BY ap.name, co.name, c.name
    `

    const result = await db.rawQuery<{ rows: SidebarClassRow[] }>(query, {
      schoolIds,
    })

    const classes = result.rows.map((row) => ({
      id: row.classId,
      name: row.className,
      slug: row.classSlug,
      course: {
        id: row.courseId,
        name: row.courseName,
        slug: row.courseSlug,
      },
      academicPeriod: {
        id: row.academicPeriodId,
        name: row.academicPeriodName,
        slug: row.academicPeriodSlug,
      },
    }))

    return new SidebarClassListDto(classes)
  }
}
