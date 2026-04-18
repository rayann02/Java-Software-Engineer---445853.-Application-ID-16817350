import test from 'node:test'
import assert from 'node:assert/strict'

import TicketService from '../src/pairtest/TicketService.js'
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js'
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js'

class PaymentServiceSpy {
  paymentCalls = []

  makePayment(accountId, totalAmountToPay) {
    this.paymentCalls.push({ accountId, totalAmountToPay })
  }
}

class SeatReservationServiceSpy {
  reservationCalls = []

  reserveSeat(accountId, totalSeatsToAllocate) {
    this.reservationCalls.push({ accountId, totalSeatsToAllocate })
  }
}

function createSubmissionTestContext() {
  const paymentService = new PaymentServiceSpy()
  const seatReservationService = new SeatReservationServiceSpy()
  const ticketService = new TicketService(paymentService, seatReservationService)

  return { ticketService, paymentService, seatReservationService }
}

test('Rayan Mohammed submission: valid purchase scenarios', async (t) => {
  const validScenarios = [
    {
      name: 'adult only purchase',
      accountId: 1,
      requests: [new TicketTypeRequest('ADULT', 2)],
      expectedPayment: 50,
      expectedSeats: 2,
    },
    {
      name: 'adult, child, and infant purchase',
      accountId: 1,
      requests: [
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('CHILD', 3),
        new TicketTypeRequest('INFANT', 1),
      ],
      expectedPayment: 70,
      expectedSeats: 4,
    },
    {
      name: 'infants allowed when adults are enough',
      accountId: 5,
      requests: [
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('INFANT', 2),
      ],
      expectedPayment: 50,
      expectedSeats: 2,
    },
    {
      name: 'maximum valid purchase',
      accountId: 7,
      requests: [new TicketTypeRequest('ADULT', 25)],
      expectedPayment: 625,
      expectedSeats: 25,
    },
    {
      name: 'zero child and infant requests do not affect a valid adult purchase',
      accountId: 9,
      requests: [
        new TicketTypeRequest('ADULT', 25),
        new TicketTypeRequest('CHILD', 0),
        new TicketTypeRequest('INFANT', 0),
      ],
      expectedPayment: 625,
      expectedSeats: 25,
    },
  ]

  for (const scenario of validScenarios) {
    await t.test(scenario.name, () => {
      const { ticketService, paymentService, seatReservationService } =
        createSubmissionTestContext()

      ticketService.purchaseTickets(scenario.accountId, ...scenario.requests)

      assert.deepEqual(paymentService.paymentCalls, [
        {
          accountId: scenario.accountId,
          totalAmountToPay: scenario.expectedPayment,
        },
      ])

      assert.deepEqual(seatReservationService.reservationCalls, [
        {
          accountId: scenario.accountId,
          totalSeatsToAllocate: scenario.expectedSeats,
        },
      ])
    })
  }
})

test('Rayan Mohammed submission: invalid purchase scenarios', async (t) => {
  const invalidScenarios = [
    {
      name: 'rejects invalid account id',
      action: (ticketService) =>
        ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1)),
    },
    {
      name: 'rejects purchase without ticket requests',
      action: (ticketService) => ticketService.purchaseTickets(1),
    },
    {
      name: 'rejects child tickets without adult tickets',
      action: (ticketService) =>
        ticketService.purchaseTickets(1, new TicketTypeRequest('CHILD', 1)),
    },
    {
      name: 'rejects infant tickets without adult tickets',
      action: (ticketService) =>
        ticketService.purchaseTickets(1, new TicketTypeRequest('INFANT', 1)),
    },
    {
      name: 'rejects more infants than adults',
      action: (ticketService) =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('INFANT', 2),
        ),
    },
    {
      name: 'rejects more than 25 total tickets',
      action: (ticketService) =>
        ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26)),
    },
    {
      name: 'rejects purchases where the total number of tickets is zero',
      action: (ticketService) =>
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest('ADULT', 0),
          new TicketTypeRequest('CHILD', 0),
          new TicketTypeRequest('INFANT', 0),
        ),
    },
  ]

  for (const scenario of invalidScenarios) {
    await t.test(scenario.name, () => {
      const { ticketService, paymentService, seatReservationService } =
        createSubmissionTestContext()

      assert.throws(
        () => scenario.action(ticketService),
        InvalidPurchaseException,
      )

      assert.deepEqual(paymentService.paymentCalls, [])
      assert.deepEqual(seatReservationService.reservationCalls, [])
    })
  }
})

test(
  'Rayan Mohammed submission: invalid TicketTypeRequest creation scenarios',
  async (t) => {
    const invalidRequestScenarios = [
      {
        name: 'rejects negative ticket quantity',
        action: () => new TicketTypeRequest('ADULT', -1),
        expectedError: /cannot be negative/,
      },
      {
        name: 'rejects unsupported ticket type',
        action: () => new TicketTypeRequest('SENIOR', 1),
        expectedError: /ticketType must be/,
      },
    ]

    for (const scenario of invalidRequestScenarios) {
      await t.test(scenario.name, () => {
        assert.throws(scenario.action, scenario.expectedError)
      })
    }
  },
)

test('Rayan Mohammed submission: ticket requests are immutable', () => {
  const ticketRequest = new TicketTypeRequest('ADULT', 2)

  assert.equal(Object.isFrozen(ticketRequest), true)
  assert.throws(() => {
    ticketRequest.ticketType = 'CHILD'
  }, TypeError)
  assert.equal(ticketRequest.getTicketType(), 'ADULT')
  assert.equal(ticketRequest.getNoOfTickets(), 2)
})
