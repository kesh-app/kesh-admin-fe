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
import { Disbursement } from '@/types/disbursement.type'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { ClientDate } from '@/components/client-date'
import { getDisbursementStatusColor } from './disbursement-status'

interface DisbursementsTableProps {
  disbursements: Disbursement[]
}

export default function DisbursementsTable({ disbursements }: DisbursementsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Partner Ref No</TableHead>
            <TableHead>Beneficiary</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disbursements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No disbursements found.
              </TableCell>
            </TableRow>
          ) : (
            disbursements.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs">
                  <ClientDate date={item.createdAt} format="yyyy-MM-dd HH:mm:ss" />
                </TableCell>
                <TableCell className="font-medium text-xs">{item.partnerRefNo}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {item.beneficiaryName || '-'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.beneficiaryAccountNo}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.beneficiaryBankCode}</Badge>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: item.currency?.trim() || 'IDR',
                  }).format(parseFloat(item.amountValue))}
                </TableCell>
                <TableCell>
                  <Badge className={getDisbursementStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/disbursements/${item.id}`}>
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
