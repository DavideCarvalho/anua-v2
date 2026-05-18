import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerScholarshipApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.scholarships.ListScholarships])
        .as('scholarships.list_scholarships')
      router
        .post('/', [controllers.scholarships.CreateScholarship])
        .as('scholarships.create_scholarship')
      router
        .get('/:id', [controllers.scholarships.ShowScholarship])
        .as('scholarships.show_scholarship')
      router
        .put('/:id', [controllers.scholarships.UpdateScholarship])
        .as('scholarships.update_scholarship')
      router
        .patch('/:id/toggle-active', [controllers.scholarships.ToggleScholarshipActive])
        .as('scholarships.toggle_scholarship_active')
    })
    .prefix('/scholarships')
    .use(middleware.auth())
}

export function registerSchoolPartnerApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.schoolPartners.ListSchoolPartners])
        .as('school_partners.list_school_partners')
      router
        .post('/', [controllers.schoolPartners.CreateSchoolPartner])
        .as('school_partners.create_school_partner')
      router
        .get('/:id', [controllers.schoolPartners.ShowSchoolPartner])
        .as('school_partners.show_school_partner')
      router
        .put('/:id', [controllers.schoolPartners.UpdateSchoolPartner])
        .as('school_partners.update_school_partner')
      router
        .patch('/:id/toggle-active', [controllers.schoolPartners.ToggleSchoolPartnerActive])
        .as('school_partners.toggle_school_partner_active')
    })
    .prefix('/school-partners')
    .use(middleware.auth())
}

export function registerSchoolChainApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.schoolChains.ListSchoolChains])
        .as('school_chains.list_school_chains')
      router
        .post('/', [controllers.schoolChains.CreateSchoolChain])
        .as('school_chains.create_school_chain')
      router
        .get('/:id', [controllers.schoolChains.ShowSchoolChain])
        .as('school_chains.show_school_chain')
      router
        .put('/:id', [controllers.schoolChains.UpdateSchoolChain])
        .as('school_chains.update_school_chain')
      router
        .delete('/:id', [controllers.schoolChains.DeleteSchoolChain])
        .as('school_chains.delete_school_chain')
    })
    .prefix('/school-chains')
    .use(middleware.auth())
}

export function registerSchoolGroupApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.schoolGroups.ListSchoolGroups])
        .as('school_groups.list_school_groups')
      router
        .post('/', [controllers.schoolGroups.CreateSchoolGroup])
        .as('school_groups.create_school_group')
      router
        .get('/:id', [controllers.schoolGroups.ShowSchoolGroup])
        .as('school_groups.show_school_group')
      router
        .put('/:id', [controllers.schoolGroups.UpdateSchoolGroup])
        .as('school_groups.update_school_group')
      router
        .delete('/:id', [controllers.schoolGroups.DeleteSchoolGroup])
        .as('school_groups.delete_school_group')
    })
    .prefix('/school-groups')
    .use(middleware.auth())
}
