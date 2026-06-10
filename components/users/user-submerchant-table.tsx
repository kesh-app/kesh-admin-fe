'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MoreHorizontal, Eye, EyeOff, Edit, ShieldCheck, ShieldAlert, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { PaginationMeta } from '@/types/api.type'
import { updateSubMerchantStatus } from '@/app/dashboard/submerchants/actions'
import SubmerchantModal from '@/components/submerchants/submerchant-modal'
import { toast } from 'sonner'

interface UserSubMerchantTableProps {
  subMerchants: SubMerchant[]
  subMerchantsMeta: PaginationMeta | null
  userId: string
  currentPage: number
  currentSearch: string
  currentLimit: number
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------
function SkeletonRow() {
  return (
    <TableRow className="hover:bg-transparent">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 13) % 40}%` }} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default function UserSubMerchantTable({
  subMerchants,
  subMerchantsMeta,
  userId,
  currentPage,
  currentSearch,
  currentLimit,
}: UserSubMerchantTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [searchInput, setSearchInput] = useState(currentSearch)
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({})
  const [modalState, setModalState] = useState<{
    id: string | null
    mode: 'view' | 'edit' | null
    data: SubMerchant | undefined
  }>({ id: null, mode: null, data: undefined })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Stop loading indicator when navigation completes (component re-renders with new data)
  useEffect(() => {
    setIsNavigating(false)
    setSearchInput(currentSearch)
  }, [currentPage, currentSearch, currentLimit])

  const buildUrl = useCallback(
    (overrides: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      const merged = {
        smPage: currentPage,
        smSearch: currentSearch,
        smLimit: currentLimit,
        ...overrides,
      }
      Object.entries(merged).forEach(([key, val]) => {
        if (val !== undefined && val !== '' && val !== null) {
          params.set(key, String(val))
        } else {
          params.delete(key)
        }
      })
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams, currentPage, currentSearch, currentLimit]
  )

  const navigate = useCallback(
    (overrides: Record<string, string | number | undefined>) => {
      setIsNavigating(true)
      router.push(buildUrl(overrides), { scroll: false })
    },
    [router, buildUrl]
  )

  const handleSearch = useCallback(() => {
    navigate({ smSearch: searchInput || undefined, smPage: 1 })
  }, [navigate, searchInput])

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    navigate({ smSearch: undefined, smPage: 1 })
  }, [navigate])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handlePageChange = (newPage: number) => {
    navigate({ smPage: newPage })
  }

  const toggleVisibility = (id: string) => {
    setVisibleIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await updateSubMerchantStatus(id, !currentStatus, `/dashboard/users/${userId}`)
      if (result.success) {
        toast.success(`Sub-merchant ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
        router.refresh()
      } else {
        toast.error(result.message || 'Failed to update status')
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

  const openModal = (id: string, mode: 'view' | 'edit', data: SubMerchant) => {
    setModalState({ id, mode, data })
  }

  const closeModal = () => {
    setModalState({ id: null, mode: null, data: undefined })
  }

  if (!isMounted) {
    // SSR skeleton
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded bg-muted/70 animate-pulse" />
          </div>
        </div>
        <div className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-primary/2">
              <TableRow className="hover:bg-transparent border-primary/10">
                {['Name', 'Acquirer', 'Merchant ID', 'Store ID', 'Status', 'Created At', 'Actions'].map((h) => (
                  <TableHead key={h} className="font-bold h-12">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const meta = subMerchantsMeta

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <h3 className="text-xl font-black flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Sub Merchants
            {meta && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {meta.total}
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all sub-merchants assigned to this user.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="sm-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search sub-merchant..."
              className="pl-9 pr-8 h-9 w-56 text-sm"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSearch}
            className="h-9 px-4 font-semibold"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Loading
              </span>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={`border-none shadow-2xl rounded-2xl overflow-hidden bg-card transition-opacity duration-200 ${isNavigating ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <Table>
          <TableHeader className="bg-primary/2">
            <TableRow className="hover:bg-transparent border-primary/10">
              <TableHead className="font-bold h-12">Name</TableHead>
              <TableHead className="font-bold h-12">Acquirer</TableHead>
              <TableHead className="font-bold h-12">Merchant ID</TableHead>
              <TableHead className="font-bold h-12">Store ID</TableHead>
              <TableHead className="font-bold h-12 text-center">Status</TableHead>
              <TableHead className="font-bold h-12">Created At</TableHead>
              <TableHead className="text-right font-bold h-12 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isNavigating ? (
              Array.from({ length: currentLimit }).map((_, i) => <SkeletonRow key={i} />)
            ) : subMerchants.length > 0 ? (
              subMerchants.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    {item.sub_merchant_name}
                  </TableCell>

                  <TableCell className="font-medium">
                    {item.acquirer?.name ?? '-'}
                  </TableCell>

                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {visibleIds[item.id] ? item.sub_merchant_id : '•'.repeat(8)}
                      </span>
                      <button
                        onClick={() => toggleVisibility(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={visibleIds[item.id] ? 'Hide merchant ID' : 'Show merchant ID'}
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
                    {item.store_id}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={item.is_status ? 'success' : 'secondary'}
                      className="px-3 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    >
                      {item.is_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {item.created_at ? format(new Date(item.created_at), 'dd MMM yyyy') : '-'}
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
                          className={item.is_status ? 'text-destructive' : 'text-success'}
                          onClick={() => handleToggleStatus(item.id, item.is_status)}
                        >
                          {item.is_status ? 'Disable Sub-Merchant' : 'Enable Sub-Merchant'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <ShieldAlert className="h-8 w-8" />
                    <p>
                      {currentSearch
                        ? `No sub-merchants found for "${currentSearch}"`
                        : 'No sub-merchants assigned to this user'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}{' '}
            <span className="text-muted-foreground/60">({meta.total} total)</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.hasPrev || isNavigating}
              className="h-8 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                let pageNum: number
                if (meta.totalPages <= 5) {
                  pageNum = i + 1
                } else if (meta.page <= 3) {
                  pageNum = i + 1
                } else if (meta.page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i
                } else {
                  pageNum = meta.page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={meta.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isNavigating}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {meta.totalPages > 5 && meta.page < meta.totalPages - 2 && (
                <span className="px-1 text-muted-foreground text-sm">...</span>
              )}
              {meta.totalPages > 5 && meta.page < meta.totalPages - 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.totalPages)}
                  disabled={isNavigating}
                  className="h-8 w-8 p-0"
                >
                  {meta.totalPages}
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNext || isNavigating}
              className="h-8 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <SubmerchantModal
        id={modalState.id}
        mode={modalState.mode}
        initialData={modalState.data}
        onClose={closeModal}
        onSuccess={() => {
          router.refresh()
          closeModal()
        }}
        revalidatePath={`/dashboard/users/${userId}`}
      />
    </div>
  )
}
