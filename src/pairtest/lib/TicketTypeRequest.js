/**
 * Immutable ticket request value object.
 * Author: Rayan Mohammed
 */
export default class TicketTypeRequest {
  static #validTicketTypes = ['ADULT', 'CHILD', 'INFANT']

  #ticketType
  #numberOfTickets

  constructor(ticketType, numberOfTickets) {
    if (!TicketTypeRequest.#validTicketTypes.includes(ticketType)) {
      throw new TypeError(
        `ticketType must be ${TicketTypeRequest.#validTicketTypes
          .slice(0, -1)
          .join(', ')}, or ${TicketTypeRequest.#validTicketTypes.at(-1)}.`,
      )
    }

    if (!Number.isInteger(numberOfTickets)) {
      throw new TypeError('numberOfTickets must be an integer.')
    }

    if (numberOfTickets < 0) {
      throw new TypeError('numberOfTickets cannot be negative.')
    }

    this.#ticketType = ticketType
    this.#numberOfTickets = numberOfTickets

    Object.freeze(this)
  }

  getNoOfTickets() {
    return this.#numberOfTickets
  }

  getTicketType() {
    return this.#ticketType
  }
}