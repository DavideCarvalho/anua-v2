import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import UserDto from '#models/dto/user.dto'
import School from '#models/school'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) =>
      ctx.inertia.always(async () => {
        await ctx.auth.check()
        // Usar effectiveUser se disponível (set pelo impersonation middleware)
        const user = ctx.effectiveUser ?? ctx.auth.user
        if (!user) return null

        // Carregar relacionamentos se ainda não carregados
        if (!user.$preloaded.role) await user.load('role')

        // Usar primeira escola selecionada do middleware para carregar a escola
        const firstSelectedSchoolId = ctx.selectedSchoolIds?.[0]
        if (!user.$preloaded.school && firstSelectedSchoolId) {
          const school = await School.find(firstSelectedSchoolId)
          if (school) {
            user.$setRelated('school', school)
            user.schoolId = firstSelectedSchoolId
          }
        } else if (!user.$preloaded.school && user.schoolId) {
          await user.load('school')
        }

        return new UserDto(user)
      }),
    userSchools: (ctx) => ctx.inertia.always(() => ctx.userSchools ?? []),
    selectedSchoolIds: (ctx) => ctx.inertia.always(() => ctx.selectedSchoolIds ?? []),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}