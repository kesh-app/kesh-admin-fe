'use client'

import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Building2, FolderOpen, User2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  acquirers,
  projectAssignments,
  projects,
  submerchants,
  users,
} from '@/lib/mock-data'
import type { Acquirer, Submerchant } from '@/lib/mock-data'

type AssignmentGroup = {
  acquirer: Acquirer | undefined
  submerchants: Submerchant[]
}

const projectStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'archived':
      return 'outline-solid'
    default:
      return 'secondary'
  }
}

const submerchantStatusVariant = (status: string) => {
  switch (status) {
    case 'verified':
      return 'success'
    case 'pending':
      return 'warning'
    case 'disabled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const project = projects.find((item) => item.id === projectId)

  if (!project) {
    notFound()
  }

  const projectUser = users.find((user) => user.id === project.userId)
  const projectAssignment = projectAssignments.find(
    (item) => item.projectId === project.id
  )

  const assignmentGroups: AssignmentGroup[] =
    projectAssignment?.assignments.map((assignment) => {
      const acquirer = acquirers.find((item) => item.id === assignment.acquirerId)

      const relatedSubmerchants: Submerchant[] = assignment.submerchantIds
        .map((submerchantId) =>
          submerchants.find((item) => item.id === submerchantId)
        )
        .filter((item): item is Submerchant => Boolean(item))

      return {
        acquirer,
        submerchants: relatedSubmerchants,
      }
    }) ?? []

  const acquirerCount = assignmentGroups.length
  const submerchantCount = assignmentGroups.reduce(
    (total, group) => total + group.submerchants.length,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/projects">
            <Button variant="ghost" className="-ml-3 mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <Badge variant={projectStatusVariant(project.status)}>
              {project.status}
            </Badge>
          </div>

          <p className="mt-1 text-muted-foreground">
            View project information, owner, acquirer assignments, and submerchants.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Edit Project</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Project ID</p>
              <p className="font-semibold">{project.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Project Owner</p>
              <p className="font-semibold">{projectUser?.name || '-'}</p>
              <p className="text-xs text-muted-foreground">
                {projectUser?.email || '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assignments</p>
              <p className="font-semibold">
                {acquirerCount} Acquirer · {submerchantCount} Submerchant
              </p>
              <p className="text-xs text-muted-foreground">
                Created at {project.createdAt}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Main information for this project.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Project Name</p>
            <p className="mt-1 font-medium">{project.name}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-2">
              <Badge variant={projectStatusVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Owner</p>
            <p className="mt-1 font-medium">{projectUser?.name || '-'}</p>
            <p className="text-sm text-muted-foreground">
              {projectUser?.email || '-'}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Created Date</p>
            <p className="mt-1 font-medium">{project.createdAt}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acquirer & Submerchant Details</CardTitle>
          <CardDescription>
            List of acquirers connected to this project and their submerchants.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {assignmentGroups.length > 0 ? (
            assignmentGroups.map((group, index) => (
              <div
                key={`${group.acquirer?.id ?? 'unknown'}-${index}`}
                className="rounded-xl border p-4"
              >
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Acquirer</p>
                    <h3 className="text-lg font-semibold">
                      {group.acquirer?.name || 'Unknown Acquirer'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Code: {group.acquirer?.code || '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {group.acquirer?.status && (
                      <Badge variant="secondary">{group.acquirer.status}</Badge>
                    )}
                    <Badge variant="outline">
                      {group.submerchants.length} Submerchant
                    </Badge>
                  </div>
                </div>

                {group.submerchants.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {group.submerchants.map((submerchant) => (
                      <div
                        key={submerchant.id}
                        className="rounded-lg border bg-muted/30 p-4"
                      >
                        <p className="font-medium">{submerchant.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Merchant ID: {submerchant.merchantId}
                        </p>
                        <div className="mt-3">
                          <Badge variant={submerchantStatusVariant(submerchant.status)}>
                            {submerchant.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No submerchants assigned under this acquirer.
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No assignment details available for this project.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}