"use client";

import { User as UserIcon, Mail, Phone, Calendar, ShieldAlert, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/user.type'
import { format } from 'date-fns'
import KYBInfoCard from './kyb-info-card'
import ProjectSecretCard from './project-secret-card'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Store } from 'lucide-react'
import AssignSubMerchantModal from './assign-sub-merchant-modal'
import UserSubMerchantTable from './user-submerchant-table'
import UserBulkAssignModal from './user-bulk-assign-modal'
import { FileUp } from 'lucide-react'

interface UserProfileViewProps {
  user: User
}

export default function UserProfileView({ user }: UserProfileViewProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AssignSubMerchantModal
        userId={user.id}
        userName={user.name || user.business_name || 'Anonymous'}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          window.location.reload()
        }}
        initialData={null}
        initialAcquirerName={user.project_secret?.acquirer?.name}
      />
      <UserBulkAssignModal
        userId={user.id}
        userName={user.name || user.business_name || 'Anonymous'}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          window.location.reload()
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-2 overflow-hidden border-none shadow-xl bg-linear-to-br from-card to-card/50">
          <CardContent className="p-0">
            <div className="h-20 bg-primary/5 relative border-b border-primary/10">
              <div className="absolute -bottom-8 left-8">
                <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl border-4 border-background transform transition-transform hover:scale-105 duration-300">
                  <UserIcon className="h-10 w-10" />
                </div>
              </div>
            </div>
            <div className="pt-12 pb-8 px-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">
                    {user.name || user.business_name || 'Anonymous'}
                  </h2>
                  <p className="text-muted-foreground font-mono text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                    USER-ID: {user.id}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Badge variant={user.is_active ? 'success' : 'secondary'} className="rounded-full px-4 border-none shadow-sm text-[10px] font-bold uppercase tracking-wider">
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={user.is_verified ? 'success' : 'outline'} className="rounded-full px-4 border-none shadow-sm text-[10px] font-bold uppercase tracking-wider">
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => setIsAssignModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 px-6 h-11"
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Add SMID
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsBulkModalOpen(true)}
                    className="border-primary/20 hover:bg-primary/5 text-primary font-bold shadow-sm transition-all active:scale-95 px-6 h-11 hover:text-primary/80"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Bulk Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact Card */}
        <Card className="border-none shadow-xl bg-card overflow-hidden">
          <CardContent className="p-6 h-full flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</span>
                  <span className="font-semibold truncate text-xs">{user.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</span>
                  <span className="font-semibold text-xs">{user.phone || '-'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Joined</span>
                  <span className="font-semibold text-xs">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-primary/5 border border-primary/10 group">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Balance</span>
                <span className="text-xl font-black text-primary">
                  Rp {parseFloat(user.balance || '0').toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Merchant Section - High Priority Table */}
      <div className="w-full">
        <UserSubMerchantTable 
          submerchants={user.sub_merchants || []} 
          userId={user.id} 
        />
      </div>

      {/* Bottom Grid: Credentials & Business Verification */}
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
