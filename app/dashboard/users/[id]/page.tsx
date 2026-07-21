import { ArrowLeft, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiServer } from '@/libs/api-server.lib'
import {
  UserDetailResponse,
  QrisSummaryResponse,
  UserSubMerchantsResponse,
  BalanceHistoryResponse,
} from '@/types/user.type'
import UserProfileView from '@/components/users/user-profile-view'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UserDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams

  const smPage = Number(sp.smPage) || 1
  const smSearch = (sp.smSearch as string) || ''
  const smLimit = Number(sp.smLimit) || 10

  const bhPage = Number(sp.bhPage) || 1
  const bhLimit = Number(sp.bhLimit) || 10
  const bhStartDate = (sp.start_date as string) || ''
  const bhEndDate = (sp.end_date as string) || ''

  let error: string | null = null
  let userData: UserDetailResponse | null = null

  // Kick off all secondary fetches in parallel immediately — none awaited yet
  const qrisSummaryPromise = apiServer
    .get<QrisSummaryResponse>(`/v1/users/${id}/qris-summary`)
    .then((res) => res.data.data)
    .catch((e) => {
      console.error('Failed to fetch QRIS summary:', e)
      return null
    })

  const subMerchantsPromise = apiServer
    .get<UserSubMerchantsResponse>(`/v1/users/${id}/sub-merchants`, {
      params: {
        page: smPage,
        limit: smLimit,
        search: smSearch || undefined,
      },
    })
    .then((res) => ({
      data: res.data.data,
      meta: res.data.meta ?? null,
    }))
    .catch((e) => {
      console.error('Failed to fetch sub-merchants:', e)
      return null
    })

  const balanceHistoriesPromise = apiServer
    .get<BalanceHistoryResponse>(`/v1/balance/users/${id}/histories`, {
      params: {
        page: bhPage,
        limit: bhLimit,
        start_date: bhStartDate || undefined,
        end_date: bhEndDate || undefined,
      },
    })
    .then((res) => ({
      data: res.data.data,
      meta: res.data.meta ?? null,
    }))
    .catch((e) => {
      console.error('Failed to fetch balance histories:', e)
      return null
    })

  // We only await the user details to render the main layout
  try {
    const userResult = await apiServer.get<UserDetailResponse>(`/v1/users/${id}`)
    userData = userResult.data
  } catch (e: any) {
    console.error('Failed to fetch user details:', e)
    if (e.response?.status === 404) notFound()
    error = e.message || 'Failed to load user details'
  }

  if (!userData?.data && !error) notFound()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb / Back Button */}
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
          subMerchantsPromise={subMerchantsPromise}
          smPage={smPage}
          smSearch={smSearch}
          smLimit={smLimit}
          balanceHistoriesPromise={balanceHistoriesPromise}
          bhPage={bhPage}
          bhLimit={bhLimit}
          bhStartDate={bhStartDate}
          bhEndDate={bhEndDate}
        />
      ) : null}
    </div>
  )
}
