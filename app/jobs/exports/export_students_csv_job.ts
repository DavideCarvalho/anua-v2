import { Job } from '@adonisjs/queue'
import { randomBytes } from 'node:crypto'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import Student from '#models/student'
import { NotificationService } from '#services/notification_service'

interface ExportStudentsCsvPayload {
  userId: string
  schoolIds: string[]
  filters: {
    academicPeriodId?: string
    courseId?: string
    classId?: string
    search?: string
  }
}

export default class ExportStudentsCsvJob extends Job<ExportStudentsCsvPayload> {
  static readonly jobName = 'ExportStudentsCsvJob'

  static options = {
    queue: 'default',
    maxRetries: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  }

  async execute(): Promise<void> {
    const { userId, schoolIds, filters } = this.payload

    const query = Student.query()
      .where((q) => {
        q.whereDoesntHave('levels', () => {}).orWhereHas('levels', (lq) => {
          lq.whereNull('deletedAt')
        })
      })
      .preload('user')
      .preload('class')
      .orderBy('id', 'desc')
      .limit(10000)

    if (schoolIds.length > 0) {
      query.whereHas('levels', (lq) => {
        lq.whereNull('deletedAt').whereHas('contract', (cq) => {
          cq.whereIn('schoolId', schoolIds)
        })
      })
    }

    if (filters.classId) query.where('classId', filters.classId)
    if (filters.academicPeriodId) {
      query.whereHas('levels', (lq) => {
        lq.whereNull('deletedAt').where('academicPeriodId', filters.academicPeriodId!)
      })
    }
    if (filters.courseId) {
      query.whereHas('levels', (lq) => {
        lq.whereNull('deletedAt').whereHas('level', (lvlQ) => lvlQ.where('courseId', filters.courseId!))
      })
    }
    if (filters.search) {
      query.whereHas('user', (uq) => uq.whereILike('name', `%${filters.search}%`))
    }

    const students = await query

    const header = 'Nome,Email,Telefone,Turma'
    const rows = students.map((s) => {
      const name = (s.user?.name ?? '').replace(/"/g, '""')
      const email = s.user?.email ?? ''
      const phone = s.user?.phone ?? ''
      const className = (s.class?.name ?? '').replace(/"/g, '""')
      return `"${name}","${email}","${phone}","${className}"`
    })

    const csv = `﻿${[header, ...rows].join('\r\n')}`
    const token = randomBytes(16).toString('hex')
    const dir = join(process.cwd(), 'tmp', 'exports')
    await mkdir(dir, { recursive: true })
    const filename = `alunos-${new Date().toISOString().slice(0, 10)}-${token}.csv`
    const filepath = join(dir, filename)
    await writeFile(filepath, csv, 'utf-8')

    const downloadUrl = `/api/v1/students/export-csv/download/${token}`

    const notificationService = new NotificationService()
    await notificationService.send({
      userId,
      type: 'EXPORT_READY',
      title: 'Exportação pronta',
      message: `A lista de ${students.length} alunos está pronta pra download.`,
      data: { downloadUrl, filename, count: students.length },
      actionUrl: downloadUrl,
    })
  }
}
