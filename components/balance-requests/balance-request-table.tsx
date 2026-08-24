"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye, CheckCircle2, XCircle, Loader2, Download, ExternalLink } from "lucide-react";
import { BalanceRequestItem, BalanceRequestStatus } from "@/types/balance-request.type";
import { apiClient } from "@/libs/api-client.lib";

interface BalanceRequestTableProps {
  items: BalanceRequestItem[];
}

const getStatusVariant = (status: BalanceRequestStatus) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "destructive";
    case "PENDING":
      return "warning";
    default:
      return "default";
  }
};

const formatAmount = (val: string | number) => {
  const num = typeof val === "number" ? val : parseFloat(val || "0");
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(num);
};

export default function BalanceRequestTable({ items }: BalanceRequestTableProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Selected Item for Detail / Action
  const [selectedItem, setSelectedItem] = useState<BalanceRequestItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Proof download states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);

  // Action Modal State (Approve / Reject)
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOpenDetail = (item: BalanceRequestItem) => {
    setSelectedItem(item);
    setProofError(null);
    setIsDetailOpen(true);
  };

  const handleFetchProofUrl = async (jobId: string) => {
    setDownloadingId(jobId);
    setProofError(null);
    try {
      const res = await apiClient.get(`/utils/downloads/${jobId}/url`);
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setProofError("Preview URL is not available.");
      }
    } catch (err: any) {
      console.error("Failed to get proof download URL:", err);
      const msg = err.response?.data?.message || err.message || "Failed to retrieve preview URL";
      setProofError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenActionModal = (item: BalanceRequestItem, type: "APPROVE" | "REJECT") => {
    setSelectedItem(item);
    setActionType(type);
    setAdminNotes("");
    setErrorMessage(null);
  };

  const handleCloseActionModal = () => {
    if (isSubmitting) return;
    setActionType(null);
    setAdminNotes("");
    setErrorMessage(null);
  };

  const handleSubmitAction = async () => {
    if (!selectedItem || !actionType) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const endpoint =
        actionType === "APPROVE"
          ? `/balance-requests/${selectedItem.id}/approve`
          : `/balance-requests/${selectedItem.id}/reject`;

      const response = await apiClient.post(endpoint, {
        admin_notes: adminNotes.trim() || undefined,
      });

      if (response.data?.success) {
        handleCloseActionModal();
        setIsDetailOpen(false);
        router.refresh();
      } else {
        setErrorMessage(response.data?.message || `Failed to ${actionType.toLowerCase()} request`);
      }
    } catch (err: any) {
      console.error(`Error on ${actionType} balance request:`, err);
      const msg = err.response?.data?.message || err.message || `Failed to ${actionType.toLowerCase()} request`;
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Req Number</TableHead>
              <TableHead>Target Type</TableHead>
              <TableHead>User / Email</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Adj. Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-xs">
                    {item.request_number}
                  </TableCell>

                  <TableCell className="text-xs">
                    <Badge variant="outline" className="font-mono">
                      {item.target_type}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {item.user?.name || "N/A"}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {item.user?.email || item.user_id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-semibold">
                    {formatAmount(item.amount)}
                  </TableCell>

                  <TableCell className="text-xs">
                    <Badge
                      variant="secondary"
                      className={
                        item.adjustment_type === "CREDIT"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }
                    >
                      {item.adjustment_type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-xs">
                    {isMounted && item.created_at
                      ? format(new Date(item.created_at), "dd MMM yyyy HH:mm")
                      : "-"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetail(item)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {item.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleOpenActionModal(item, "APPROVE")}
                            title="Approve Request"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleOpenActionModal(item, "REJECT")}
                            title="Reject Request"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  No balance requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DETAIL MODAL */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <span>Balance Request Details</span>
              {selectedItem && (
                <Badge variant={getStatusVariant(selectedItem.status)}>
                  {selectedItem.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Request Number</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">
                    {selectedItem.request_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Target Type</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedItem.target_type}
                  </p>
                </div>
                {selectedItem.product_name && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Product Name</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {selectedItem.product_name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Amount</p>
                  <p className="font-semibold text-primary text-base mt-0.5">
                    {formatAmount(selectedItem.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Adjustment Type</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedItem.adjustment_type}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-card p-4 rounded-lg border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">User Name</p>
                    <p className="font-medium">{selectedItem.user?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedItem.user?.email || "-"}</p>
                  </div>
                  {selectedItem.user?.business_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Business Name</p>
                      <p className="font-medium">{selectedItem.user.business_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs break-all">{selectedItem.user_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-card p-4 rounded-lg border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Additional Info & Proof
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="font-medium text-foreground bg-muted p-2 rounded text-xs mt-1">
                      {selectedItem.reason || "-"}
                    </p>
                  </div>

                  {/* PROOF PREVIEW & DOWNLOAD SECTION */}
                  {selectedItem.proof_download_job_id ? (
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Download className="h-3.5 w-3.5 text-primary" />
                          <span>Proof Document</span>
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-primary/30 text-primary hover:bg-primary/10 transition-colors shrink-0"
                        disabled={downloadingId === selectedItem.proof_download_job_id}
                        onClick={() => handleFetchProofUrl(selectedItem.proof_download_job_id!)}
                      >
                        {downloadingId === selectedItem.proof_download_job_id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Preview / Download
                      </Button>
                    </div>
                  ) : null}

                  {proofError && (
                    <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                      {proofError}
                    </div>
                  )}

                  {selectedItem.admin_notes && (
                    <div>
                      <p className="text-xs text-muted-foreground">Admin Notes</p>
                      <p className="font-medium text-foreground bg-muted p-2 rounded text-xs mt-1">
                        {selectedItem.admin_notes}
                      </p>
                    </div>
                  )}

                  {selectedItem.approved_by && (
                    <div>
                      <p className="text-xs text-muted-foreground">Approved By</p>
                      <p className="font-mono text-xs mt-0.5">{selectedItem.approved_by}</p>
                    </div>
                  )}

                  {selectedItem.processed_at && (
                    <div>
                      <p className="text-xs text-muted-foreground">Processed At</p>
                      <p className="font-medium text-xs mt-0.5">
                        {isMounted
                          ? format(new Date(selectedItem.processed_at), "dd MMM yyyy HH:mm:ss")
                          : selectedItem.processed_at}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      {isMounted && selectedItem.created_at
                        ? format(new Date(selectedItem.created_at), "dd MMM yyyy HH:mm")
                        : "-"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated: </span>
                      {isMounted && selectedItem.updated_at
                        ? format(new Date(selectedItem.updated_at), "dd MMM yyyy HH:mm")
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {selectedItem.status === "PENDING" && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleOpenActionModal(selectedItem, "APPROVE");
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve Request
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleOpenActionModal(selectedItem, "REJECT");
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ACTION MODAL (APPROVE / REJECT) */}
      <Dialog open={actionType !== null} onOpenChange={(open) => !open && handleCloseActionModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "APPROVE" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Approve Balance Request</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span>Reject Balance Request</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-2 text-sm">
              <p className="text-muted-foreground">
                Are you sure you want to {actionType?.toLowerCase()} request{" "}
                <span className="font-semibold text-foreground">{selectedItem.request_number}</span> for amount{" "}
                <span className="font-semibold text-foreground">{formatAmount(selectedItem.amount)}</span>?
              </p>

              {errorMessage && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Admin Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Add any notes for this action..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseActionModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "APPROVE" ? "default" : "destructive"}
              onClick={handleSubmitAction}
              disabled={isSubmitting}
              className={actionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === "APPROVE" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
