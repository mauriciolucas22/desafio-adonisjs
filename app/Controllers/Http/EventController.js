'use strict'

const Event = use('App/Models/Event')
const moment = require('moment')
const Mail = use('Mail')

/**
 * Resourceful controller for interacting with projects
 */
class EventController {
  async index ({ request }) {
    const { page } = request.get()

    const events = await Event.query()
      .with('user')
      .paginate(page)

    return events
  }

  async store ({ request, response, auth }) {
    const data = request.only(['title', 'location', 'date', 'hours'])

    const check = Event.query()
      .where('date', data.date)
      .first()

    /* if (check) {
      return 'Já existe um evento nessa hora'
    } */

    const event = await Event.create({
      ...data,
      user_id: auth.user.id
    })

    return event
  }

  async show ({ response, params, auth }) {
    // const event = await Event.findOrFail(params.id)
    const event = await Event.query()
      .where('date', params.id)
      .first()

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'não autorizado!'
        }
      })
    }

    await event.load('user')

    return event
  }

  async update ({ response, params, request, auth }) {
    const event = await Event.findOrFail(params.id)
    const data = request.only(['title', 'location', 'date', 'hours'])

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'não autorizado!'
        }
      })
    }

    const isExpired = moment()
      .subtract('1', 'days')
      .isAfter(event.date)

    if (isExpired) {
      return response.status(400).send({
        error: {
          message: 'Evento já passou!'
        }
      })
    }

    event.merge(data) // colocas as info recebidas dentro desso project

    await event.save()

    return event
  }

  async share ({ response, auth, params, request }) {
    const event = await Event.findOrFail(params.id)
    const to = request.input('to')

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'não autorizado!'
        }
      })
    }

    await Mail.send(
      ['emails.event'], // template
      {
        // parametros enviados ao email
        title: event.title,
        date: moment(event.date).format('DD-MM-YYYY'),
        location: event.location,
        hours: event.hours,
        name: event.user.name
      },
      message => {
        message
          .to(to)
          .from(auth.user.email, event.title)
          .subject(event.title) // assunto
      }
    )

    return response.status(200).send()
  }

  async destroy ({ response, auth, params }) {
    const event = await Event.findOrFail(params.id)

    if (event.user_id !== auth.user.id) {
      return response.status(401).send({
        error: {
          message: 'não autorizado!'
        }
      })
    }

    const isExpired = moment()
      .subtract('1', 'days')
      .isAfter(event.date)

    if (isExpired) {
      return response.status(400).send({
        error: {
          message: 'Evento já passou. Voçê não pode mais excluí-lo!'
        }
      })
    }

    await event.delete()
  }
}

module.exports = EventController
