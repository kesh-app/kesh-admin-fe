import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiServer } from '@/libs/api-server.lib'
import { KYBDetailResponse, KYBData } from '@/types/kyb.type'
import KYBStatusBadge from '@/components/kyb/kyb-status-badge'
import KYBDetailActions from '@/components/kyb/kyb-detail-actions'
import { ArrowLeft, ExternalLink, Calendar, Mail, User, Building, MapPin, CreditCard, FileText, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function KYBDetailPage({ params }: PageProps) {
  const { id } = await params
  
  let data: KYBData | null = null
  try {
    const response = await apiServer.get<KYBDetailResponse>(`/v1/kyb/${id}`)
    data = response.data.data
  } catch (err: any) {
    console.error('Failed to fetch KYB detail:', err)
    if (err.response?.status === 404) {
      return notFound()
    }
    throw err
  }

  if (!data) return notFound()

  const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )

  const InfoRow = ({ label, value, isLink = false }: { label: string, value: string | null | undefined, isLink?: boolean }) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-muted last:border-0 hover:bg-muted/30 transition-colors px-2 rounded-sm text-wrap break-all">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="col-span-2 text-sm text-foreground font-medium">
        {isLink && value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            View Document <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          value || '-'
        )}
      </span>
    </div>
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/kyb">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.company_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <KYBStatusBadge status={data.status} />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Submitted on {format(new Date(data.submitted_at || data.created_at), 'PPPp')}
              </span>
            </div>
          </div>
        </div>
        <KYBDetailActions data={data} />
      </div>

      {data.status === 'rejected' && data.reason && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm">
          <div className="bg-destructive/10 text-destructive rounded-full p-2">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-destructive text-sm uppercase tracking-widest flex items-center gap-2">
              Verification Rejected
            </h3>
            <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed font-medium italic">
              &ldquo;{data.reason}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-1">
            <SectionHeader title="Basic Details" icon={Building} />
            <InfoRow label="Company Name" value={data.company_name} />
            <InfoRow label="Store Name" value={data.store_name} />
            <InfoRow label="Tax ID (NPWP)" value={data.company_tax_id} />
            <InfoRow label="Account Number" value={data.account_number} />
            
            <div className="mt-6"></div>
            <SectionHeader title="Location" icon={MapPin} />
            <InfoRow label="Address" value={data.company_address} />
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">Business Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-1">
            <SectionHeader title="Operations" icon={FileText} />
            <InfoRow label="Business Name" value={data.business_name} />
            <InfoRow label="Type" value={data.business_type} />
            <InfoRow label="Category" value={data.business_category} />
            
            <div className="mt-6"></div>
            <SectionHeader title="Business Address" icon={MapPin} />
            <InfoRow label="Address" value={data.business_address} />
          </CardContent>
        </Card>

        {/* PIC & Owner Information */}
        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-1">
            <SectionHeader title="Person in Charge (PIC)" icon={User} />
            <InfoRow label="Full Name" value={data.pic_name} />
            <InfoRow label="Email" value={data.pic_email} />
            <InfoRow label="Phone" value={data.pic_phone_number} />
            
            <div className="mt-6"></div>
            <SectionHeader title="Owner Details" icon={CreditCard} />
            <InfoRow label="Full Name" value={data.owner_full_name} />
            <InfoRow label="ID Number" value={data.owner_id_number} />
            <InfoRow label="Email" value={data.owner_email} />
            <InfoRow label="Phone" value={data.owner_phone_number} />
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">Legal Documents</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-1">
            <SectionHeader title="Verification Documents" icon={FileText} />
            <InfoRow label="ID Card (KTP)" value={data.id_card_document} isLink />
            <InfoRow label="Additional Document" value={data.additional_document} isLink />

            <div className="mt-6 pt-4 border-t border-muted">
              <SectionHeader title="User Metadata" icon={Mail} />
              <InfoRow label="User ID" value={data.user_id} />
              <InfoRow label="User Email" value={data.user?.email} />
              <InfoRow label="User Phone" value={data.user?.phone} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
