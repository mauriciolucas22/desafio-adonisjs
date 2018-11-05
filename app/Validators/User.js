'use strict'

const Antl = use('Antl')

class User {
  // todos os campos sejam validados ao mesmo tempo, então todas as mensagens são retornadas quando ouver erro
  get validateAll () {
    return true
  }
  // regras impostas sobre os campos da request
  get rules () {
    return {
      // validation rules
      name: 'required|unique:users', // obrigatorio|unico:naTabelaUsers
      email: 'required|email|unique:users', // obrigatorio|formatoEmailCom@|unico:naTabelaUsers
      password: 'required|confirmed' // obrigatirio|
    }
  }

  get messages () {
    return Antl.list('validation')
  }
}

module.exports = User
