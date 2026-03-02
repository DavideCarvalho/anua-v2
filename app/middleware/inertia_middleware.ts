import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import type { PageProps } from '@adonisjs/inertia/types'
import UserDto from '#models/dto/user.dto'
import School from '#models/school'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    const { session, auth } = ctx

    await auth.check()
    const user =
      (ctx as HttpContext & { effectiveUser?: typeof auth.user }).effectiveUser ?? auth.user
    let userDto = null
    if (user) {
      if (!user.$preloaded.role) await user.load('role')
      const firstSelectedSchoolId = (ctx as HttpContext & { selectedSchoolIds?: string[] })
        .selectedSchoolIds?.[0]
      if (!user.$preloaded.school && firstSelectedSchoolId) {
        const school = await School.find(firstSelectedSchoolId)
        if (school) {
          user.$setRelated('school', school)
          user.schoolId = firstSelectedSchoolId
        }
      } else if (!user.$preloaded.school && user.schoolId) {
        await user.load('school')
      }
      userDto = new UserDto(user)
    }

    const userSchools = (ctx as HttpContext & { userSchools?: unknown[] }).userSchools ?? []
    const selectedSchoolIds =
      (ctx as HttpContext & { selectedSchoolIds?: string[] }).selectedSchoolIds ?? []

    return {
      errors: this.getValidationErrors(ctx),
      flash: {
        error: session?.flashMessages.get('error'),
        success: session?.flashMessages.get('success'),
      },
      user: userDto ? (userDto as unknown as Record<string, unknown>) : null,
      userSchools: userSchools as unknown[],
      selectedSchoolIds,
    } as PageProps
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)
    const output = await next()
    this.dispose(ctx)
    return output
  }
}

declare module '@adonisjs/inertia/types' {
  export interface SharedProps {
    errors: Record<string, string>
    flash: { error?: string; success?: string }
    user: InstanceType<typeof UserDto> | null
    userSchools: unknown[]
    selectedSchoolIds: string[]
  }
}
