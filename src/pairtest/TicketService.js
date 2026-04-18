import TicketTypeRequest from './lib/TicketTypeRequest.js'
import InvalidPurchaseException from './lib/InvalidPurchaseException.js'
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js'
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js'

const TICKET_PRICES = {
  ADULT: 25,
  CHILD: 15,
  INFANT: 0,
}

const MAXIMUM_TICKETS_PER_PURCHASE = 25

/**
 * Ticket purchase service implementation for the cinema tickets coding exercise.
 * Author: Rayan Mohammed
 */
export default class TicketService {
  #paymentService
  #seatReservationService

  constructor(
    paymentService = new TicketPaymentService(),
    seatReservationService = new SeatReservationService(),
  ) {
    this.#paymentService = paymentService
    this.#seatReservationService = seatReservationService
  }

  purchaseTickets(accountId, ...ticketRequests) {
    this.#validateAccountId(accountId)
    this.#validateTicketRequests(ticketRequests)

    const ticketSummary = this.#buildTicketSummary(ticketRequests)
    const adultTicketCount = ticketSummary.ADULT
    const childTicketCount = ticketSummary.CHILD
    const infantTicketCount = ticketSummary.INFANT

    this.#validateBusinessRules(
      adultTicketCount,
      childTicketCount,
      infantTicketCount,
    )

    const totalAmountToPay = this.#calculateTotalAmount(
      adultTicketCount,
      childTicketCount,
    )
    const totalSeatsToReserve = this.#calculateTotalSeats(
      adultTicketCount,
      childTicketCount,
    )

    this.#paymentService.makePayment(accountId, totalAmountToPay)
    this.#seatReservationService.reserveSeat(accountId, totalSeatsToReserve)
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException(
        'Account id must be an integer greater than zero.',
      )
    }
  }

  #validateTicketRequests(ticketRequests) {
    if (!Array.isArray(ticketRequests) || ticketRequests.length === 0) {
      throw new InvalidPurchaseException(
        'At least one ticket request must be provided.',
      )
    }

    for (const ticketRequest of ticketRequests) {
      if (!(ticketRequest instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(
          'Each ticket request must be a valid TicketTypeRequest.',
        )
      }
    }
  }

  #buildTicketSummary(ticketRequests) {
    const ticketSummary = {
      ADULT: 0,
      CHILD: 0,
      INFANT: 0,
    }

    for (const ticketRequest of ticketRequests) {
      ticketSummary[ticketRequest.getTicketType()] +=
        ticketRequest.getNoOfTickets()
    }

    return ticketSummary
  }

  #validateBusinessRules(adultTicketCount, childTicketCount, infantTicketCount) {
    const totalRequestedTickets =
      adultTicketCount + childTicketCount + infantTicketCount

    if (totalRequestedTickets === 0) {
      throw new InvalidPurchaseException(
        'At least one ticket must be purchased.',
      )
    }

    if (totalRequestedTickets > MAXIMUM_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(
        `A maximum of ${MAXIMUM_TICKETS_PER_PURCHASE} tickets can be purchased at one time.`,
      )
    }

    if (adultTicketCount === 0 && (childTicketCount > 0 || infantTicketCount > 0)) {
      throw new InvalidPurchaseException(
        'Child and infant tickets cannot be purchased without an adult ticket.',
      )
    }

    if (infantTicketCount > adultTicketCount) {
      throw new InvalidPurchaseException(
        'Each infant must be accompanied by one adult.',
      )
    }
  }

  #calculateTotalAmount(adultTicketCount, childTicketCount) {
    return (
      adultTicketCount * TICKET_PRICES.ADULT +
      childTicketCount * TICKET_PRICES.CHILD +
      TICKET_PRICES.INFANT
    )
  }

  #calculateTotalSeats(adultTicketCount, childTicketCount) {
    return adultTicketCount + childTicketCount
  }
}
