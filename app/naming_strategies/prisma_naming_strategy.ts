/**
 * Prisma Naming Strategy
 *
 * Adapta o Lucid ORM para usar as convenções de nomenclatura do Prisma:
 * - Tabelas em PascalCase (User, School, etc)
 * - Colunas em camelCase (createdAt, schoolId, etc)
 */

import { BaseModel, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'

export class PrismaNamingStrategy extends SnakeCaseNamingStrategy {
  /**
   * Converte nome do modelo para nome da tabela
   * User -> User (mantém PascalCase)
   */
  tableName(model: typeof BaseModel): string {
    return model.name
  }

  /**
   * Converte nome da propriedade para nome da coluna
   * createdAt -> createdAt (mantém camelCase)
   */
  columnName(_model: typeof BaseModel, propertyName: string): string {
    return propertyName
  }

  /**
   * Converte nome da propriedade para nome da coluna serializada
   * createdAt -> createdAt (mantém camelCase)
   */
  serializedName(_model: typeof BaseModel, propertyName: string): string {
    return propertyName
  }

  /**
   * Nome da chave primária do modelo relacionado (belongsTo)
   * Retorna 'id' pois Prisma usa 'id' como primary key
   */
  relationLocalKey(
    _relation: string,
    _model: typeof BaseModel,
    relatedModel: typeof BaseModel
  ): string {
    return relatedModel.primaryKey || 'id'
  }

  /**
   * Nome da coluna foreign key no modelo atual (belongsTo)
   * role -> roleId
   */
  relationForeignKey(
    relation: string,
    _model: typeof BaseModel,
    _relatedModel: typeof BaseModel
  ): string {
    return `${relation}Id`
  }

  /**
   * Nome da tabela pivot para relacionamento manyToMany
   */
  relationPivotTable(
    _relation: string,
    model: typeof BaseModel,
    relatedModel: typeof BaseModel
  ): string {
    return `_${model.name}To${relatedModel.name}`
  }

  /**
   * Nome da coluna foreign key na tabela pivot
   */
  relationPivotForeignKey(_relation: string, model: typeof BaseModel): string {
    const modelName = model.name
    return `${modelName.charAt(0).toLowerCase()}${modelName.slice(1)}Id`
  }

  paginationMetaKeys() {
    return {
      total: 'total',
      perPage: 'perPage',
      currentPage: 'currentPage',
      lastPage: 'lastPage',
      firstPage: 'firstPage',
      firstPageUrl: 'firstPageUrl',
      lastPageUrl: 'lastPageUrl',
      nextPageUrl: 'nextPageUrl',
      previousPageUrl: 'previousPageUrl',
    }
  }
}
