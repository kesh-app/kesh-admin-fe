'use client'

import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import { users, projects, acquirers, submerchants } from '@/lib/mock-data'

type AssignmentType =
  | 'user-project'
  | 'project-acquirer'
  | 'acquirer-submerchant'

type BaseItem = {
  id: string
  name?: string
  email?: string
  description?: string
  project_name?: string
  sub_merchant_name?: string
  sub_merchant_id?: string
}

type UserItem = BaseItem & {
  email?: string
}

type ProjectItem = BaseItem & {
  description?: string
}

type AcquirerItem = BaseItem

type SubmerchantItem = BaseItem & {
  sub_merchant_name?: string
  sub_merchant_id?: string
}

type PendingAssignment = {
  type: AssignmentType
  items: BaseItem[]
  relatedItem?: BaseItem
}

function getItemName(item: BaseItem) {
  return item.name || item.project_name || item.sub_merchant_name || '-'
}

function getProjectDescription(project: ProjectItem) {
  return project.description || 'No description available'
}

export default function AssignmentsPage() {
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>('user-project')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingAssignment, setPendingAssignment] =
    useState<PendingAssignment | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="mt-2 text-muted-foreground">
          Manage relationships between users, projects, acquirers, and
          submerchants
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Assignment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={assignmentType === 'user-project' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('user-project')}
            >
              User → Project
            </Button>

            <Button
              variant={
                assignmentType === 'project-acquirer' ? 'default' : 'outline'
              }
              onClick={() => setAssignmentType('project-acquirer')}
            >
              Project → Acquirer
            </Button>

            <Button
              variant={
                assignmentType === 'acquirer-submerchant'
                  ? 'default'
                  : 'outline'
              }
              onClick={() => setAssignmentType('acquirer-submerchant')}
            >
              Acquirer → Submerchant
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        {assignmentType === 'user-project' && (
          <UserProjectAssignment
            onConfirm={(selectedUsers, selectedProjects) => {
              setPendingAssignment({
                type: 'user-project',
                items: selectedUsers,
                relatedItem: selectedProjects[0],
              })
              setConfirmDialogOpen(true)
            }}
          />
        )}

        {assignmentType === 'project-acquirer' && (
          <ProjectAcquirerAssignment
            onConfirm={(selectedProjects, selectedAcquirers) => {
              setPendingAssignment({
                type: 'project-acquirer',
                items: selectedProjects,
                relatedItem: selectedAcquirers[0],
              })
              setConfirmDialogOpen(true)
            }}
          />
        )}

        {assignmentType === 'acquirer-submerchant' && (
          <AcquirerSubmerchantForm
            onConfirm={(acquirer, selectedSubmerchants) => {
              setPendingAssignment({
                type: 'acquirer-submerchant',
                items: selectedSubmerchants,
                relatedItem: acquirer,
              })
              setConfirmDialogOpen(true)
            }}
          />
        )}
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Please review the assignment details before confirming.
            </DialogDescription>
          </DialogHeader>

          {pendingAssignment && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-lg bg-muted p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Assignment Type
                  </p>
                  <p className="font-semibold text-foreground capitalize">
                    {pendingAssignment.type.replace('-', ' → ')}
                  </p>
                </div>

                {pendingAssignment.relatedItem && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {pendingAssignment.type === 'user-project'
                        ? 'Project'
                        : 'Acquirer'}
                    </p>
                    <p className="font-semibold text-foreground">
                      {getItemName(pendingAssignment.relatedItem)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {pendingAssignment.type === 'user-project'
                      ? 'Users'
                      : pendingAssignment.type === 'project-acquirer'
                      ? 'Projects'
                      : 'Submerchants'}{' '}
                    ({pendingAssignment.items.length})
                  </p>

                  <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                    {pendingAssignment.items.map((item) => (
                      <p key={item.id} className="text-sm text-foreground">
                        • {getItemName(item)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Please ensure all information is correct before confirming
                  this assignment.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmDialogOpen(false)
                setPendingAssignment(null)
              }}
            >
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserProjectAssignment({
  onConfirm,
}: {
  onConfirm: (users: UserItem[], projects: ProjectItem[]) => void
}) {
  const [searchUsers, setSearchUsers] = useState('')
  const [searchProjects, setSearchProjects] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return (users as UserItem[]).filter((user) => {
      const query = searchUsers.toLowerCase()
      return (
        getItemName(user).toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query)
      )
    })
  }, [searchUsers])

  const filteredProjects = useMemo(() => {
    return (projects as ProjectItem[]).filter((project) =>
      getItemName(project).toLowerCase().includes(searchProjects.toLowerCase())
    )
  }, [searchProjects])

  const canAssign = selectedUsers.length > 0 && !!selectedProject

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Users</CardTitle>
          <CardDescription>
            Choose users to assign ({selectedUsers.length} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search users..."
            value={searchUsers}
            onChange={(e) => setSearchUsers(e.target.value)}
          />

          <ScrollArea className="h-96 rounded-lg border">
            <div className="space-y-3 p-4">
              {filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers((prev) => [...prev, user.id])
                        return
                      }

                      setSelectedUsers((prev) =>
                        prev.filter((id) => id !== user.id)
                      )
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {getItemName(user)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email || '-'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Project</CardTitle>
          <CardDescription>
            Choose a project to assign users to
            {selectedProject ? ' (Selected)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search projects..."
            value={searchProjects}
            onChange={(e) => setSearchProjects(e.target.value)}
          />

          <ScrollArea className="h-96 rounded-lg border">
            <div className="space-y-3 p-4">
              {filteredProjects.map((project) => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={selectedProject === project.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProject(project.id)
                        return
                      }

                      setSelectedProject(null)
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {getItemName(project)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getProjectDescription(project)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Button
          className="w-full"
          disabled={!canAssign}
          onClick={() => {
            const selectedUserObjects = (users as UserItem[]).filter((user) =>
              selectedUsers.includes(user.id)
            )
            const selectedProjectObjects = (projects as ProjectItem[]).filter(
              (project) => project.id === selectedProject
            )

            onConfirm(selectedUserObjects, selectedProjectObjects)
          }}
        >
          Assign Users to Project
        </Button>
      </div>
    </div>
  )
}

function ProjectAcquirerAssignment({
  onConfirm,
}: {
  onConfirm: (projects: ProjectItem[], acquirers: AcquirerItem[]) => void
}) {
  const [searchProjects, setSearchProjects] = useState('')
  const [searchAcquirers, setSearchAcquirers] = useState('')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedAcquirer, setSelectedAcquirer] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return (projects as ProjectItem[]).filter((project) =>
      getItemName(project).toLowerCase().includes(searchProjects.toLowerCase())
    )
  }, [searchProjects])

  const filteredAcquirers = useMemo(() => {
    return (acquirers as AcquirerItem[]).filter((acquirer) =>
      getItemName(acquirer)
        .toLowerCase()
        .includes(searchAcquirers.toLowerCase())
    )
  }, [searchAcquirers])

  const canAssign = selectedProjects.length > 0 && !!selectedAcquirer

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Projects</CardTitle>
          <CardDescription>
            Choose projects to link ({selectedProjects.length} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search projects..."
            value={searchProjects}
            onChange={(e) => setSearchProjects(e.target.value)}
          />

          <ScrollArea className="h-96 rounded-lg border">
            <div className="space-y-3 p-4">
              {filteredProjects.map((project) => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProjects((prev) => [...prev, project.id])
                        return
                      }

                      setSelectedProjects((prev) =>
                        prev.filter((id) => id !== project.id)
                      )
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {getItemName(project)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getProjectDescription(project)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Acquirer</CardTitle>
          <CardDescription>
            Choose an acquirer to link projects to
            {selectedAcquirer ? ' (Selected)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search acquirers..."
            value={searchAcquirers}
            onChange={(e) => setSearchAcquirers(e.target.value)}
          />

          <ScrollArea className="h-96 rounded-lg border">
            <div className="space-y-3 p-4">
              {filteredAcquirers.map((acquirer) => (
                <label
                  key={acquirer.id}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox
                    checked={selectedAcquirer === acquirer.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAcquirer(acquirer.id)
                        return
                      }

                      setSelectedAcquirer(null)
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {getItemName(acquirer)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Button
          className="w-full"
          disabled={!canAssign}
          onClick={() => {
            const selectedProjectObjects = (projects as ProjectItem[]).filter(
              (project) => selectedProjects.includes(project.id)
            )
            const selectedAcquirerObjects = (
              acquirers as AcquirerItem[]
            ).filter((acquirer) => acquirer.id === selectedAcquirer)

            onConfirm(selectedProjectObjects, selectedAcquirerObjects)
          }}
        >
          Link Projects to Acquirer
        </Button>
      </div>
    </div>
  )
}

function AcquirerSubmerchantForm({
  onConfirm,
}: {
  onConfirm: (acquirer: AcquirerItem, submerchants: SubmerchantItem[]) => void
}) {
  const [selectedAcquirer, setSelectedAcquirer] = useState<string | null>(null)
  const [searchSubmerchants, setSearchSubmerchants] = useState('')
  const [selectedSubmerchants, setSelectedSubmerchants] = useState<string[]>([])

  const selectedAcquirerObject = (acquirers as AcquirerItem[]).find(
    (acquirer) => acquirer.id === selectedAcquirer
  )

  const filteredSubmerchants = useMemo(() => {
    return (submerchants as SubmerchantItem[]).filter((submerchant) =>
      getItemName(submerchant)
        .toLowerCase()
        .includes(searchSubmerchants.toLowerCase())
    )
  }, [searchSubmerchants])

  const canAssign = !!selectedAcquirer && selectedSubmerchants.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 1: Select Acquirer</CardTitle>
          <CardDescription>
            Choose an acquirer to register submerchants under
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(acquirers as AcquirerItem[]).map((acquirer) => (
              <Card
                key={acquirer.id}
                className={`cursor-pointer transition-colors ${
                  selectedAcquirer === acquirer.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => {
                  setSelectedAcquirer(acquirer.id)
                  setSelectedSubmerchants([])
                }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {getItemName(acquirer)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ID: {acquirer.id}
                      </p>
                    </div>

                    {selectedAcquirer === acquirer.id && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedAcquirerObject ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Step 2: Register Submerchants
            </CardTitle>
            <CardDescription>
              Add submerchants to{' '}
              <span className="font-semibold">
                {getItemName(selectedAcquirerObject)}
              </span>{' '}
              ({selectedSubmerchants.length} selected)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Search submerchants..."
              value={searchSubmerchants}
              onChange={(e) => setSearchSubmerchants(e.target.value)}
            />

            <ScrollArea className="h-96 rounded-lg border">
              <div className="space-y-3 p-4">
                {filteredSubmerchants.map((submerchant) => (
                  <label
                    key={submerchant.id}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <Checkbox
                      checked={selectedSubmerchants.includes(submerchant.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSubmerchants((prev) => [
                            ...prev,
                            submerchant.id,
                          ])
                          return
                        }

                        setSelectedSubmerchants((prev) =>
                          prev.filter((id) => id !== submerchant.id)
                        )
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getItemName(submerchant)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submerchant.sub_merchant_id || submerchant.id}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>

            <Button
              className="w-full"
              disabled={!canAssign}
              onClick={() => {
                if (!selectedAcquirerObject) return

                const selectedSubmerchantObjects = (
                  submerchants as SubmerchantItem[]
                ).filter((submerchant) =>
                  selectedSubmerchants.includes(submerchant.id)
                )

                onConfirm(selectedAcquirerObject, selectedSubmerchantObjects)
              }}
            >
              Register Submerchants
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pb-8 pt-8 text-center">
            <p className="text-muted-foreground">
              Select an acquirer to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}