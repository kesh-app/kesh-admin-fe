import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VATransaction } from '@/types/va-transaction.type'
import { ClientDate } from '@/components/client-date'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface VATransactionsDetailProps {
  transaction: VATransaction
}

export default function VATransactionsDetail({ transaction }: VATransactionsDetailProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg">Transaction Information</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusIcon(transaction.status)}
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-medium text-sm">{transaction.id}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Payment Request ID</p>
            <p className="font-medium text-sm">{transaction.payment_request_id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">VA Number</p>
            <p className="font-medium text-sm">{transaction.virtual_account_no}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">VA Name</p>
            <p className="font-medium text-sm">{transaction.virtual_account_name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Customer No</p>
            <p className="font-medium text-sm">{transaction.customer_no}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Provider</p>
            <p className="font-medium text-sm">{transaction.provider}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Partner Service ID</p>
            <p className="font-medium text-sm">{transaction.partner_service_id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Sub Type</p>
            <p className="font-medium text-sm">{transaction.sub_type}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Direction</p>
            <p className="font-medium text-sm">{transaction.direction}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium text-lg text-primary">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: transaction.currency || 'IDR',
              }).format(parseFloat(transaction.total_amount))}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fee Amount</p>
            <p className="font-medium text-sm">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: transaction.currency || 'IDR',
              }).format(parseFloat(transaction.fee_amount))}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium text-sm">
              <ClientDate date={transaction.created_at} format="PP pp" />
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Updated At</p>
            <p className="font-medium text-sm">
              <ClientDate date={transaction.updated_at} format="PP pp" />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
