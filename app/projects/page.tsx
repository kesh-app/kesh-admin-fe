"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  users,
  projects,
  acquirers,
  submerchants,
  projectAssignments,
  ProjectAssignmentItem,
} from "@/lib/mock-data";

type AssignmentRow = {
  id: string;
  acquirerId: string;
  submerchantIds: string[];
};

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignmentRows, setAssignmentRows] = useState<AssignmentRow[]>([
    { id: crypto.randomUUID(), acquirerId: "", submerchantIds: [] },
  ]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses = Array.from(new Set(projects.map((p) => p.status)));

  const isFormValid =
    projectName.trim() !== "" &&
    selectedUserId !== "" &&
    assignmentRows.length > 0 &&
    assignmentRows.every(
      (row) => row.acquirerId !== "" && row.submerchantIds.length > 0,
    );

  const projectPreview = useMemo(() => {
    const selectedUser = users.find((user) => user.id === selectedUserId);

    return {
      userName: selectedUser?.name || "-",
      totalAcquirers: assignmentRows.filter((row) => row.acquirerId).length,
      totalSubmerchants: assignmentRows.reduce(
        (total, row) => total + row.submerchantIds.length,
        0,
      ),
    };
  }, [selectedUserId, assignmentRows]);

  function resetForm() {
    setProjectName("");
    setSelectedUserId("");
    setAssignmentRows([
      { id: crypto.randomUUID(), acquirerId: "", submerchantIds: [] },
    ]);
  }

  function addAssignmentRow() {
    setAssignmentRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), acquirerId: "", submerchantIds: [] },
    ]);
  }

  function removeAssignmentRow(rowId: string) {
    setAssignmentRows((prev) => prev.filter((row) => row.id !== rowId));
  }

  function updateAssignmentAcquirer(rowId: string, acquirerId: string) {
    setAssignmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, acquirerId, submerchantIds: [] } : row,
      ),
    );
  }

  function toggleSubmerchant(
    rowId: string,
    submerchantId: string,
    checked: boolean,
  ) {
    setAssignmentRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        if (checked) {
          return {
            ...row,
            submerchantIds: [...row.submerchantIds, submerchantId],
          };
        }

        return {
          ...row,
          submerchantIds: row.submerchantIds.filter(
            (id) => id !== submerchantId,
          ),
        };
      }),
    );
  }

  function getAvailableSubmerchants(acquirerCode: string) {
    return submerchants.filter(
      (submerchant) => submerchant.acquirerCode === acquirerCode,
    );
  }

  function handleSubmit() {
    const payload = {
      projectName,
      userId: selectedUserId,
      assignments: assignmentRows.map((row) => ({
        acquirerId: row.acquirerId,
        submerchantIds: row.submerchantIds,
      })),
    };

    console.log("SUBMIT PROJECT PAYLOAD:", payload);

    setOpenCreateDialog(false);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Create project and assign user, acquirer, and submerchants
          </p>
        </div>
        <Button onClick={() => setOpenCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by project name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || filterStatus) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Showing {filteredProjects.length} of {projects.length} projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acquirers</TableHead>
                  <TableHead>Submerchants</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No projects found
                    </TableCell>
                  </TableRow>
                )}

                {filteredProjects.map((project) => {
                  const projectUser = users.find(
                    (user) => user.id === project.userId,
                  );

                  const projectAssignment = projectAssignments.find(
                    (item) => item.projectId === project.id,
                  );

                  const acquirerCount =
                    projectAssignment?.assignments.length ?? 0;

                  const submerchantCount =
                    projectAssignment?.assignments.reduce(
                      (total: number, assignment: ProjectAssignmentItem) =>
                        total + assignment.submerchantIds.length,
                      0,
                    ) ?? 0;

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>

                      <TableCell>{projectUser?.name || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            project.status === "active"
                              ? "success"
                              : project.status === "inactive"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {project.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{acquirerCount}</TableCell>

                      <TableCell>{submerchantCount}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {project.createdAt}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem>Edit Project</DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${project.id}`}>
                                View Detail
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-destructive">
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Select one user, then assign acquirers and submerchants under each
              acquirer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Project Name
                  </label>
                  <Input
                    placeholder="Enter project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Acquirer Assignments
                  </CardTitle>
                  <CardDescription>
                    Add one or more acquirers, then choose submerchants under
                    each acquirer.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAssignmentRow}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Acquirer
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {assignmentRows.map((row, index) => {
                  const selectedAcquirer = acquirers.find(
                    (acquirer) => acquirer.id === row.acquirerId,
                  );

                  const availableSubmerchants = selectedAcquirer
                    ? getAvailableSubmerchants(selectedAcquirer.code)
                    : [];

                  const usedAcquirerIds = assignmentRows
                    .filter((item) => item.id !== row.id)
                    .map((item) => item.acquirerId);

                  const selectableAcquirers = acquirers.filter(
                    (acquirer) =>
                      acquirer.id === row.acquirerId ||
                      !usedAcquirerIds.includes(acquirer.id),
                  );

                  return (
                    <div
                      key={row.id}
                      className="space-y-4 rounded-lg border bg-background p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Acquirer #{index + 1}</h3>
                        {assignmentRows.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAssignmentRow(row.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Select Acquirer
                        </label>
                        <select
                          value={row.acquirerId}
                          onChange={(e) =>
                            updateAssignmentAcquirer(row.id, e.target.value)
                          }
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Select acquirer</option>
                          {selectableAcquirers.map((acquirer) => (
                            <option key={acquirer.id} value={acquirer.id}>
                              {acquirer.name} ({acquirer.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedAcquirer && (
                        <div>
                          <label className="mb-3 block text-sm font-medium">
                            Select Submerchants
                          </label>

                          {availableSubmerchants.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2">
                              {availableSubmerchants.map((submerchant) => (
                                <label
                                  key={submerchant.id}
                                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/40"
                                >
                                  <Checkbox
                                    checked={row.submerchantIds.includes(
                                      submerchant.id,
                                    )}
                                    onCheckedChange={(checked) =>
                                      toggleSubmerchant(
                                        row.id,
                                        submerchant.id,
                                        checked === true,
                                      )
                                    }
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                      {submerchant.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {submerchant.merchantId}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                              No submerchants available for this acquirer.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Selected User</p>
                  <p className="font-semibold">{projectPreview.userName}</p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-xs text-muted-foreground">
                    Total Acquirers
                  </p>
                  <p className="font-semibold">
                    {projectPreview.totalAcquirers}
                  </p>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-xs text-muted-foreground">
                    Total Submerchants
                  </p>
                  <p className="font-semibold">
                    {projectPreview.totalSubmerchants}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Submit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
