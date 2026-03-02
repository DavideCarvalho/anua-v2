import type { ApplicationService } from '@adonisjs/core/types'
import { HttpContext } from '@adonisjs/core/http'
import { BaseSerializer } from '@adonisjs/core/transformers'
import type { SimplePaginatorMetaKeys } from '@adonisjs/lucid/types/querybuilder'

/**
 * Serializer that returns the same shape as the controller — no wrapping in "data".
 * Paginated responses keep { data, metadata } as returned by the transformer.
 */
class PlainSerializer extends BaseSerializer<{
  Wrap?: undefined
  PaginationMetaData: SimplePaginatorMetaKeys
}> {
  wrap = undefined

  definePaginationMetaData(metaData: unknown): SimplePaginatorMetaKeys {
    if (!this.isLucidPaginatorMetaData(metaData)) {
      throw new Error(
        'Invalid pagination metadata. Expected metadata to contain Lucid pagination keys'
      )
    }
    return metaData
  }
}

const serializer = new PlainSerializer()
const serialize = serializer.serialize.bind(serializer)

/**
 * Adds the serialize method to all HttpContext instances.
 * Response shape is exactly what you pass to serialize (no "data" wrapper).
 */
HttpContext.instanceProperty('serialize', serialize)

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    serialize: typeof serialize
  }
}

export default class TransformProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    // serialize macro is attached above via HttpContext.instanceProperty
  }
}
