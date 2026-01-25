import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Contract from './contract.js'
import Class_ from './class.js'
import LevelAssignedToCourseHasAcademicPeriod from './level_assigned_to_course_has_academic_period.js'

// Level serve para agrupar salas
// No ensino fundamental e médio, as salas são tipo 6° Ano A, 6° Ano B, 7° Ano A, 7° Ano B
// Então o Level vai ser 6° Ano, 7° Ano
// Em cursos técnicos e faculdade, os levels são os semestres
// Exemplo: Informática 1° Semestre, Informática 2° Semestre
// Usamos courseSlug para identificar o level na matrícula digital
// O course slug para ensino médio e fundamental vai ser igual em todos os Level: "ensino-medio" e "ensino-fundamental" respectivamente
// Enquanto que para cada curso técnico teremos um slug diferente, como "informatica" ou "matematica"
// Isso vai ser definido na hora de criar o level
// Se a gente quiser fazer algo de tipo, a pessoa acabou o último level do sei lá, educação infantil,
// já que a ordem é educação infantil -> ensino fundamental -> ensino médio, a gente faz essa lógica na mão
export default class Level extends BaseModel {
  static table = 'Level'

  @beforeCreate()
  static assignId(level: Level) {
    if (!level.id) {
      level.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'slug' })
  @slugify({
    strategy: 'dbIncrement',
    fields: ['name'],
  })
  declare slug: string

  @column({ columnName: 'order' })
  declare order: number

  @column({ columnName: 'schoolId' })
  declare schoolId: string

  @column({ columnName: 'contractId' })
  declare contractId: string | null

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Contract, { foreignKey: 'contractId' })
  declare contract: BelongsTo<typeof Contract>

  @hasMany(() => Class_, { foreignKey: 'levelId' })
  declare classes: HasMany<typeof Class_>

  @hasMany(() => LevelAssignedToCourseHasAcademicPeriod, { foreignKey: 'levelId' })
  declare levelAssignments: HasMany<typeof LevelAssignedToCourseHasAcademicPeriod>
}
