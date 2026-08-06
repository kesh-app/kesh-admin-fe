"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function BalanceRequestFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const targetType = searchParams.get("target_type") || "ALL";
  const status = searchParams.get("status") || "ALL";

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    router.push(pathname);
  };

  const hasActiveFilters = searchParams.has("target_type") || searchParams.has("status");

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-lg border">
      <div className="w-full sm:w-48">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Target Type
        </label>
        <select
          value={targetType}
          onChange={(e) => handleFilterChange("target_type", e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
        >
          <option value="ALL">All Target Types</option>
          <option value="VA">VA</option>
          <option value="USER">USER</option>
        </select>
      </div>

      <div className="w-full sm:w-48">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-end self-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
