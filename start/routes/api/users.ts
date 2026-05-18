import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerUserApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.users.Index]).as('users.index')
      router
        .get('/school-employees', [controllers.users.SchoolEmployees])
        .as('users.school_employees')
      router.post('/', [controllers.users.Store]).as('users.store')
      router.get('/:id', [controllers.users.Show]).as('users.show')
      router.put('/:id', [controllers.users.Update]).as('users.update')
      router.delete('/:id', [controllers.users.Destroy]).as('users.destroy')
    })
    .prefix('/users')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerUserSchoolApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.userSchools.ListUserSchools])
        .as('user_schools.list_user_schools')
      router
        .post('/', [controllers.userSchools.CreateUserSchool])
        .as('user_schools.create_user_school')
      router
        .put('/:id', [controllers.userSchools.UpdateUserSchool])
        .as('user_schools.update_user_school')
      router
        .delete('/:id', [controllers.userSchools.DeleteUserSchool])
        .as('user_schools.delete_user_school')
    })
    .prefix('/user-schools')
    .use(middleware.auth())
}

export function registerUserSchoolGroupApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.userSchoolGroups.ListUserSchoolGroups])
        .as('user_school_groups.list_user_school_groups')
      router
        .post('/', [controllers.userSchoolGroups.CreateUserSchoolGroup])
        .as('user_school_groups.create_user_school_group')
      router
        .delete('/:id', [controllers.userSchoolGroups.DeleteUserSchoolGroup])
        .as('user_school_groups.delete_user_school_group')
    })
    .prefix('/user-school-groups')
    .use(middleware.auth())
}

export function registerSchoolSwitcherApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.schoolSwitcher.GetSchoolSwitcherData])
        .as('school_switcher.get_data')
      router
        .post('/toggle-school', [controllers.schoolSwitcher.ToggleSchoolSelection])
        .as('school_switcher.toggle_school')
      router
        .post('/toggle-group', [controllers.schoolSwitcher.ToggleSchoolGroupSelection])
        .as('school_switcher.toggle_group')
    })
    .prefix('/school-switcher')
    .use([middleware.auth(), middleware.impersonation()])
}
