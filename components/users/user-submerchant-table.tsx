'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Eye, EyeOff, Edit, ShieldCheck, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SubMerchant } from '@/types/user.type'
import { updateSubMerchantStatus } from '@/app/dashboard/submerchants/actions'
import SubmerchantModal from '@/components/submerchants/submerchant-modal'
import { toast } from 'sonner'

interface UserSubMerchantTableProps {
  submerchants: SubMerchant[]
  userId: string
}

export default function UserSubMerchantTable({ submerchants, userId }: UserSubMerchantTableProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({})
  const [modalState, setModalState] = useState<{
    id: string | null
    mode: 'view' | 'edit' | null
    data: SubMerchant | undefined
  }>({
    id: null,
    mode: null,
    data: undefined,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleVisibility = (id: string) => {
    setVisibleIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await updateSubMerchantStatus(id, !currentStatus, `/dashboard/users/${userId}`)
      if (result.success) {
        toast.success(`Sub-merchant ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
      } else {
        toast.error(result.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const openModal = (id: string, mode: 'view' | 'edit', data: SubMerchant) => {
    setModalState({ id, mode, data })
  }

  const closeModal = () => {
    setModalState({ id: null, mode: null, data: undefined })
  }

  if (!isMounted) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h3 className="text-xl font-black flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Sub Merchants
          </h3>
          <p className="text-sm text-muted-foreground">Manage and monitor all sub-merchants assigned to this user.</p>
        </div>
      </div>
      
      <div className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-primary/2">
            <TableRow className="hover:bg-transparent border-primary/10">
              <TableHead className="font-bold h-12">Name</TableHead>
              <TableHead className="font-bold h-12">Name Acquirer</TableHead>
              <TableHead className="font-bold h-12">Merchant ID</TableHead>
              <TableHead className="font-bold h-12">Store ID</TableHead>
              <TableHead className="font-bold h-12 text-center">Status</TableHead>
              <TableHead className="font-bold h-12">Created At</TableHead>
              <TableHead className="text-right font-bold h-12 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {submerchants && submerchants.length > 0 ? (
              submerchants.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    {item?.sub_merchant_name}
                  </TableCell>

                  <TableCell className="font-medium">
                    {item?.acquirer?.name}
                  </TableCell>

                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {visibleIds[item.id] 
                          ? item?.sub_merchant_id 
                          : '•'.repeat(8)}
                      </span>
                      <button 
                        onClick={() => toggleVisibility(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {visibleIds[item.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item?.store_id}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant={item?.is_status ? 'success' : 'secondary'} className="px-3 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {item?.is_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {item?.created_at ? format(new Date(item.created_at), 'dd MMM yyyy') : '-'}
                  </TableCell>

                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openModal(item.id, 'view', item)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openModal(item.id, 'edit', item)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Row
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className={item?.is_status ? "text-destructive" : "text-success"}
                          onClick={() => handleToggleStatus(item?.id, item?.is_status)}
                        >
                          {item?.is_status ? 'Disable Sub-Merchant' : 'Enable Sub-Merchant'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <ShieldAlert className="h-8 w-8" />
                    <p>No sub-merchants assigned to this user</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SubmerchantModal 
        id={modalState.id}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={closeModal}
        onSuccess={() => {
          window.location.reload()
        }}
        revalidatePath={`/dashboard/users/${userId}`}
      />
    </div>
  )
}
