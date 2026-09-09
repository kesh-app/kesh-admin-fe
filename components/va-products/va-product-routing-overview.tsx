'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, Route } from 'lucide-react'
import { toast } from 'sonner'

import { switchVaProductProvider } from '@/app/dashboard/va-products/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getConfiguredPrimary } from '@/libs/va-product-routing'
import {
  SmartVaGeneralCode,
  SmartVaProvider,
  VaProductRouteGroup,
} from '@/types/va-product.type'

interface VaProductRoutingOverviewProps {
  groups: VaProductRouteGroup[]
}

type ProviderSelection = Partial<Record<SmartVaGeneralCode, SmartVaProvider>>

function initialSelections(groups: VaProductRouteGroup[]): ProviderSelection {
  return Object.fromEntries(
    groups.flatMap((group) => {
      const primary = getConfiguredPrimary(group.routes)
      return primary ? [[group.generalCode, primary.provider]] : []
    }),
  ) as ProviderSelection
}

function formatAmount(value: string | number | null) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(parsed)
}

export default function VaProductRoutingOverview({ groups }: VaProductRoutingOverviewProps) {
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [selectedProviders, setSelectedProviders] = useState<ProviderSelection>(() =>
    initialSelections(groups),
  )
  const [switchingCode, setSwitchingCode] = useState<SmartVaGeneralCode | null>(null)

  const refresh = () => startRefresh(() => router.refresh())

  const handleSwitch = async (generalCode: SmartVaGeneralCode) => {
    const provider = selectedProviders[generalCode]
    if (!provider) {
      toast.error('Select an active provider first')
      return
    }

    setSwitchingCode(generalCode)
    try {
      const result = await switchVaProductProvider(generalCode, { provider })
      if (!result.success) {
        toast.error(result.message || `Failed to switch ${generalCode} provider`)
        return
      }
      toast.success(`${provider} is now the configured primary for ${generalCode}`)
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred while switching provider')
    } finally {
      setSwitchingCode(null)
    }
  }

  return (
    <section className="space-y-4" aria-labelledby="routing-overview-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="routing-overview-title" className="flex items-center gap-2 text-xl font-semibold">
            <Route className="h-5 w-5" />
            General Product Routes
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Configured primary is the active route with the smallest priority. At runtime the
            provider may still fall back based on merchant eligibility.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-4 w-4" />
          )}
          Refresh routes
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => {
          const primary = getConfiguredPrimary(group.routes)
          const activeProviders = [...new Set(
            group.routes.filter((route) => route.is_routing_active).map((route) => route.provider),
          )]
          const selection = selectedProviders[group.generalCode] ?? ''
          const switching = switchingCode === group.generalCode

          return (
            <Card key={group.generalCode} className="flex flex-col">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{group.generalCode}</CardTitle>
                  {primary ? (
                    <Badge>{primary.provider} primary</Badge>
                  ) : (
                    <Badge variant="outline">No active primary</Badge>
                  )}
                </div>
                {primary && (
                  <p className="text-xs text-muted-foreground">
                    Priority {primary.routing_priority} · {primary.code}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                {group.error ? (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {group.error}
                  </div>
                ) : group.routes.length === 0 ? (
                  <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
                    No routes configured for {group.generalCode}.
                  </div>
                ) : (
                  <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                    {group.routes.map((route) => (
                      <div
                        key={route.id}
                        className="flex items-start justify-between gap-3 rounded-md border p-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium">{route.provider}</span>
                            <span className="truncate font-mono text-muted-foreground">{route.code}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground">
                            P{route.routing_priority}
                            {formatAmount(route.denomination_amount)
                              ? ` · denomination ${formatAmount(route.denomination_amount)}`
                              : ''}
                          </p>
                        </div>
                        <Badge variant={route.is_routing_active ? 'secondary' : 'outline'}>
                          {route.is_routing_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto space-y-2 border-t pt-3">
                  <label className="text-xs font-medium">Manual primary provider</label>
                  <div className="flex gap-2">
                    <select
                      aria-label={`Primary provider for ${group.generalCode}`}
                      value={selection}
                      disabled={Boolean(group.error) || activeProviders.length === 0 || switching}
                      onChange={(event) =>
                        setSelectedProviders((current) => ({
                          ...current,
                          [group.generalCode]: event.target.value as SmartVaProvider,
                        }))
                      }
                      className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    >
                      <option value="">Select active provider</option>
                      {activeProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={() => handleSwitch(group.generalCode)}
                      disabled={!selection || switching || selection === primary?.provider}
                    >
                      {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set primary'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A provider must have an active route before it can become primary.
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
