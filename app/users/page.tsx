import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiServer } from '@/libs/api-server.lib'
import { UserListResponse } from '@/types/user.type'

import UserFilters from '@/components/users/user-filters'
import UserTable from '@/components/users/user-table'
import UserPagination from '@/components/users/user-pagination'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = (params.search as string) || ''
  const status = (params.status as string) || ''
  const limit = Number(params.limit) || 10

  let usersData: UserListResponse | null = null
  let error: string | null = null

  try {
    const response = await apiServer.get<UserListResponse>('/v1/users', {
      params: {
        page,
        search: search || undefined,
        status: status || undefined,
        limit,
      },
    })
    usersData = response.data
  } catch (e: any) {
    console.error('Failed to fetch users:', e)
    error = e.message || 'Failed to load users'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">Manage user accounts</p>
        </div>

        {/* <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button> */}
      </div>

      {/* Filters */}
      <UserFilters />

      {/* Table & Pagination */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>User Directory</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : usersData ? (
            <>
              <UserTable users={usersData.data} />
              {usersData.meta && <UserPagination meta={usersData.meta} />}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              Loading users...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}