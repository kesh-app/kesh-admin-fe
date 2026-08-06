import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiServer } from "@/libs/api-server.lib";
import { BalanceRequestListResponse } from "@/types/balance-request.type";

import BalanceRequestFilters from "@/components/balance-requests/balance-request-filters";
import BalanceRequestTable from "@/components/balance-requests/balance-request-table";
import BalanceRequestPagination from "@/components/balance-requests/balance-request-pagination";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function BalanceRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;

  const targetType = getStringParam(params.target_type);
  const status = getStringParam(params.status);

  let responseData: BalanceRequestListResponse | null = null;
  let error: string | null = null;

  try {
    const response = await apiServer.get<BalanceRequestListResponse>(
      "/v1/balance-requests",
      {
        params: {
          page,
          limit,
          target_type: targetType || undefined,
          status: status || undefined,
        },
      }
    );

    responseData = response.data;
  } catch (e: any) {
    console.error("Failed to fetch balance requests:", e);
    error = e.message || "Failed to load balance requests";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Balance Requests</h1>
          <p className="mt-2 text-muted-foreground">
            Manage user and virtual account balance adjustment requests
          </p>
        </div>
      </div>

      <BalanceRequestFilters />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Balance Requests List</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : responseData ? (
            <>
              <BalanceRequestTable items={responseData.data || []} />
              {responseData.meta && (
                <BalanceRequestPagination meta={responseData.meta} />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
              Loading balance requests...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
