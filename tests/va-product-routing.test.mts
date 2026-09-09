import assert from 'node:assert/strict'
import test from 'node:test'

import { getConfiguredPrimary, validateVaProductRouting } from '../libs/va-product-routing.ts'
import type { VaProduct } from '../types/va-product.type.ts'

function route(overrides: Partial<VaProduct> = {}): VaProduct {
  return {
    id: 'route-id',
    product_name: 'DANA',
    code: 'DANA',
    provider: 'ICARE',
    general_code: 'DANA',
    routing_priority: 10,
    is_routing_active: true,
    denomination_amount: null,
    min_amount: null,
    max_amount: null,
    is_closed_amount: false,
    fee_amount: 1000,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

test('routing priority must be a positive integer', () => {
  assert.deepEqual(validateVaProductRouting({ routing_priority: 0 }), [
    'Routing priority must be an integer of at least 1',
  ])
  assert.deepEqual(validateVaProductRouting({ routing_priority: 1.5 }), [
    'Routing priority must be an integer of at least 1',
  ])
})

test('minimum amount cannot exceed maximum amount', () => {
  assert.deepEqual(validateVaProductRouting({ min_amount: 20_000, max_amount: 10_000 }), [
    'Minimum amount cannot exceed maximum amount',
  ])
})

test('active closed and special NOBU routes require denomination', () => {
  assert.deepEqual(
    validateVaProductRouting({
      provider: 'ICARE',
      general_code: 'DANA',
      is_routing_active: true,
      is_closed_amount: true,
    }),
    ['An active closed-denomination route requires a denomination amount'],
  )

  assert.deepEqual(
    validateVaProductRouting({
      provider: 'NOBU',
      general_code: 'SHOPEEPAY',
      is_routing_active: true,
    }),
    ['An active NOBU SHOPEEPAY route requires a denomination amount'],
  )
})

test('configured primary is the active route with the smallest priority', () => {
  const primary = getConfiguredPrimary([
    route({ id: 'inactive', routing_priority: 1, is_routing_active: false }),
    route({ id: 'secondary', provider: 'NOBU', routing_priority: 20 }),
    route({ id: 'primary', provider: 'LOKETBAYAR', routing_priority: 10 }),
  ])

  assert.equal(primary?.id, 'primary')
  assert.equal(getConfiguredPrimary([route({ is_routing_active: false })]), null)
})

