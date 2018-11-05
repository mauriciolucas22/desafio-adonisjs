'use strict'

const Model = use('Model')

// informa as recerencias
class Event extends Model {
  user () {
    return this.belongsTo('App/Models/User') // pertence a um user
  }

  /* tasks () {
    return this.hasMany('App/Models/Task') // pode contar varias tasks reacionadas a ele
  } */
}

module.exports = Event
