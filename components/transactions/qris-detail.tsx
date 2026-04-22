'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrisTransaction, QrisPaymentStatus } from '@/types/qris.type'
import { format } from 'date-fns'

interface QrisDetailProps {
  transaction: QrisTransaction
}

export default function QrisDetail({ transaction }: QrisDetailProps) {
  const getStatusColor = (status: QrisPaymentStatus) => {
    switch (status) {
      case QrisPaymentStatus.SUCCESS:
        return 'bg-green-100 text-green-700 hover:bg-green-100'
      case QrisPaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
      case QrisPaymentStatus.FAILED:
        return 'bg-red-100 text-red-700 hover:bg-red-100'
      case QrisPaymentStatus.REFUNDED:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100'
    }
  }

  const infoItems = [
    { label: 'Transaction ID', value: transaction.id },
    { label: 'Provider', value: transaction.provider },
    { label: 'Partner Ref No', value: transaction.partnerReferenceNo },
    { label: 'Provider Ref No', value: transaction.providerReferenceNo || '-' },
    { label: 'Retrieval Ref No', value: transaction.retrievalReferenceNo || '-' },
    { label: 'Merchant ID', value: transaction.merchantId },
    { label: 'Merchant Name', value: transaction.merchantName },
    { label: 'Store ID', value: transaction.storeId },
    { label: 'Payment Channel', value: transaction.paymentChannel },
    { label: 'Amount', value: `${transaction.currency} ${new Intl.NumberFormat('id-ID').format(parseFloat(transaction.amountValue))}` },
    { label: 'Created At', value: format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm:ss') },
    { label: 'Expires At', value: format(new Date(transaction.expiresAt), 'yyyy-MM-dd HH:mm:ss') },
    { label: 'Paid At', value: transaction.paidAt ? format(new Date(transaction.paidAt), 'yyyy-MM-dd HH:mm:ss') : '-' },
    { label: 'Last Status At', value: format(new Date(transaction.lastStatusAt), 'yyyy-MM-dd HH:mm:ss') },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Core Information</CardTitle>
        <Badge className={getStatusColor(transaction.paymentStatus)}>
          {transaction.paymentStatus}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {infoItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-sm font-semibold break-all">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        
        {transaction.qrContent && (
          <div className="mt-8 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              QR Content
            </p>
            <div className="bg-muted p-3 rounded text-[10px] font-mono break-all line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
              {transaction.qrContent}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
