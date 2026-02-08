import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import CheckoutException from './checkout_exception.js'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const accepts = ctx.request.accepts(['html', 'json'])
    if (accepts === 'html') {
      return super.handle(error, ctx)
    }

    if (error instanceof CheckoutException) {
      return ctx.response.status(error.status).json({
        code: error.code,
        description: error.description,
        ...(error.meta && { meta: error.meta }),
      })
    }

    const validationMessages = (error as { messages?: unknown }).messages
    if (validationMessages) {
      return ctx.response.status(422).json({
        code: 'VALIDATION_ERROR',
        description: 'Validation failed',
        meta: { messages: validationMessages },
      })
    }

    if (error instanceof Exception) {
      const description =
        app.inProduction && error.status >= 500 ? 'Internal server error' : error.message

      return ctx.response.status(error.status).json({
        code: (error as { code?: string }).code ?? error.name ?? 'ERROR',
        description,
      })
    }

    const status = (error as { status?: number }).status ?? 500
    const description =
      app.inProduction && status >= 500
        ? 'Internal server error'
        : ((error as { message?: string }).message ?? 'Internal server error')

    return ctx.response.status(status).json({
      code: 'INTERNAL_SERVER_ERROR',
      description,
    })
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
