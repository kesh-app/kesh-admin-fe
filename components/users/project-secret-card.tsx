'use client'

import { useState } from 'react'
import { Eye, EyeOff, Shield, Globe, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectSecret } from '@/types/user.type'
import { format } from 'date-fns'

interface ProjectSecretCardProps {
  projectSecret: ProjectSecret
}

function safeFormatDate(date?: string | null) {
  if (!date) return '-'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return format(parsedDate, 'PPPp')
}

function safeValue(value?: string | null) {
  return value && value.trim() !== '' ? value : '-'
}

export default function ProjectSecretCard({
  projectSecret,
}: ProjectSecretCardProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)

  const acquirerName = projectSecret.acquirer?.name || '-'

  const SecretField = ({
    label,
    value,
    show,
    onToggle,
  }: {
    label: string
    value?: string | null
    show: boolean
    onToggle: () => void
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 px-2"
          disabled={!value}
        >
          {show ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" /> Hide
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" /> Show
            </>
          )}
        </Button>
      </div>

      <div className="relative group">
        <div
          className={`
            font-mono text-sm p-3 bg-muted rounded-md break-all pr-10
            ${!show && value ? 'blur-sm select-none' : ''}
            transition-all duration-200
          `}
        >
          {safeValue(value)}
        </div>

        {!show && value && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded bg-background/80 px-2 py-1 text-xs font-semibold shadow-sm">
              Click "Show" to reveal
            </span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>

          <CardTitle className="text-xl">Project Credentials</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <Terminal className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Project Name
              </p>

              <p className="truncate font-bold text-foreground">
                {safeValue(projectSecret.project_name)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <Globe className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Callback URL
              </p>

              <p
                className="max-w-[260px] truncate font-medium text-foreground"
                title={projectSecret.callback_url || '-'}
              >
                {safeValue(projectSecret.callback_url)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SecretField
            label="API Key"
            value={projectSecret.api_key}
            show={showApiKey}
            onToggle={() => setShowApiKey((prev) => !prev)}
          />

          <SecretField
            label="API Secret"
            value={projectSecret.api_secret}
            show={showApiSecret}
            onToggle={() => setShowApiSecret((prev) => !prev)}
          />
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Acquirer</span>
            <span className="font-medium">{acquirerName}</span>
          </div>

          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Acquirer ID</span>
            <span className="font-mono font-medium">
              {safeValue(projectSecret.acquirer_id)}
            </span>
          </div>

          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Created At</span>
            <span className="font-medium">
              {safeFormatDate(projectSecret.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}