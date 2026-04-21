import { Building2, User, Phone, Mail, MapPin, CreditCard, FileText, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KYB } from '@/types/user.type'
import { format } from 'date-fns'

interface KYBInfoCardProps {
  kyb: KYB
}

export default function KYBInfoCard({ kyb }: KYBInfoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      case 'pending': return 'warning'
      default: return 'outline'
    }
  }

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )

  const InfoItem = ({ label, value, icon: Icon }: { label: string, value: string | null, icon?: any }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/50" />}
        <span className="font-medium text-sm">{value || '-'}</span>
      </div>
    </div>
  )

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>Business Verification (KYB)</CardTitle>
        </div>
        <Badge variant={getStatusColor(kyb.status) as any} className="capitalize px-4 py-1">
          {kyb.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Business Section */}
        <Section title="Business Info" icon={Building2}>
          <InfoItem label="Company Name" value={kyb.company_name} />
          <InfoItem label="Store Name" value={kyb.store_name} />
          <InfoItem label="Business Name" value={kyb.business_name} />
          <InfoItem label="Tax ID (NPWP)" value={kyb.company_tax_id} />
          <InfoItem label="Account Number" value={kyb.account_number} icon={CreditCard} />
        </Section>

        {/* Contact Section */}
        <Section title="PIC Details" icon={User}>
          <InfoItem label="Full Name" value={kyb.pic_name} />
          <InfoItem label="Email" value={kyb.pic_email} icon={Mail} />
          <InfoItem label="Phone Number" value={kyb.pic_phone_number} icon={Phone} />
        </Section>

        {/* Owner Section */}
        <Section title="Owner Info" icon={User}>
          <InfoItem label="Full Name" value={kyb.owner_full_name} />
          <InfoItem label="ID Number (NIK)" value={kyb.owner_id_number} />
          <InfoItem label="Email" value={kyb.owner_email} icon={Mail} />
          <InfoItem label="Phone Number" value={kyb.owner_phone_number} icon={Phone} />
        </Section>

        {/* Address Section */}
        <Section title="Addresses" icon={MapPin}>
          <InfoItem label="Company Address" value={kyb.company_address} />
          <InfoItem label="Business Address" value={kyb.business_address} />
        </Section>

        {/* Documents */}
        <Section title="Documents" icon={FileText}>
          <div className="flex flex-col space-y-2">
            <span className="text-xs text-muted-foreground">ID Card Document</span>
            <a href={kyb.id_card_document} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View ID Card <FileText className="h-3 w-3" />
            </a>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="text-xs text-muted-foreground">Additional Document</span>
            <a href={kyb.additional_document} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View Document <FileText className="h-3 w-3" />
            </a>
          </div>
        </Section>

        {/* Status Details */}
        {kyb.reason && (
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 mt-4">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-bold">Rejection Reason</span>
            </div>
            <p className="text-sm text-muted-foreground">{kyb.reason}</p>
          </div>
        )}

        <div className="pt-4 border-t flex flex-wrap gap-6 text-xs text-muted-foreground">
          {kyb.submitted_at ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Submitted: {format(new Date(kyb.submitted_at), 'PPP')}</span>
            </div>
          ): null}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last Updated: {format(new Date(kyb.updated_at), 'PPP')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
