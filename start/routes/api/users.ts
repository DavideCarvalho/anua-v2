import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Users
const IndexUsersController = () => import('#controllers/users/index')
const SchoolEmployeesController = () => import('#controllers/users/school_employees')
const ShowUserController = () => import('#controllers/users/show')
const StoreUserController = () => import('#controllers/users/store')
const UpdateUserController = () => import('#controllers/users/update')
const DestroyUserController = () => import('#controllers/users/destroy')

// School Switcher
const GetSchoolSwitcherDataController = () =>
  import('#controllers/school_switcher/get_school_switcher_data_controller')
const ToggleSchoolSelectionController = () =>
  import('#controllers/school_switcher/toggle_school_selection_controller')
const ToggleSchoolGroupSelectionController = () =>
  import('#controllers/school_switcher/toggle_school_group_selection_controller')

export function registerUserApiRoutes() {
  router
    .group(() => {
      router.get('/', [IndexUsersController]).as('users.index')
      router.get('/school-employees', [SchoolEmployeesController]).as('users.school_employees')
      router.post('/', [StoreUserController]).as('users.store')
      router.get('/:id', [ShowUserController]).as('users.show')
      router.put('/:id', [UpdateUserController]).as('users.update')
      router.delete('/:id', [DestroyUserController]).as('users.destroy')
    })
    .prefix('/users')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerUserSchoolApiRoutes() {
  const ListUserSchoolsController = () =>
    import('#controllers/user_schools/list_user_schools_controller')
  const CreateUserSchoolController = () =>
    import('#controllers/user_schools/create_user_school_controller')
  const UpdateUserSchoolController = () =>
    import('#controllers/user_schools/update_user_school_controller')
  const DeleteUserSchoolController = () =>
    import('#controllers/user_schools/delete_user_school_controller')

  router
    .group(() => {
      router.get('/', [ListUserSchoolsController]).as('user_schools.list_user_schools')
      router.post('/', [CreateUserSchoolController]).as('user_schools.create_user_school')
      router.put('/:id', [UpdateUserSchoolController]).as('user_schools.update_user_school')
      router.delete('/:id', [DeleteUserSchoolController]).as('user_schools.delete_user_school')
    })
    .prefix('/user-schools')
    .use(middleware.auth())
}

export function registerUserSchoolGroupApiRoutes() {
  const ListUserSchoolGroupsController = () =>
    import('#controllers/user_school_groups/list_user_school_groups_controller')
  const CreateUserSchoolGroupController = () =>
    import('#controllers/user_school_groups/create_user_school_group_controller')
  const DeleteUserSchoolGroupController = () =>
    import('#controllers/user_school_groups/delete_user_school_group_controller')

  router
    .group(() => {
      router
        .get('/', [ListUserSchoolGroupsController])
        .as('user_school_groups.list_user_school_groups')
      router
        .post('/', [CreateUserSchoolGroupController])
        .as('user_school_groups.create_user_school_group')
      router
        .delete('/:id', [DeleteUserSchoolGroupController])
        .as('user_school_groups.delete_user_school_group')
    })
    .prefix('/user-school-groups')
    .use(middleware.auth())
}

export function registerSchoolSwitcherApiRoutes() {
  router
    .group(() => {
      router.get('/', [GetSchoolSwitcherDataController]).as('school_switcher.get_data')
      router
        .post('/toggle-school', [ToggleSchoolSelectionController])
        .as('school_switcher.toggle_school')
      router
        .post('/toggle-group', [ToggleSchoolGroupSelectionController])
        .as('school_switcher.toggle_group')
    })
    .prefix('/school-switcher')
    .use([middleware.auth(), middleware.impersonation()])
}
