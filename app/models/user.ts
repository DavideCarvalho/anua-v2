import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasOne, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne, HasMany } from '@adonisjs/lucid/types/relations'

// Core models
import Role from './role.js'
import School from './school.js'
import SchoolChain from './school_chain.js'

// Student related
import Student from './student.js'
import StudentHasResponsible from './student_has_responsible.js'
import ResponsibleAddress from './responsible_address.js'
import UserHasSchool from './user_has_school.js'
import UserHasSchoolGroup from './user_has_school_group.js'

export default class User extends BaseModel {
  static table = 'User'

  @beforeCreate()
  static assignId(user: User) {
    if (!user.id) {
      user.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  declare slug: string

  @column({ columnName: 'email' })
  declare email: string | null

  @column({ columnName: 'phone' })
  declare phone: string | null

  @column({ columnName: 'whatsappContact' })
  declare whatsappContact: boolean

  @column.date({ columnName: 'birthDate' })
  declare birthDate: DateTime | null

  @column({ columnName: 'documentType' })
  declare documentType: string | null

  @column({ columnName: 'documentNumber' })
  declare documentNumber: string | null

  @column({ columnName: 'asaasCustomerId' })
  declare asaasCustomerId: string | null

  @column({ columnName: 'imageUrl' })
  declare imageUrl: string | null

  @column({ columnName: 'active' })
  declare active: boolean

  @column.dateTime({ columnName: 'deletedAt' })
  declare deletedAt: DateTime | null

  @column({ columnName: 'deletedBy' })
  declare deletedBy: string | null

  @column({ columnName: 'grossSalary' })
  declare grossSalary: number

  // Foreign keys
  @column({ columnName: 'roleId' })
  declare roleId: string | null

  @column({ columnName: 'schoolId' })
  declare schoolId: string | null

  @column({ columnName: 'schoolChainId' })
  declare schoolChainId: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Role, { foreignKey: 'roleId', localKey: 'id' })
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => School, { foreignKey: 'schoolId', localKey: 'id' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolChain, { foreignKey: 'schoolChainId', localKey: 'id' })
  declare schoolChain: BelongsTo<typeof SchoolChain>

  @belongsTo(() => User, { foreignKey: 'deletedBy' })
  declare deletedByUser: BelongsTo<typeof User>

  @hasOne(() => Student, { foreignKey: 'id', localKey: 'id' })
  declare student: HasOne<typeof Student>

  // Relacionamentos como responsável
  @hasMany(() => StudentHasResponsible, { foreignKey: 'responsibleId' })
  declare studentResponsibilities: HasMany<typeof StudentHasResponsible>

  @hasOne(() => ResponsibleAddress, { foreignKey: 'responsibleId' })
  declare responsibleAddress: HasOne<typeof ResponsibleAddress>

  // TODO: ResponsibleDocument table doesn't exist in DB - relationship removed
  // @hasMany(() => ResponsibleDocument, { foreignKey: 'responsibleId' })
  // declare responsibleDocuments: HasMany<typeof ResponsibleDocument>

  @hasMany(() => UserHasSchool, { foreignKey: 'userId' })
  declare userHasSchools: HasMany<typeof UserHasSchool>

  @hasMany(() => UserHasSchoolGroup, { foreignKey: 'userId' })
  declare userHasSchoolGroups: HasMany<typeof UserHasSchoolGroup>

  // Relacionamento com Teacher (1:1 quando é professor)
  // @hasOne(() => Teacher, { foreignKey: 'id', localKey: 'id' })
  // declare teacher: HasOne<typeof Teacher>

  // Relacionamentos de auditoria
  // @hasMany(() => AuditLog, { foreignKey: 'userId' })
  // declare auditLogs: HasMany<typeof AuditLog>

  // Relacionamentos de usuários deletados por este usuário
  @hasMany(() => User, { foreignKey: 'deletedBy' })
  declare deletedUsers: HasMany<typeof User>

  // Relacionamentos que serão adicionados quando os models existirem:
  // - Timesheet: EmployeeTimesheet, EmployeeBenefit, Absence
  // - Social: Post, Comment, UserLikedPost, CommentLike
  // - Events: Event, EventParticipant, EventComment
  // - Notifications: Notification, NotificationPreference
  // - Gamification: StoreOrder
  // - Canteen: CanteenPurchase
  // - System: UserHasSchool, UserCredential
}
