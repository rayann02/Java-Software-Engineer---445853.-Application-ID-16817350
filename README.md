# Java-Software-Engineer---445853.-Application-ID-16817350

## Cinema-Tickets

## Overview

This is a JavaScript solution for the cinema tickets coding exercise.

The service checks whether a ticket purchase is valid, works out the correct total cost, works out how many seats need to be booked, and then uses the existing payment and seat reservation services.

## Ticket Prices

- Adult: £25
- Child: £15
- Infant: £0

## Rules Followed

- more than one ticket can be bought at the same time
- no more than 25 tickets can be bought in one purchase
- infants do not pay for a ticket
- infants do not get a seat
- child tickets cannot be bought without an adult ticket
- infant tickets cannot be bought without an adult ticket
- infants cannot outnumber adults, because each infant must sit on an adult's lap

## Invalid Purchases

A ticket purchase is rejected if:

- the account id is not valid
- no ticket requests are provided
- the total number of tickets is zero
- more than 25 tickets are requested
- child tickets are bought without an adult ticket
- infant tickets are bought without an adult ticket
- there are more infants than adults
- a ticket type is not recognised
- a ticket quantity is negative

## Note

A request can include `0` for a ticket type, such as `0` child tickets or `0` infant tickets.

That is allowed, but the purchase will be invalid if the total number of tickets being bought is `0`.

## Testing

The tests cover:

- valid purchases
- invalid purchases
- payment amount calculation
- seat reservation calculation
- ticket request validation
- immutability of `TicketTypeRequest`

## Run Tests

npm test

