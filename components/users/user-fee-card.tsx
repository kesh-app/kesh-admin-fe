'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt, Edit3, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import UserFeeEditModal from './user-fee-edit-modal'

interface UserFeeCardProps {
  userId: string
  feeDisburse?: string | number | null
  feeVa?: string | number | null
}

export default function UserFeeCard({
  userId,
  feeDisburse,
  feeVa,
}: UserFeeCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const numFeeDisburse = Number(feeDisburse) || 0
  const numFeeVa = Number(feeVa) || 0

  return (
    <>
      <UserFeeEditModal
        userId={userId}
        initialFeeVa={numFeeVa}
        initialFeeDisburse={numFeeDisburse}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <Card className="border-none shadow-xl bg-card overflow-hidden">
        <CardContent className="p-6 md:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Fee Configuration
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pengaturan biaya transaksi untuk user ini
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="h-9 px-4 text-xs font-bold border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Edit3 className="mr-2 h-3.5 w-3.5" />
              Edit Fee
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fee VA */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    Fee Virtual Account (VA)
                  </span>
                  <span className="text-base font-extrabold text-foreground truncate mt-0.5">
                    Rp {numFeeVa.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Disburse */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-600 shrink-0">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    Fee Disburse
                  </span>
                  <span className="text-base font-extrabold text-foreground truncate mt-0.5">
                    Rp {numFeeDisburse.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
