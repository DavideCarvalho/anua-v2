import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import { listStudentPaymentsValidator } from '#validators/student_payment'
import StudentPaymentDto from '#models/dto/student_payment.dto'

export default class ListStudentPaymentsController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds } = ctx
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
      page = 1,
      limit = 20,
    } = payload

    const query = StudentPayment.query()
      .preload('student', (q) => q.preload('user'))
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

    const payments = await query.paginate(page, limit)

    return StudentPaymentDto.fromPaginator(payments)
  }
}
