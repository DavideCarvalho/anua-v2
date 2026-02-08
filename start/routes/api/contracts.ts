import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Contracts
const ListContractsController = () => import('#controllers/contracts/list_contracts_controller')
const ShowContractController = () => import('#controllers/contracts/show_contract_controller')
const CreateContractController = () => import('#controllers/contracts/create_contract_controller')
const UpdateContractController = () => import('#controllers/contracts/update_contract_controller')
const DeleteContractController = () => import('#controllers/contracts/delete_contract_controller')
const GetSignatureStatsController = () =>
  import('#controllers/contracts/get_signature_stats_controller')
const GetDocusealTemplateController = () =>
  import('#controllers/contracts/get_docuseal_template_controller')
const UploadDocusealTemplateController = () =>
  import('#controllers/contracts/upload_docuseal_template_controller')
const DeleteDocusealTemplateController = () =>
  import('#controllers/contracts/delete_docuseal_template_controller')

// Contract Documents
const ListContractDocumentsController = () =>
  import('#controllers/contract-documents/list_contract_documents_controller')
const CreateContractDocumentController = () =>
  import('#controllers/contract-documents/create_contract_document_controller')

// Contract Payment Days
const ListContractPaymentDaysController = () =>
  import('#controllers/contracts/list_contract_payment_days_controller')
const AddContractPaymentDayController = () =>
  import('#controllers/contracts/add_contract_payment_day_controller')
const RemoveContractPaymentDayController = () =>
  import('#controllers/contracts/remove_contract_payment_day_controller')

// Contract Interest Config
const ShowContractInterestConfigController = () =>
  import('#controllers/contracts/show_contract_interest_config_controller')
const UpdateContractInterestConfigController = () =>
  import('#controllers/contracts/update_contract_interest_config_controller')

// Contract Early Discounts
const ListContractEarlyDiscountsController = () =>
  import('#controllers/contracts/list_contract_early_discounts_controller')
const AddContractEarlyDiscountController = () =>
  import('#controllers/contracts/add_contract_early_discount_controller')
const UpdateContractEarlyDiscountController = () =>
  import('#controllers/contracts/update_contract_early_discount_controller')
const RemoveContractEarlyDiscountController = () =>
  import('#controllers/contracts/remove_contract_early_discount_controller')

export function registerContractApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListContractsController]).as('contracts.index')
      router.post('/', [CreateContractController]).as('contracts.store')
      router.get('/:id', [ShowContractController]).as('contracts.show')
      router.put('/:id', [UpdateContractController]).as('contracts.update')
      router.delete('/:id', [DeleteContractController]).as('contracts.destroy')
      router
        .get('/:contractId/signature-stats', [GetSignatureStatsController])
        .as('contracts.getSignatureStats')
      router
        .get('/:contractId/docuseal-template', [GetDocusealTemplateController])
        .as('contracts.getDocusealTemplate')
      router
        .post('/:contractId/docuseal-template', [UploadDocusealTemplateController])
        .as('contracts.uploadDocusealTemplate')
      router
        .delete('/:contractId/docuseal-template', [DeleteDocusealTemplateController])
        .as('contracts.deleteDocusealTemplate')

      // Contract Payment Days
      router
        .get('/:contractId/payment-days', [ListContractPaymentDaysController])
        .as('contracts.paymentDays.index')
      router
        .post('/:contractId/payment-days', [AddContractPaymentDayController])
        .as('contracts.paymentDays.store')
      router
        .delete('/:contractId/payment-days/:id', [RemoveContractPaymentDayController])
        .as('contracts.paymentDays.destroy')

      // Contract Interest Config
      router
        .get('/:contractId/interest-config', [ShowContractInterestConfigController])
        .as('contracts.interestConfig.show')
      router
        .put('/:contractId/interest-config', [UpdateContractInterestConfigController])
        .as('contracts.interestConfig.update')

      // Contract Early Discounts
      router
        .get('/:contractId/early-discounts', [ListContractEarlyDiscountsController])
        .as('contracts.earlyDiscounts.index')
      router
        .post('/:contractId/early-discounts', [AddContractEarlyDiscountController])
        .as('contracts.earlyDiscounts.store')
      router
        .put('/:contractId/early-discounts/:id', [UpdateContractEarlyDiscountController])
        .as('contracts.earlyDiscounts.update')
      router
        .delete('/:contractId/early-discounts/:id', [RemoveContractEarlyDiscountController])
        .as('contracts.earlyDiscounts.destroy')
    })
    .prefix('/contracts')
    .use([middleware.auth(), middleware.impersonation()])
}

export function registerContractDocumentApiRoutes() {
  router
    .group(() => {
      router.get('/', [ListContractDocumentsController]).as('contractDocuments.index')
      router.post('/', [CreateContractDocumentController]).as('contractDocuments.store')
    })
    .prefix('/contract-documents')
    .use([middleware.auth(), middleware.impersonation()])
}
