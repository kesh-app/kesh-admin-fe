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
import { VATransaction } from '@/types/va-transaction.type'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { ClientDate } from '@/components/client-date'

interface VATransactionsTableProps {
  transactions: VATransaction[]
}

export default function VATransactionsTable({ transactions }: VATransactionsTableProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>VA Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No VA transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-xs">
                  <ClientDate date={tx.created_at} format="yyyy-MM-dd HH:mm:ss" />
                </TableCell>
                <TableCell className="font-medium text-xs">{tx.virtual_account_no}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{tx.virtual_account_name}</span>
                    <span className="text-xs text-muted-foreground">{tx.customer_no}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{tx.provider}</Badge>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: tx.currency || 'IDR',
                  }).format(parseFloat(tx.total_amount))}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/va-transactions/${tx.id}`}>
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
