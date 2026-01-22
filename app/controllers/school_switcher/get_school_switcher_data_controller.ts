import type { HttpContext } from '@adonisjs/core/http'
import UserHasSchool from '#models/user_has_school'
import UserHasSchoolGroup from '#models/user_has_school_group'
import UserSchoolSelection from '#models/user_school_selection'
import UserSchoolGroupSelection from '#models/user_school_group_selection'

export default class GetSchoolSwitcherDataController {
  async handle(ctx: HttpContext) {
    const { auth, response } = ctx
    // Use effectiveUser when impersonating, otherwise use auth.user
    const user = ctx.effectiveUser || auth.user!

    // Get all schools the user has access to via UserHasSchool
    const userSchools = await UserHasSchool.query()
      .where('userId', user.id)
      .preload('school')

    const schools = userSchools.map((uhs) => ({
      id: uhs.school.id,
      name: uhs.school.name,
      slug: uhs.school.slug,
    }))

    // If no UserHasSchool records, fallback to user's direct school
    if (schools.length === 0) {
      // Try to load the school relationship
      await user.load('school')
      const userSchool = user.school
      if (userSchool) {
        schools.push({
          id: userSchool.id,
          name: userSchool.name,
          slug: userSchool.slug,
        })
      }
    }

    // Get all school groups the user has access to
    const userSchoolGroups = await UserHasSchoolGroup.query()
      .where('userId', user.id)
      .preload('schoolGroup', (query) => {
        query.preload('schools')
      })

    const groups = userSchoolGroups.map((uhsg) => ({
      id: uhsg.schoolGroup.id,
      name: uhsg.schoolGroup.name,
      type: uhsg.schoolGroup.type,
      schoolIds: uhsg.schoolGroup.schools?.map((s) => s.id) || [],
      schoolCount: uhsg.schoolGroup.schools?.length || 0,
    }))

    // Get currently selected schools
    const selectedSchoolRecords = await UserSchoolSelection.query()
      .where('userId', user.id)
      .preload('school')

    const selectedSchools = selectedSchoolRecords.map((uss) => ({
      id: uss.school.id,
      name: uss.school.name,
      slug: uss.school.slug,
    }))

    // Get currently selected groups
    const selectedGroupRecords = await UserSchoolGroupSelection.query()
      .where('userId', user.id)
      .preload('schoolGroup', (query) => {
        query.preload('schools')
      })

    const selectedGroups = selectedGroupRecords.map((usgs) => ({
      id: usgs.schoolGroup.id,
      name: usgs.schoolGroup.name,
      type: usgs.schoolGroup.type,
      schoolIds: usgs.schoolGroup.schools?.map((s) => s.id) || [],
      schoolCount: usgs.schoolGroup.schools?.length || 0,
    }))

    // If no selections exist, default to the user's default school
    if (selectedSchools.length === 0 && selectedGroups.length === 0 && schools.length > 0) {
      const defaultSchool =
        userSchools.find((uhs) => uhs.isDefault)?.school || userSchools[0]?.school || schools[0]
      if (defaultSchool) {
        selectedSchools.push({
          id: defaultSchool.id,
          name: defaultSchool.name,
          slug: defaultSchool.slug,
        })
      }
    }

    return response.ok({
      schools,
      groups,
      selectedSchools,
      selectedGroups,
    })
  }
}
