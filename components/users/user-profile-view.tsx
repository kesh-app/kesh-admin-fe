import { User as UserIcon, Mail, Phone, Calendar, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/user.type'
import { format } from 'date-fns'
import KYBInfoCard from './kyb-info-card'
import ProjectSecretCard from './project-secret-card'

interface UserProfileViewProps {
  user: User
}

export default function UserProfileView({ user }: UserProfileViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      {/* Left Column: Profile Overview */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="overflow-hidden border-none shadow-xl bg-linear-to-br from-card to-card/50">
          <div className="h-24 bg-primary/10 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg border-4 border-background">
                <UserIcon className="h-10 w-10" />
              </div>
            </div>
          </div>
          <CardContent className="pt-14 pb-8 px-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold truncate">
                  {user.name || user.business_name || 'Anonymous'}
                </h2>
                <p className="text-muted-foreground font-mono text-xs flex items-center gap-1 mt-1">
                  ID: {user.id}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-b py-4">
                <Badge variant={user.is_active ? 'success' : 'secondary'} className="px-3">
                  {user.is_active ? 'Account Active' : 'Account Inactive'}
                </Badge>
                <Badge variant={user.is_verified ? 'success' : 'outline'} className="px-3">
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="font-medium truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{user.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Joined {format(new Date(user.created_at), 'PP')}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Last Updated {format(new Date(user.updated_at), 'PP')}</span>
                </div>
              </div>

              {/* Wallet/Balance Card */}
              {/* <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-primary/70 uppercase tracking-widest">
                  <span>Current Balance</span>
                  <Wallet className="h-3 w-3" />
                </div>
                <div className="text-2xl font-black text-primary">
                  Rp {parseFloat(user.balance).toLocaleString('id-ID')}
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: KYB and Project Secret */}
      <div className="lg:col-span-2 space-y-8">
        {user.project_secret ? (
          <ProjectSecretCard projectSecret={user.project_secret} />
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <ShieldAlert className="h-10 w-10 mb-2 opacity-20" />
              <p className="font-medium">No active project credentials found</p>
            </CardContent>
          </Card>
        )}

        {user.kyb ? (
          <KYBInfoCard kyb={user.kyb} />
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Building2 className="h-10 w-10 mb-2 opacity-20" />
              <p className="font-medium">No business verification data available</p>
            </CardContent>
          </Card>
        )}
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
