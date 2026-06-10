import { ArrowLeft, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiServer } from '@/libs/api-server.lib'
import { UserDetailResponse, QrisSummaryResponse } from '@/types/user.type'
import { SubMerchantListResponse } from '@/types/sub-merchant.type'
import { Button } from '@/components/ui/button'
import UserProfileView from '@/components/users/user-profile-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params

  // Fetch user detail first (required)
  let userData: UserDetailResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<UserDetailResponse>(`/v1/users/${id}`)
    userData = response.data
  } catch (e: any) {
    console.error('Failed to fetch user details:', e)
    if (e.response?.status === 404) {
      notFound()
    }
    error = e.message || 'Failed to load user details'
  }

  if (!userData?.data && !error) {
    notFound()
  }

  // Kick off all secondary fetches in parallel immediately — none awaited yet
  const qrisSummaryPromise = apiServer
    .get<QrisSummaryResponse>(`/v1/users/${id}/qris-summary`)
    .then(res => res.data.data)
    .catch(e => {
      console.error('Failed to fetch QRIS summary:', e)
      return null
    })

  const subMerchantsPromise = apiServer
    .get<SubMerchantListResponse>(`/v1/users/${id}/sub-merchants?limit=100`)
    .then(res => res.data.data || [])
    .catch(e => {
      console.error('Failed to fetch sub-merchants:', e)
      return []
    })

  // Await only what's needed for SSR render; qrisSummaryPromise streams via Suspense
  const [subMerchants] = await Promise.all([subMerchantsPromise])

  if (userData?.data) {
    userData.data.sub_merchants = subMerchants
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Breadcrumbs/Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Link 
            href="/dashboard/users" 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Users
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">User Profile</h1>
            <div className="px-2 py-1 bg-primary/10 rounded-md">
              <span className="text-xs font-mono text-primary font-bold">#{id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">Error Loading Profile</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      ) : userData?.data ? (
        <UserProfileView
          user={userData.data}
          qrisSummaryPromise={qrisSummaryPromise}
        />
      ) : null}
    </div>
  )
}
