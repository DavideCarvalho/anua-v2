import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import { listStudentPaymentsValidator } from '#validators/student_payment'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'

export default class ListStudentPaymentsController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds, serialize } = ctx
    const payload = await request.validateUsing(listStudentPaymentsValidator)

    const {
      studentId,
      contractId,
      classId,
      search,
      status,
      type,
      month,
      year,
      overdueMin,
      overdueMax,
      page = 1,
      limit = 20,
    } = payload

    const query = StudentPayment.query()
      .preload('student', (q) => q.preload('user'))
      .preload('invoice')
      .orderBy('dueDate', 'desc')

    if (selectedSchoolIds && selectedSchoolIds.length > 0) {
      query.whereHas('contract', (q) => {
        q.whereIn('schoolId', selectedSchoolIds)
      })
    }

    if (studentId) {
      query.where('studentId', studentId)
    }

    if (contractId) {
      query.where('contractId', contractId)
    }

    if (status) {
      query.where('status', status)
    }

    if (type) {
      query.where('type', type)
    }

    if (month) {
      query.where('month', month)
    }

    if (year) {
      query.where('year', year)
    }

    if (classId) {
      query.whereHas('student', (studentQuery) => {
        studentQuery.where('classId', classId)
      })
    }

    if (search) {
      query.whereHas('student', (studentQuery) => {
        studentQuery.whereHas('user', (userQuery) => {
          userQuery.whereILike('name', `%${search}%`)
        })
      })
    }

    if (overdueMin || overdueMax) {
      const now = new Date()
      if (overdueMax) {
        const minDate = new Date(now)
        minDate.setDate(minDate.getDate() - overdueMax)
        query.where('dueDate', '>=', minDate.toISOString().slice(0, 10))
      }
      if (overdueMin) {
        const maxDate = new Date(now)
        maxDate.setDate(maxDate.getDate() - overdueMin)
        query.where('dueDate', '<=', maxDate.toISOString().slice(0, 10))
      }
    }

    const payments = await query.paginate(page, limit)

    const data = payments.all()
    const metadata = payments.getMeta()

    return serialize(StudentPaymentTransformer.paginate(data, metadata))
  }
}
