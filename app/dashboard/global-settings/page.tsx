import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGlobalSettings } from '@/app/dashboard/global-settings/actions'
import GlobalSettingCards from '@/components/global-settings/global-setting-cards'
import AddGlobalSettingButton from '@/components/global-settings/add-global-setting-button'
import GlobalSettingSearch from '@/components/global-settings/global-setting-search'
import GlobalSettingLoadMore from '@/components/global-settings/global-setting-load-more'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GlobalSettingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = (params.search as string) || ''
  const limit = Number(params.limit) || 30

  const res = await getGlobalSettings({
    page: 1,
    limit,
    search,
  })

  const settingsData = res.data
  const error = res.success ? null : (res.message || 'Failed to load global settings')

  const existingTypes = settingsData?.data.map((s) => s.type) ?? []
  const meta = settingsData?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Global Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage application-wide configuration settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle>All Settings</CardTitle>
            {meta && (
              <p className="text-sm text-muted-foreground mt-1">
                {meta.total} setting{meta.total !== 1 ? 's' : ''} configured
              </p>
            )}
          </div>
          <AddGlobalSettingButton existingTypes={existingTypes} />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <GlobalSettingSearch />

          {/* Content */}
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
              {error}
            </div>
          ) : settingsData ? (
            <>
              {settingsData.data.length === 0 && search ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground font-medium">No settings found</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <GlobalSettingCards settings={settingsData.data} existingTypes={existingTypes} />
              )}

              {/* Show More */}
              {meta?.hasNext && (
                <GlobalSettingLoadMore currentLimit={limit} total={meta.total} />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
