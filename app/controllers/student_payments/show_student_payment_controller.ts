import type { HttpContext } from '@adonisjs/core/http'
import StudentPayment from '#models/student_payment'
import AppException from '#exceptions/app_exception'
import StudentPaymentTransformer from '#transformers/student_payment_transformer'

export default class ShowStudentPaymentController {
  async handle({ params, response, serialize }: HttpContext) {
    const { id } = params

    const payment = await StudentPayment.query().where('id', id).preload('student').first()

    if (!payment) {
      throw AppException.notFound('Pagamento do aluno não encontrado')
    }

    return response.ok(await serialize(StudentPaymentTransformer.transform(payment)))
  }
}
