import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

export function registerScholarshipApiRoutes() {
  const ListScholarshipsController = () =>
    import('#controllers/scholarships/list_scholarships_controller')
  const CreateScholarshipController = () =>
    import('#controllers/scholarships/create_scholarship_controller')
  const ShowScholarshipController = () =>
    import('#controllers/scholarships/show_scholarship_controller')
  const UpdateScholarshipController = () =>
    import('#controllers/scholarships/update_scholarship_controller')
  const ToggleScholarshipActiveController = () =>
    import('#controllers/scholarships/toggle_scholarship_active_controller')

  router
    .group(() => {
      router.get('/', [ListScholarshipsController]).as('scholarships.listScholarships')
      router.post('/', [CreateScholarshipController]).as('scholarships.createScholarship')
      router.get('/:id', [ShowScholarshipController]).as('scholarships.showScholarship')
      router.put('/:id', [UpdateScholarshipController]).as('scholarships.updateScholarship')
      router
        .patch('/:id/toggle-active', [ToggleScholarshipActiveController])
        .as('scholarships.toggleScholarshipActive')
    })
    .prefix('/scholarships')
    .use(middleware.auth())
}

export function registerSchoolPartnerApiRoutes() {
  const ListSchoolPartnersController = () =>
    import('#controllers/school_partners/list_school_partners_controller')
  const CreateSchoolPartnerController = () =>
    import('#controllers/school_partners/create_school_partner_controller')
  const ShowSchoolPartnerController = () =>
    import('#controllers/school_partners/show_school_partner_controller')
  const UpdateSchoolPartnerController = () =>
    import('#controllers/school_partners/update_school_partner_controller')
  const ToggleSchoolPartnerActiveController = () =>
    import('#controllers/school_partners/toggle_school_partner_active_controller')

  router
    .group(() => {
      router.get('/', [ListSchoolPartnersController]).as('schoolPartners.listSchoolPartners')
      router.post('/', [CreateSchoolPartnerController]).as('schoolPartners.createSchoolPartner')
      router.get('/:id', [ShowSchoolPartnerController]).as('schoolPartners.showSchoolPartner')
      router.put('/:id', [UpdateSchoolPartnerController]).as('schoolPartners.updateSchoolPartner')
      router
        .patch('/:id/toggle-active', [ToggleSchoolPartnerActiveController])
        .as('schoolPartners.toggleSchoolPartnerActive')
    })
    .prefix('/school-partners')
    .use(middleware.auth())
}

export function registerSchoolChainApiRoutes() {
  const ListSchoolChainsController = () =>
    import('#controllers/school_chains/list_school_chains_controller')
  const CreateSchoolChainController = () =>
    import('#controllers/school_chains/create_school_chain_controller')
  const ShowSchoolChainController = () =>
    import('#controllers/school_chains/show_school_chain_controller')
  const UpdateSchoolChainController = () =>
    import('#controllers/school_chains/update_school_chain_controller')
  const DeleteSchoolChainController = () =>
    import('#controllers/school_chains/delete_school_chain_controller')

  router
    .group(() => {
      router.get('/', [ListSchoolChainsController]).as('schoolChains.listSchoolChains')
      router.post('/', [CreateSchoolChainController]).as('schoolChains.createSchoolChain')
      router.get('/:id', [ShowSchoolChainController]).as('schoolChains.showSchoolChain')
      router.put('/:id', [UpdateSchoolChainController]).as('schoolChains.updateSchoolChain')
      router.delete('/:id', [DeleteSchoolChainController]).as('schoolChains.deleteSchoolChain')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

export function registerSchoolGroupApiRoutes() {
  const ListSchoolGroupsController = () =>
    import('#controllers/school_groups/list_school_groups_controller')
  const CreateSchoolGroupController = () =>
    import('#controllers/school_groups/create_school_group_controller')
  const ShowSchoolGroupController = () =>
    import('#controllers/school_groups/show_school_group_controller')
  const UpdateSchoolGroupController = () =>
    import('#controllers/school_groups/update_school_group_controller')
  const DeleteSchoolGroupController = () =>
    import('#controllers/school_groups/delete_school_group_controller')

  router
    .group(() => {
      router.get('/', [ListSchoolGroupsController]).as('schoolGroups.listSchoolGroups')
      router.post('/', [CreateSchoolGroupController]).as('schoolGroups.createSchoolGroup')
      router.get('/:id', [ShowSchoolGroupController]).as('schoolGroups.showSchoolGroup')
      router.put('/:id', [UpdateSchoolGroupController]).as('schoolGroups.updateSchoolGroup')
      router.delete('/:id', [DeleteSchoolGroupController]).as('schoolGroups.deleteSchoolGroup')
    })
    .prefix('/school-groups')
    .use(middleware.auth())
}
