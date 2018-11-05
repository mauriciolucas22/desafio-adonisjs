'use strict'

const Schema = use('Schema')

class ProjectSchema extends Schema {
  up () {
    this.create('events', (table) => {
      table.increments()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.string('title').notNullable()
      table.text('location').notNullable()
      table.date('date').notNullable()
      table.time('hours').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('events')
  }
}

module.exports = ProjectSchema
