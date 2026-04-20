'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Eye, EyeOff } from 'lucide-react'
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
import { SubMerchant } from '@/types/sub-merchant.type'
import { updateSubMerchantStatus } from '@/app/dashboard/submerchants/actions'
import SubmerchantModal from './submerchant-modal'

interface SubmerchantTableProps {
  submerchants: SubMerchant[]
}

export default function SubmerchantTable({ submerchants }: SubmerchantTableProps) {
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
    const result = await updateSubMerchantStatus(id, !currentStatus)
    if (!result.success) {
      alert(result.message)
    }
  }

  const openModal = (id: string, mode: 'view' | 'edit', data: SubMerchant) => {
    setModalState({ id, mode, data })
  }

  const closeModal = () => {
    setModalState({ id: null, mode: null, data: undefined })
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        {/* ... Table Headers ... */}
        <TableHeader>
          <TableRow>
            <TableHead>Sub-Merchant Name</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Sub-Merchant ID</TableHead>
            <TableHead>Store ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acquirer</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {submerchants.length > 0 ? (
            submerchants.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item?.sub_merchant_name}
                </TableCell>

                <TableCell className="font-medium">
                  {item?.user?.name ?? "-"}
                </TableCell>

                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span>
                      {visibleIds[item.id] 
                        ? item?.sub_merchant_id 
                        : '•'.repeat(item.sub_merchant_id?.length || 10)}
                    </span>
                    <button 
                      onClick={() => toggleVisibility(item.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {visibleIds[item.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {item?.store_id}
                </TableCell>

                <TableCell>
                  <Badge variant={item?.is_status ? 'success' : 'secondary'}>
                    {item?.is_status ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {item?.acquirer?.name || 'N/A'}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground" suppressHydrationWarning>
                  {item?.created_at ? format(new Date(item.created_at), 'dd MMM yyyy') : '-'}
                </TableCell>

                <TableCell className="text-right">
                  {isMounted ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openModal(item.id, 'view', item)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openModal(item.id, 'edit', item)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className={item?.is_status ? "text-destructive" : "text-success"}
                          onClick={() => handleToggleStatus(item?.id, item?.is_status)}
                        >
                          {item?.is_status ? 'Disable' : 'Enable'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" size="icon" disabled>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No sub-merchants found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <SubmerchantModal 
        id={modalState.id}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={closeModal}
      />
    </div>
  )
}
