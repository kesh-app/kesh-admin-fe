/** Shared status presentation for the disbursement module. */
export function getDisbursementStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'SUCCESS':
      return 'bg-green-100 text-green-700 hover:bg-green-100'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
    case 'FAILED':
      return 'bg-red-100 text-red-700 hover:bg-red-100'
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
  }
}

/**
 * Disbursement events carry the provider's numeric code, not a word — the timeline
 * would otherwise read "00" / "03" / "06".
 */
export function labelEventStatus(code: string | null) {
  switch (code) {
    case '00':
      return 'SUCCESS'
    case '03':
      return 'PENDING'
    case '06':
      return 'FAILED'
    default:
      return code || 'UNKNOWN'
  }
}
