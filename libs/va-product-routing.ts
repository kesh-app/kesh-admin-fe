import type { SmartVaGeneralCode, SmartVaProvider, VaProduct } from '@/types/va-product.type'

export interface VaProductRoutingInput {
  provider?: SmartVaProvider | string
  general_code?: SmartVaGeneralCode | string | null
  routing_priority?: number
  is_routing_active?: boolean
  denomination_amount?: number | null
  min_amount?: number | null
  max_amount?: number | null
  is_closed_amount?: boolean
}

export function validateVaProductRouting(input: VaProductRoutingInput): string[] {
  const errors: string[] = []

  if (
    input.routing_priority !== undefined &&
    (!Number.isInteger(input.routing_priority) || input.routing_priority < 1)
  ) {
    errors.push('Routing priority must be an integer of at least 1')
  }

  if (
    input.min_amount != null &&
    input.max_amount != null &&
    input.min_amount > input.max_amount
  ) {
    errors.push('Minimum amount cannot exceed maximum amount')
  }

  const hasDenomination = input.denomination_amount != null
  if (input.is_routing_active && input.is_closed_amount && !hasDenomination) {
    errors.push('An active closed-denomination route requires a denomination amount')
  }

  const requiresNobuDenomination =
    input.provider === 'NOBU' &&
    (input.general_code === 'SHOPEEPAY' || input.general_code === 'LINKAJA')

  if (input.is_routing_active && requiresNobuDenomination && !hasDenomination) {
    errors.push(`An active NOBU ${input.general_code} route requires a denomination amount`)
  }

  return [...new Set(errors)]
}

export function getConfiguredPrimary(routes: VaProduct[]): VaProduct | null {
  const activeRoutes = routes.filter((route) => route.is_routing_active)
  if (activeRoutes.length === 0) return null

  return [...activeRoutes].sort(
    (left, right) =>
      left.routing_priority - right.routing_priority ||
      left.provider.localeCompare(right.provider) ||
      left.code.localeCompare(right.code),
  )[0]
}
