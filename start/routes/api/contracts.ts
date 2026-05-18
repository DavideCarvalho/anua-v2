import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerContractApiRoutes() {
  router
    .group(() => {
      router.get('/', [controllers.contracts.ListContracts]).as('contracts.index')
      router.post('/', [controllers.contracts.CreateContract]).as('contracts.store')
      router.get('/:id', [controllers.contracts.ShowContract]).as('contracts.show')
      router.put('/:id', [controllers.contracts.UpdateContract]).as('contracts.update')
      router.delete('/:id', [controllers.contracts.DeleteContract]).as('contracts.destroy')
      router
        .get('/:contractId/signature-stats', [controllers.contracts.GetSignatureStats])
        .as('contracts.get_signature_stats')
      router
        .get('/:contractId/docuseal-template', [controllers.contracts.GetDocusealTemplate])
        .as('contracts.get_docuseal_template')
      router
        .post('/:contractId/docuseal-template', [controllers.contracts.UploadDocusealTemplate])
        .as('contracts.upload_docuseal_template')
      router
        .delete('/:contractId/docuseal-template', [controllers.contracts.DeleteDocusealTemplate])
        .as('contracts.delete_docuseal_template')

      // Contract Payment Days
      router
        .get('/:contractId/payment-days', [controllers.contracts.ListContractPaymentDays])
        .as('contracts.payment_days.index')
      router
        .post('/:contractId/payment-days', [controllers.contracts.AddContractPaymentDay])
        .as('contracts.payment_days.store')
      router
        .delete('/:contractId/payment-days/:id', [controllers.contracts.RemoveContractPaymentDay])
        .as('contracts.payment_days.destroy')

      // Contract Interest Config
      router
        .get('/:contractId/interest-config', [controllers.contracts.ShowContractInterestConfig])
        .as('contracts.interest_config.show')
      router
        .put('/:contractId/interest-config', [controllers.contracts.UpdateContractInterestConfig])
        .as('contracts.interest_config.update')

      // Contract Early Discounts
      router
        .get('/:contractId/early-discounts', [controllers.contracts.ListContractEarlyDiscounts])
        .as('contracts.early_discounts.index')
      router
        .post('/:contractId/early-discounts', [controllers.contracts.AddContractEarlyDiscount])
        .as('contracts.early_discounts.store')
      router
        .put('/:contractId/early-discounts/:id', [
          controllers.contracts.UpdateContractEarlyDiscount,
        ])
        .as('contracts.early_discounts.update')
      router
        .delete('/:contractId/early-discounts/:id', [
          controllers.contracts.RemoveContractEarlyDiscount,
        ])
        .as('contracts.early_discounts.destroy')
    })
    .prefix('/contracts')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerContractDocumentApiRoutes() {
  router
    .group(() => {
      router
        .get('/', [controllers.contractDocuments.ListContractDocuments])
        .as('contract_documents.index')
      router
        .post('/', [controllers.contractDocuments.CreateContractDocument])
        .as('contract_documents.store')
    })
    .prefix('/contract-documents')
    .use([middleware.auth(), middleware.impersonation()])
}
