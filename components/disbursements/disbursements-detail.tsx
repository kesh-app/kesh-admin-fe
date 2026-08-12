import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Disbursement } from '@/types/disbursement.type'
import { ClientDate } from '@/components/client-date'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getDisbursementStatusColor } from './disbursement-status'

interface DisbursementsDetailProps {
  disbursement: Disbursement
}

export default function DisbursementsDetail({ disbursement }: DisbursementsDetailProps) {
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

  const currency = disbursement.currency?.trim() || 'IDR'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg">Disbursement Information</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusIcon(disbursement.status)}
          <Badge className={getDisbursementStatusColor(disbursement.status)}>
            {disbursement.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Disbursement ID</p>
            <p className="font-medium text-sm">{disbursement.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Partner Ref No</p>
            <p className="font-medium text-sm">{disbursement.partnerRefNo}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Reference No</p>
            <p className="font-medium text-sm">{disbursement.referenceNo || '-'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Method</p>
            <p className="font-medium text-sm">{disbursement.method || '-'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Beneficiary Name</p>
            <p className="font-medium text-sm">{disbursement.beneficiaryName || '-'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Beneficiary Account</p>
            <p className="font-medium text-sm">{disbursement.beneficiaryAccountNo}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Beneficiary Bank Code</p>
            <p className="font-medium text-sm">{disbursement.beneficiaryBankCode}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Source Account</p>
            <p className="font-medium text-sm">{disbursement.sourceAccountNo}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium text-lg text-primary">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency,
              }).format(parseFloat(disbursement.amountValue))}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Failure Reason</p>
            <p className="font-medium text-sm">{disbursement.failureReason || '-'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created At</p>
            <p className="font-medium text-sm">
              <ClientDate date={disbursement.createdAt} format="PP pp" />
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Processed At</p>
            <p className="font-medium text-sm">
              {disbursement.processedAt ? (
                <ClientDate date={disbursement.processedAt} format="PP pp" />
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
