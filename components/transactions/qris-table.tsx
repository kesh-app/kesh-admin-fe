'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QrisTransaction, QrisPaymentStatus } from '@/types/qris.type'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface QrisTableProps {
  transactions: QrisTransaction[]
}

export default function QrisTable({ transactions }: QrisTableProps) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Partner Ref</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-xs">
                  {format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell className="font-medium text-xs">{tx.partnerReferenceNo}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{tx.merchantName}</span>
                    <span className="text-xs text-muted-foreground">{tx.merchantId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: tx.currency,
                  }).format(parseFloat(tx.amountValue))}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(tx.paymentStatus)}>
                    {tx.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/transactions/${tx.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
