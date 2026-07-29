'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Role } from '@/types/role-permission.type'
import { ClientDate } from '@/components/client-date'
import { MoreHorizontal, Edit, KeyRound, Shield, CheckCircle2, XCircle } from 'lucide-react'

interface RoleTableProps {
  roles: Role[]
  onEdit: (role: Role) => void
  onAssignPermissions: (role: Role) => void
}

export function RoleTable({ roles, onEdit, onAssignPermissions }: RoleTableProps) {
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-bold">Role Code & Name</TableHead>
            <TableHead className="font-bold">Description</TableHead>
            <TableHead className="font-bold">System Role</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold">Permissions</TableHead>
            <TableHead className="font-bold">Updated At</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No roles found.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{role.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {role.code}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs text-xs text-muted-foreground">
                  <p className="line-clamp-2">{role.description || '-'}</p>
                </TableCell>
                <TableCell>
                  {role.is_system ? (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs">
                      <Shield className="mr-1 h-3 w-3" /> System
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Custom
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {role.is_active !== false ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                      <XCircle className="mr-1 h-3 w-3" /> Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignPermissions(role)}
                    className="h-8 text-xs gap-1.5 font-normal"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span>{role.permissions ? role.permissions.length : 0} Permissions</span>
                  </Button>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  <ClientDate date={role.updated_at} format="dd MMM yyyy, HH:mm" />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          setTimeout(() => onEdit(role), 0)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setTimeout(() => onAssignPermissions(role), 0)
                        }}
                      >
                        <KeyRound className="mr-2 h-4 w-4" /> Assign Permissions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
