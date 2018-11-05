'use strict'

const Raven = require('raven')

const Config = use('Config')
const Env = use('Env') // pega as variaveis de ambiente
const Youch = require('youch') // formatador de erros
const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  // o que retornar ao usuario final: tipo de menssagem, formato ...
  async handle (error, { request, response }) {
    // response.status(error.status).send(error.message)

    // se for um error de validator
    if (error.name === 'ValidationException') {
      return response.status(error.status).send(error.messages)
    }

    // se ambiente de dev retorna mais informações
    if (Env.get('NODE_ENV') === 'development') {
      const youch = new Youch(error, request.request)
      const errorJSON = await youch.toJSON() // transforma em JSON

      return response.status(error.status).send(errorJSON)
    }

    return response.status(error.status)
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  // o que fazer com o erro, armazenar ...
  async report (error, { request }) {
    Raven.config(Config.get('services.sentry.dsn'))
    Raven.captureException(error)
  }
}

module.exports = ExceptionHandler
