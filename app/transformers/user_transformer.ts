import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/user'
import RoleTransformer from '#transformers/role_transformer'
import SchoolTransformer from '#transformers/school_transformer'
import SchoolChainTransformer from '#transformers/school_chain_transformer'
import ResponsibleAddressTransformer from './responsible_address_transformer.js'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'slug',
        'email',
        'phone',
        'whatsappContact',
        'birthDate',
        'documentType',
        'documentNumber',
        'asaasCustomerId',
        'imageUrl',
        'active',
        'deletedAt',
        'deletedBy',
        'grossSalary',
        'roleId',
        'schoolId',
        'schoolChainId',
        'emailVerifiedAt',
        'lastLoggedInAt',
        'createdAt',
        'updatedAt',
      ]),
      role: RoleTransformer.transform(this.whenLoaded(this.resource.role)),
      school: SchoolTransformer.transform(this.whenLoaded(this.resource.school)),
      schoolChain: SchoolChainTransformer.transform(this.whenLoaded(this.resource.schoolChain)),
      responsibleAddress: ResponsibleAddressTransformer.transform(
        this.whenLoaded(this.resource.responsibleAddress)
      ),
    }
  }
}
