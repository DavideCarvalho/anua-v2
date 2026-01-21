import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
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

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static table = 'User'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare email: string | null

  @column({ serializeAs: null })
  declare password: string | null

  @column()
  declare phone: string | null

  @column()
  declare whatsappContact: boolean

  @column.date()
  declare birthDate: DateTime | null

  @column()
  declare documentType: string | null

  @column()
  declare documentNumber: string | null

  @column()
  declare asaasCustomerId: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare active: boolean

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column()
  declare deletedBy: string | null

  @column()
  declare grossSalary: number

  // Foreign keys
  @column()
  declare roleId: string | null

  @column()
  declare schoolId: string | null

  @column()
  declare schoolChainId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
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
