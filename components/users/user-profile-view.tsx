"use client";

import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
  Wallet,
  TrendingUp,
  Activity,
  CheckCircle2,
  Percent,
  FileText,
  Landmark,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, QrisSummary } from '@/types/user.type'
import { SubMerchant } from '@/types/sub-merchant.type'
import { PaginationMeta } from '@/types/api.type'
import { format } from 'date-fns'
import KYBInfoCard from './kyb-info-card'
import ProjectSecretCard from './project-secret-card'
import { useState, use, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Store, FileUp } from 'lucide-react'
import AssignSubMerchantModal from './assign-sub-merchant-modal'
import UserBulkAssignModal from './user-bulk-assign-modal'
import UserSubMerchantTable from './user-submerchant-table'
import UserDailyReportsModal from './user-daily-reports-modal'
import UserDisburseReportsModal from './user-disburse-reports-modal'
import UserVAReportsModal from './user-va-reports-modal'
import UserBalanceDetailModal from './user-balance-detail-modal'
import UserVABalanceDetailModal from './user-va-balance-detail-modal'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Skeleton for QRIS Summary
// ---------------------------------------------------------------------------
function QrisSummarySkeleton() {
  return (
    <Card className="border-none shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-64 rounded-md bg-muted/70 animate-pulse" />
          </div>
          <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/30 bg-muted/20"
            >
              <div className="h-11 w-11 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted/70 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// QRIS Summary Card Resolver
// ---------------------------------------------------------------------------
function QrisSummaryResolver({ promise }: { promise: Promise<QrisSummary | null> }) {
  const qrisSummary = use(promise)

  const stats: Array<{
    label: string
    value: string
    icon: typeof Wallet
    color: 'emerald' | 'blue' | 'orange' | 'teal' | 'violet'
    wide?: boolean
  }> = [
    {
      label: 'Current Balance',
      value: `Rp ${parseFloat(qrisSummary?.current_balance || '0').toLocaleString('id-ID')}`,
      icon: Wallet,
      color: 'emerald',
    },
    {
      label: 'Total Revenue',
      value: `Rp ${parseFloat(qrisSummary?.total_revenue || '0').toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Total Tx',
      value: String(qrisSummary?.total_transactions ?? 0),
      icon: Activity,
      color: 'orange',
    },
    {
      label: 'Success Tx',
      value: String(qrisSummary?.success_count ?? 0),
      icon: CheckCircle2,
      color: 'teal',
    },
    {
      label: 'Success Rate',
      value: `${qrisSummary?.success_rate ?? 0}%`,
      icon: Percent,
      color: 'violet',
      wide: true,
    },
  ]

  return (
    <Card className="border-none shadow-xl bg-linear-to-br from-card to-card/50 overflow-hidden">
      <CardContent className="p-6">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Today's QRIS Summary
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time performance and transaction overview for today
            </p>
          </div>
        </div>

        {!qrisSummary ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
            <Activity className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No summary data available for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map(({ label, value, icon: Icon, color, wide }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 rounded-xl bg-background/40 border border-border/50 hover:bg-background/60 transition-colors group${wide ? ' col-span-2 md:col-span-1' : ''}`}
              >
                <div
                  className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform shrink-0`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                    {label}
                  </span>
                  <span className="text-base font-extrabold text-foreground truncate mt-0.5">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Sub Merchant Table Resolver
// ---------------------------------------------------------------------------
function SubMerchantsResolver({
  promise,
  userId,
  smPage,
  smSearch,
  smLimit,
}: {
  promise: Promise<{ data: SubMerchant[]; meta: PaginationMeta | null } | null>
  userId: string
  smPage: number
  smSearch: string
  smLimit: number
}) {
  const result = use(promise)

  return (
    <UserSubMerchantTable
      subMerchants={result?.data || []}
      subMerchantsMeta={result?.meta || null}
      userId={userId}
      currentPage={smPage}
      currentSearch={smSearch}
      currentLimit={smLimit}
    />
  )
}

function SubMerchantSkeleton({ limit }: { limit: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded bg-muted/70 animate-pulse" />
        </div>
      </div>
      <div className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card">
        <div className="w-full h-12 bg-primary/2 border-b border-primary/10" />
        <div className="divide-y">
          {Array.from({ length: limit }).map((_, i) => (
             <div key={i} className="flex gap-4 p-4">
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}



// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
interface UserProfileViewProps {
  user: User
  qrisSummaryPromise: Promise<QrisSummary | null>
  subMerchantsPromise: Promise<{ data: SubMerchant[]; meta: PaginationMeta | null } | null>
  smPage: number
  smSearch: string
  smLimit: number
}

export default function UserProfileView({
  user,
  qrisSummaryPromise,
  subMerchantsPromise,
  smPage,
  smSearch,
  smLimit,
}: UserProfileViewProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isDailyReportsOpen, setIsDailyReportsOpen] = useState(false)
  const [isDisburseReportsOpen, setIsDisburseReportsOpen] = useState(false)
  const [isVAReportsOpen, setIsVAReportsOpen] = useState(false)
  const [isBalanceDetailOpen, setIsBalanceDetailOpen] = useState(false)
  const [isVABalanceDetailOpen, setIsVABalanceDetailOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AssignSubMerchantModal
        userId={user.id}
        userName={user.name || user.business_name || 'Anonymous'}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          router.refresh()
        }}
      />
      <UserBulkAssignModal
        userId={user.id}
        userName={user.name || user.business_name || 'Anonymous'}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          router.refresh()
        }}
      />
      <UserDailyReportsModal
        userId={user.id}
        isOpen={isDailyReportsOpen}
        onClose={() => setIsDailyReportsOpen(false)}
      />
      <UserDisburseReportsModal
        userId={user.id}
        isOpen={isDisburseReportsOpen}
        onClose={() => setIsDisburseReportsOpen(false)}
      />
      <UserVAReportsModal
        userId={user.id}
        isOpen={isVAReportsOpen}
        onClose={() => setIsVAReportsOpen(false)}
      />
      <UserBalanceDetailModal
        userId={user.id}
        currentBalance={parseFloat(user.balance || '0')}
        isOpen={isBalanceDetailOpen}
        onClose={() => setIsBalanceDetailOpen(false)}
      />
      <UserVABalanceDetailModal
        userId={user.id}
        vaBalances={user.va_balances || null}
        isOpen={isVABalanceDetailOpen}
        onClose={() => setIsVABalanceDetailOpen(false)}
      />

      {/* ── Desktop-Optimized User Profile Card ── */}
      <Card className="border-none shadow-xl bg-card overflow-hidden">
        <CardContent className="p-6 md:p-7 space-y-6">
          {/* Top Row: User Identity + Badges + Report Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border/40">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                <UserIcon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    {user.name || user.business_name || 'Anonymous'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.is_active ? 'success' : 'secondary'}
                      className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider"
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge
                      variant={user.is_verified ? 'success' : 'outline'}
                      className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider"
                    >
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground font-mono text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  USER-ID: <span className="font-semibold text-foreground">{user.id}</span>
                </p>
              </div>
            </div>

            {/* Reports Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                onClick={() => setIsDailyReportsOpen(true)}
                variant="outline"
                className="h-10 px-4 text-xs md:text-sm font-bold border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-xs"
              >
                <FileText className="mr-2 h-4 w-4 text-primary" />
                QRIS Reports
              </Button>
              <Button
                onClick={() => setIsDisburseReportsOpen(true)}
                variant="outline"
                className="h-10 px-4 text-xs md:text-sm font-bold border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-xs"
              >
                <FileText className="mr-2 h-4 w-4 text-primary" />
                Disburse Reports
              </Button>
              <Button
                onClick={() => setIsVAReportsOpen(true)}
                variant="outline"
                className="h-10 px-4 text-xs md:text-sm font-bold border-border/60 hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-500/30 transition-all shadow-xs"
              >
                <FileText className="mr-2 h-4 w-4 text-violet-600" />
                VA Reports
              </Button>
            </div>
          </div>

          {/* Bottom Grid: Quick Info & Balances */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Contact Information (6 Cols) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Email</span>
                  <span className="font-semibold text-xs md:text-sm truncate leading-tight">{user.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Phone</span>
                  <span className="font-semibold text-xs md:text-sm truncate leading-tight">{user.phone || '-'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Joined</span>
                  <span className="font-semibold text-xs md:text-sm truncate leading-tight">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Balances Section (6 Cols) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Balance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-600 shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest leading-none mb-1">Balance</span>
                    <span className="text-sm md:text-base font-black text-emerald-600 truncate leading-tight">
                      Rp {parseFloat(user.balance || '0').toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsBalanceDetailOpen(true)}
                  className="h-8 px-3 text-xs font-bold border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800 ml-2 shadow-2xs"
                >
                  Detail
                </Button>
              </div>

              {/* VA Balance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-violet-500/15 text-violet-600 shrink-0">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-violet-600/70 uppercase tracking-widest leading-none mb-1">VA Balance</span>
                    <span className="text-sm md:text-base font-black text-violet-600 truncate leading-tight">
                      Rp {parseFloat(user.va_balances?.available_balance || '0').toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsVABalanceDetailOpen(true)}
                  className="h-8 px-3 text-xs font-bold border-violet-500/20 text-violet-700 hover:bg-violet-500/15 hover:text-violet-800 ml-2 shadow-2xs"
                >
                  Detail
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Today's QRIS Summary ── */}
      <Suspense fallback={<QrisSummarySkeleton />}>
        <QrisSummaryResolver promise={qrisSummaryPromise} />
      </Suspense>

      {/* ── Sub-Merchant Section ── */}
      <div className="w-full">
        <div className="flex justify-end gap-3 mb-4">
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 transition-all active:scale-95 h-9 px-4 text-sm"
          >
            <Store className="mr-2 h-4 w-4" />
            Add SMID
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            className="border-primary/20 hover:bg-primary/5 text-primary font-bold shadow-sm transition-all active:scale-95 h-9 px-4 text-sm"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Bulk Add
          </Button>
        </div>
        <Suspense fallback={<SubMerchantSkeleton limit={smLimit} />}>
          <SubMerchantsResolver
            promise={subMerchantsPromise}
            userId={user.id}
            smPage={smPage}
            smSearch={smSearch}
            smLimit={smLimit}
          />
        </Suspense>
      </div>



      {/* ── Bottom Grid: Credentials & Business Verification ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Project Credentials
          </h3>
          {user.project_secret ? (
            <ProjectSecretCard projectSecret={user.project_secret} />
          ) : (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mb-4 opacity-10" />
                <p className="font-medium">No active project credentials found</p>
                <p className="text-xs opacity-60">Credentials will appear here once assigned.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <Building2 className="h-5 w-5 text-primary" />
            Business Verification
          </h3>
          {user.kyb ? (
            <KYBInfoCard kyb={user.kyb} />
          ) : (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mb-4 opacity-10" />
                <p className="font-medium">No business verification data available</p>
                <p className="text-xs opacity-60">Verification status will be shown here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Building2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}
