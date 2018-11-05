'use strict'

const Database = use('Database') // para transactions
const User = use('App/Models/User')

// ctx = contexto da request => { request, response }
class UserController {
  async store ({ request }) {
    const data = request.only(['name', 'email', 'password'])
    // const addresses = request.input('addresses')

    const trx = await Database.beginTransaction()

    const user = await User.create(data, trx)
    // await user.addresses().createMany(addresses, trx)

    await trx.commit() // se nao houver erros efetua um commit => salvar alterações no banco

    return user
  }
}

module.exports = UserController
