import type { HttpContext } from '@adonisjs/core/http'
import Invoice from '#models/invoice'
import { listInvoicesValidator } from '#validators/invoice'
import InvoiceTransformer from '#transformers/invoice_transformer'

export default class ListInvoicesController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds, serialize } = ctx
    const payload = await request.validateUsing(listInvoicesValidator)

    const {
      studentId,
      studentIds,
      search,
      contractId,
      academicPeriodId,
      courseId,
      classId,
      dueDateFrom,
      dueDateTo,
      status,
      type,
      sortBy = 'dueDate',
      sortDirection = 'asc',
      month,
      year,
      page = 1,
      limit = 20,
    } = payload

    const query = Invoice.query()
      .preload('student', (q) => q.preload('user'))
      .preload('payments', (q) => {
        q.preload('contract')
        q.preload('studentHasExtraClass', (eq) => eq.preload('extraClass'))
        q.preload('studentHasLevel', (enrollmentQuery) => {
          enrollmentQuery.preload('scholarship')
          enrollmentQuery.preload('individualDiscounts', (discountQuery) => {
            discountQuery.where('isActive', true).whereNull('deletedAt')
          })
        })
      })
      .whereHas('payments', () => {})

    if (selectedSchoolIds && selectedSchoolIds.length > 0) {
      query.where((scopedQuery) => {
        scopedQuery.whereHas('contract', (q) => {
          q.whereIn('schoolId', selectedSchoolIds)
        })

        scopedQuery.orWhereHas('payments', (paymentsQuery) => {
          paymentsQuery.whereHas('contract', (contractQuery) => {
            contractQuery.whereIn('schoolId', selectedSchoolIds)
          })
        })
      })
    }

    if (studentIds) {
      const ids = studentIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (ids.length > 0) {
        query.whereIn('studentId', ids)
      }
    } else if (studentId) {
      query.where('studentId', studentId)
    }

    if (search) {
      query.whereHas('student', (sq) => {
        sq.whereHas('user', (uq) => {
          uq.where((sub) => {
            sub.where('name', 'ilike', `%${search}%`).orWhere('email', 'ilike', `%${search}%`)
          })
        })
      })
    }

    if (contractId) {
      query.where('contractId', contractId)
    }

    if (academicPeriodId) {
      query.whereHas('payments', (paymentsQuery) => {
        paymentsQuery.whereHas('studentHasLevel', (enrollmentQuery) => {
          enrollmentQuery.where('academicPeriodId', academicPeriodId)
        })
      })
    }

    if (courseId) {
      query.whereHas('payments', (paymentsQuery) => {
        paymentsQuery.whereHas('studentHasLevel', (enrollmentQuery) => {
          enrollmentQuery.whereHas('levelAssignedToCourseAcademicPeriod', (levelCourseQuery) => {
            levelCourseQuery.whereHas('courseHasAcademicPeriod', (coursePeriodQuery) => {
              coursePeriodQuery.where('courseId', courseId)
            })
          })
        })
      })
    }

    if (classId) {
      query.whereHas('payments', (paymentsQuery) => {
        paymentsQuery.whereHas('studentHasLevel', (enrollmentQuery) => {
          enrollmentQuery.where('classId', classId)
        })
      })
    }

    if (dueDateFrom) {
      query.where('dueDate', '>=', dueDateFrom)
    }

    if (dueDateTo) {
      query.where('dueDate', '<=', dueDateTo)
    }

    if (status) {
      const statuses = status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (statuses.length === 1) {
        query.where('status', statuses[0])
      } else if (statuses.length > 1) {
        query.whereIn('status', statuses)
      }
    }

    if (type) {
      query.where('type', type)
    }

    if (month && year) {
      query.where((referenceQuery) => {
        referenceQuery
          .where((invoiceReferenceQuery) => {
            invoiceReferenceQuery.where('month', month).where('year', year)
          })
          .orWhereHas('payments', (paymentsQuery) => {
            paymentsQuery.where('month', month).where('year', year)
          })
      })
    } else {
      if (month) {
        query.where((referenceQuery) => {
          referenceQuery.where('month', month).orWhereHas('payments', (paymentsQuery) => {
            paymentsQuery.where('month', month)
          })
        })
      }

      if (year) {
        query.where((referenceQuery) => {
          referenceQuery.where('year', year).orWhereHas('payments', (paymentsQuery) => {
            paymentsQuery.where('year', year)
          })
        })
      }
    }

    const sortableColumns = new Set([
      'dueDate',
      'reference',
      'baseAmount',
      'discountAmount',
      'chargedAmount',
      'totalAmount',
      'status',
      'month',
      'year',
    ])

    const orderByColumn = sortableColumns.has(sortBy) ? sortBy : 'dueDate'
    const orderByDirection = sortDirection === 'desc' ? 'desc' : 'asc'
    if (orderByColumn === 'reference') {
      query.orderBy('year', orderByDirection).orderBy('month', orderByDirection)
    } else {
      query.orderBy(orderByColumn, orderByDirection)
    }

    const invoices = await query.paginate(page, limit)

    const items = invoices.all()
    const metadata = invoices.getMeta()
    return serialize(InvoiceTransformer.paginate(items, metadata))
  }
}
