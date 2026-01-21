/**
 * Configure Lucid ORM to use Prisma naming conventions
 */

import { BaseModel } from '@adonisjs/lucid/orm'
import { PrismaNamingStrategy } from '../app/naming_strategies/prisma_naming_strategy.js'

BaseModel.namingStrategy = new PrismaNamingStrategy()
