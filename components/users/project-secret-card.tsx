'use client'

import { useState } from 'react'
import { Eye, EyeOff, Key, Shield, Globe, Terminal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectSecret } from '@/types/user.type'
import { format } from 'date-fns'

interface ProjectSecretCardProps {
  projectSecret: ProjectSecret
}

export default function ProjectSecretCard({ projectSecret }: ProjectSecretCardProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)

  const SecretField = ({ 
    label, 
    value, 
    show, 
    onToggle 
  }: { 
    label: string, 
    value: string, 
    show: boolean, 
    onToggle: () => void 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className="h-8 px-2"
        >
          {show ? (
            <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
          ) : (
            <><Eye className="h-4 w-4 mr-2" /> Show</>
          )}
        </Button>
      </div>
      <div className="relative group">
        <div className={`
          font-mono text-sm p-3 bg-muted rounded-md break-all pr-10
          ${!show && 'blur-sm select-none'}
          transition-all duration-200
        `}>
          {value}
        </div>
        {!show && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-semibold bg-background/80 px-2 py-1 rounded shadow-sm">
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
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Project Credentials</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Project Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <Terminal className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Name</p>
              <p className="font-bold text-foreground">{projectSecret.project_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Callback URL</p>
              <p className="font-medium text-foreground truncate max-w-[200px]" title={projectSecret.callback_url}>
                {projectSecret.callback_url}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SecretField 
            label="API Key" 
            value={projectSecret.api_key} 
            show={showApiKey} 
            onToggle={() => setShowApiKey(!showApiKey)} 
          />
          <SecretField 
            label="API Secret" 
            value={projectSecret.api_secret} 
            show={showApiSecret} 
            onToggle={() => setShowApiSecret(!showApiSecret)} 
          />
        </div>

        {/* IDs & Timeline */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Acquirer</span>
            <span className="font-medium">{projectSecret.acquirer.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Created At</span>
            <span className="font-medium">
              {format(new Date(projectSecret.created_at), 'PPPp')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
