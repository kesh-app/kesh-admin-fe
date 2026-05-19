'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { FileUp, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { bulkAssignSubMerchantByUserId } from '@/app/dashboard/submerchants/actions'

interface UserBulkAssignModalProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface SubMerchantData {
  name: string
  acquirer: string
  merchant_id: string
  sub_merchant_id: string
  store_id: string
}

export default function UserBulkAssignModal({ userId, userName, isOpen, onClose, onSuccess }: UserBulkAssignModalProps) {
  const [data, setData] = useState<SubMerchantData[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result
        if (!data) return
        
        const wb = XLSX.read(data, { type: 'array' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const rawData = XLSX.utils.sheet_to_json(ws) as any[]

        if (rawData.length > 150) {
          setError('Maximum 150 data records allowed.')
          setData([])
          toast.error('Limit exceeded', {
            description: 'You can only upload up to 150 records at once.'
          })
          return
        }

        const formattedData: SubMerchantData[] = rawData.map((item: any) => ({
          name: item.name || '',
          acquirer: item.acquirer || '',
          merchant_id: item.merchant_id || '',
          sub_merchant_id: item.sub_merchant_id || '',
          store_id: item.store_id || '',
        }))

        setData(formattedData)
        toast.success('File uploaded successfully', {
          description: `${formattedData.length} records parsed.`
        })
      } catch (err) {
        console.error('Error parsing excel:', err)
        setError('Failed to parse excel file. Please make sure it follows the template.')
        toast.error('Parsing failed')
      } finally {
        setIsParsing(false)
      }
    }
    reader.onerror = () => {
      setError('Failed to read file.')
      setIsParsing(false)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleClear = () => {
    setData([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    const result = await bulkAssignSubMerchantByUserId(userId, data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Successfully assigned sub-merchants', {
        description: `${data.length} records processed for ${userName}.`
      })
      onSuccess?.()
      onClose()
      setData([])
    } else {
      toast.error('Failed to assign sub-merchants', {
        description: result.message
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              Bulk Add Sub-Merchants
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload Excel to add multiple sub-merchants to <span className="font-semibold text-foreground">{userName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="cursor-pointer bg-background border-border"
                disabled={isParsing}
              />
            </div>
            {data.length > 0 && (
              <Button variant="ghost" size="icon" onClick={handleClear} title="Clear data" className="hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3 text-sm border border-destructive/20 animate-in fade-in zoom-in-95">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {data.length > 0 && (
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Preview ({data.length} records)
                </p>
              </div>
              <div className="flex-1 border rounded-xl overflow-hidden bg-muted/30">
                <ScrollArea className="h-full w-full">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="whitespace-nowrap font-bold">Name</TableHead>
                        <TableHead className="whitespace-nowrap font-bold">Acquirer</TableHead>
                        <TableHead className="whitespace-nowrap font-bold">MID</TableHead>
                        <TableHead className="whitespace-nowrap font-bold">Sub MID</TableHead>
                        <TableHead className="whitespace-nowrap font-bold">Store ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, index) => (
                        <TableRow key={index} className="hover:bg-primary/5 transition-colors">
                          <TableCell className="whitespace-nowrap font-medium">{row.name}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.acquirer}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{row.merchant_id}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{row.sub_merchant_id}</TableCell>
                          <TableCell className="whitespace-nowrap font-mono text-xs">{row.store_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
          )}

          {data.length === 0 && !error && !isParsing && (
            <div className="flex-1 border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/10">
              <div className="p-4 rounded-full bg-primary/5 mb-4">
                <FileUp className="h-10 w-10 text-primary/40" />
              </div>
              <p className="font-medium">Upload your file to see a preview</p>
              <p className="text-xs opacity-60 mt-1">Supported: .xlsx, .xls, .csv (Max 150 records)</p>
            </div>
          )}

          {isParsing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
              <p className="text-sm font-medium text-muted-foreground">Parsing file...</p>
            </div>
          )}
        </div>

        <div className="bg-muted/30 p-6 border-t border-border">
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="font-semibold">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={data.length === 0 || !!error || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Assigning...
                </div>
              ) : 'Confirm & Bulk Add'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
