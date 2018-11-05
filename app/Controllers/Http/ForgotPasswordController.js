'use strict'

const moment = require('moment')
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email') // busca 1 campo

      // busca 1 registro por outra coluna=email
      // ...OrFail: se não encontrar retorna um erro e vai pro catch
      const user = await User.findByOrFail('email', email)

      // token com 10 bytes e converte para hexadecimal
      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'], // template
        {
          // parametros enviados ao email
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`
        },
        message => {
          message
            .to(user.email)
            .from('mauricio.nq@hotmail.com', 'Jesus Cristo')
            .subject('Recuperação de senha') // assunto
        }
      )
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Esse email existe ?'
        }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password, name, newPassword } = request.all()

      const user = await User.findByOrFail('token', token)

      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'Token de recuperação está expirado' } })
      }

      user.token = null
      user.token_created_at = null

      user.password = newPassword
      user.name = name

      await user.save()
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Algo deu errado ao resetar sua senha!' } })
    }
  }
}

module.exports = ForgotPasswordController
