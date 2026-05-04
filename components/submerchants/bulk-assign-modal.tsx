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
import { bulkAssignSubMerchants } from '@/app/dashboard/submerchants/actions'

interface BulkAssignModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SubMerchantData {
  name: string
  email: string
  acquirer: string
  merchant_id: string
  sub_merchant_id: string
  store_id: string
}

export default function BulkAssignModal({ isOpen, onClose }: BulkAssignModalProps) {
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
          email: item.email || '',
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
    const result = await bulkAssignSubMerchants(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Successfully assigned sub-merchants', {
        description: `${data.length} records processed.`
      })
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Assign Sub-Merchants</DialogTitle>
          <DialogDescription>
            Upload an Excel file to assign multiple sub-merchants at once. Limit: 150 records.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="cursor-pointer"
                disabled={isParsing}
              />
            </div>
            {data.length > 0 && (
              <Button variant="outline" size="icon" onClick={handleClear} title="Clear data">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {data.length > 0 && (
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Preview ({data.length} records)
                </p>
              </div>
              <ScrollArea className="flex-1 border rounded-md">
                <div className="w-full h-full overflow-x-auto">
                  <div className="min-w-max">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Name</TableHead>
                          <TableHead className="whitespace-nowrap">Email</TableHead>
                          <TableHead className="whitespace-nowrap">Acquirer</TableHead>
                          <TableHead className="whitespace-nowrap">MID</TableHead>
                          <TableHead className="whitespace-nowrap">Sub MID</TableHead>
                          <TableHead className="whitespace-nowrap">Store ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">{row.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.acquirer}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.merchant_id}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.sub_merchant_id}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.store_id}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>


            </div>
          )}

          {data.length === 0 && !error && !isParsing && (
            <div className="flex-1 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-8 text-muted-foreground">
              <FileUp className="h-10 w-10 mb-2 opacity-20" />
              <p>Upload your file to see a preview</p>
              <p className="text-xs">Supported: .xlsx, .xls, .csv</p>
            </div>
          )}

          {isParsing && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={data.length === 0 || !!error || isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Confirm & Assign'}
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
