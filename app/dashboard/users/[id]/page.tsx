import { ArrowLeft, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiServer } from '@/libs/api-server.lib'
import { UserDetailResponse } from '@/types/user.type'
import { Button } from '@/components/ui/button'
import UserProfileView from '@/components/users/user-profile-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params
  
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

        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm">Edit Profile</Button>
          <Button size="sm">Take Action</Button>
        </div> */}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto border-destructive/50 hover:bg-destructive/10"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : userData?.data ? (
        <UserProfileView user={userData.data} />
      ) : null}
    </div>
  )
}
