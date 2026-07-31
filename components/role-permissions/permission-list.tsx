'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Permission } from '@/types/role-permission.type'
import { Search, Key, Calendar } from 'lucide-react'
import { ClientDate } from '@/components/client-date'

interface PermissionListProps {
  permissions: Permission[]
}

export function PermissionList({ permissions }: PermissionListProps) {
  const [search, setSearch] = useState('')

  const filteredPermissions = useMemo(() => {
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
    )
  }, [permissions, search])

  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {}
    filteredPermissions.forEach((p) => {
      const category = p.code.includes('.') ? p.code.split('.')[0].toUpperCase() : 'OTHER'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(p)
    })
    return groups
  }, [filteredPermissions])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Permissions Directory</h2>
          <p className="text-sm text-muted-foreground">
            Total {permissions.length} system permissions registered.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permission code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {Object.keys(groupedPermissions).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Key className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-base font-semibold text-foreground">No permissions found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedPermissions).map(([category, perms]) => (
          <Card key={category}>
            <CardHeader className="py-4 bg-muted/20 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">{category}</CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {perms.length} permissions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {perms.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{p.name}</h4>
                      <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                        {p.code}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t">
                      <Calendar className="h-3 w-3" />
                      <span>Created: </span>
                      <ClientDate date={p.created_at} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
