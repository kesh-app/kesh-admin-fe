'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { mockUsers, mockProjects, mockAcquirers, mockSubmerchants } from '@/lib/mock-data'
import { AlertCircle } from 'lucide-react'

type AssignmentType = 'user-project' | 'project-acquirer' | 'acquirer-submerchant'

export default function AssignmentsPage() {
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('user-project')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingAssignment, setPendingAssignment] = useState<{
    type: AssignmentType
    items: any[]
    relatedItem?: any
  } | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground mt-2">
          Manage relationships between users, projects, acquirers, and submerchants
        </p>
      </div>

      {/* Assignment Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Assignment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={assignmentType === 'user-project' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('user-project')}
              className={assignmentType === 'user-project' ? 'bg-primary text-primary-foreground' : ''}
            >
              User → Project
            </Button>
            <Button
              variant={assignmentType === 'project-acquirer' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('project-acquirer')}
              className={assignmentType === 'project-acquirer' ? 'bg-primary text-primary-foreground' : ''}
            >
              Project → Acquirer
            </Button>
            <Button
              variant={assignmentType === 'acquirer-submerchant' ? 'default' : 'outline'}
              onClick={() => setAssignmentType('acquirer-submerchant')}
              className={assignmentType === 'acquirer-submerchant' ? 'bg-primary text-primary-foreground' : ''}
            >
              Acquirer → Submerchant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Content */}
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
            onConfirm={(acquirer, submerchants) => {
              setPendingAssignment({
                type: 'acquirer-submerchant',
                items: submerchants,
                relatedItem: acquirer,
              })
              setConfirmDialogOpen(true)
            }}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Assignment</DialogTitle>
            <DialogDescription>
              Please review the assignment details before confirming
            </DialogDescription>
          </DialogHeader>
          {pendingAssignment && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assignment Type</p>
                  <p className="text-foreground font-semibold capitalize">
                    {pendingAssignment.type.replace('-', ' → ')}
                  </p>
                </div>
                {pendingAssignment.relatedItem && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {pendingAssignment.type === 'user-project'
                        ? 'Project'
                        : pendingAssignment.type === 'project-acquirer'
                        ? 'Acquirer'
                        : 'Acquirer'}
                    </p>
                    <p className="text-foreground font-semibold">{pendingAssignment.relatedItem.name}</p>
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
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {pendingAssignment.items.map((item) => (
                      <p key={item.id} className="text-sm text-foreground">
                        • {item.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Please ensure all information is correct before confirming this assignment.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

// Flow 1: User → Project Assignment
function UserProjectAssignment({
  onConfirm,
}: {
  onConfirm: (users: any[], projects: any[]) => void
}) {
  const [searchUsers, setSearchUsers] = useState('')
  const [searchProjects, setSearchProjects] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const filteredUsers = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  )

  const filteredProjects = mockProjects.filter((p) =>
    p.name.toLowerCase().includes(searchProjects.toLowerCase())
  )

  const canAssign = selectedUsers.length > 0 && selectedProject

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Users Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Users</CardTitle>
          <CardDescription>Choose users to assign ({selectedUsers.length} selected)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search users..."
            value={searchUsers}
            onChange={(e) => setSearchUsers(e.target.value)}
          />
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4 space-y-3">
              {filteredUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers([...selectedUsers, user.id])
                      } else {
                        setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Projects Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Project</CardTitle>
          <CardDescription>
            Choose a project to assign users to{selectedProject ? ' (Selected)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search projects..."
            value={searchProjects}
            onChange={(e) => setSearchProjects(e.target.value)}
          />
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4 space-y-3">
              {filteredProjects.map((project) => (
                <label key={project.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={selectedProject === project.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProject(project.id)
                      } else {
                        setSelectedProject(null)
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="md:col-span-2">
        <Button
          onClick={() => {
            const selectedUserObjs = mockUsers.filter((u) => selectedUsers.includes(u.id))
            const selectedProjectObjs = mockProjects.filter((p) => p.id === selectedProject)
            onConfirm(selectedUserObjs, selectedProjectObjs)
          }}
          disabled={!canAssign}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Assign Users to Project
        </Button>
      </div>
    </div>
  )
}

// Flow 2: Project → Acquirer Assignment
function ProjectAcquirerAssignment({
  onConfirm,
}: {
  onConfirm: (projects: any[], acquirers: any[]) => void
}) {
  const [searchProjects, setSearchProjects] = useState('')
  const [searchAcquirers, setSearchAcquirers] = useState('')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedAcquirer, setSelectedAcquirer] = useState<string | null>(null)

  const filteredProjects = mockProjects.filter((p) =>
    p.name.toLowerCase().includes(searchProjects.toLowerCase())
  )

  const filteredAcquirers = mockAcquirers.filter((a) =>
    a.name.toLowerCase().includes(searchAcquirers.toLowerCase())
  )

  const canAssign = selectedProjects.length > 0 && selectedAcquirer

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Projects Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Projects</CardTitle>
          <CardDescription>Choose projects to link ({selectedProjects.length} selected)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search projects..."
            value={searchProjects}
            onChange={(e) => setSearchProjects(e.target.value)}
          />
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4 space-y-3">
              {filteredProjects.map((project) => (
                <label key={project.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProjects([...selectedProjects, project.id])
                      } else {
                        setSelectedProjects(selectedProjects.filter((id) => id !== project.id))
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Acquirers Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Acquirer</CardTitle>
          <CardDescription>
            Choose an acquirer to link projects to{selectedAcquirer ? ' (Selected)' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search acquirers..."
            value={searchAcquirers}
            onChange={(e) => setSearchAcquirers(e.target.value)}
          />
          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-4 space-y-3">
              {filteredAcquirers.map((acquirer) => (
                <label key={acquirer.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={selectedAcquirer === acquirer.id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAcquirer(acquirer.id)
                      } else {
                        setSelectedAcquirer(null)
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{acquirer.name}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="md:col-span-2">
        <Button
          onClick={() => {
            const selectedProjectObjs = mockProjects.filter((p) => selectedProjects.includes(p.id))
            const selectedAcquirerObjs = mockAcquirers.filter((a) => a.id === selectedAcquirer)
            onConfirm(selectedProjectObjs, selectedAcquirerObjs)
          }}
          disabled={!canAssign}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Link Projects to Acquirer
        </Button>
      </div>
    </div>
  )
}

// Flow 3: Acquirer → Submerchant Assignment (Form-based)
function AcquirerSubmerchantForm({
  onConfirm,
}: {
  onConfirm: (acquirer: any, submerchants: any[]) => void
}) {
  const [selectedAcquirer, setSelectedAcquirer] = useState<string | null>(null)
  const [searchSubmerchants, setSearchSubmerchants] = useState('')
  const [selectedSubmerchants, setSelectedSubmerchants] = useState<string[]>([])

  const selectedAcquirerObj = mockAcquirers.find((a) => a.id === selectedAcquirer)

  const filteredSubmerchants = mockSubmerchants.filter((s) =>
    s.name.toLowerCase().includes(searchSubmerchants.toLowerCase())
  )

  const canAssign = selectedAcquirer && selectedSubmerchants.length > 0

  return (
    <div className="space-y-6">
      {/* Step 1: Select Acquirer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 1: Select Acquirer</CardTitle>
          <CardDescription>Choose an acquirer to register submerchants under</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAcquirers.map((acquirer) => (
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
                      <p className="font-semibold text-foreground">{acquirer.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {acquirer.id}</p>
                    </div>
                    {selectedAcquirer === acquirer.id && (
                      <div className="w-5 h-5 bg-primary rounded-full text-primary-foreground flex items-center justify-center">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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

      {/* Step 2: Register Submerchants */}
      {selectedAcquirerObj && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 2: Register Submerchants</CardTitle>
            <CardDescription>
              Add submerchants to <span className="font-semibold">{selectedAcquirerObj.name}</span> (
              {selectedSubmerchants.length} selected)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search submerchants..."
              value={searchSubmerchants}
              onChange={(e) => setSearchSubmerchants(e.target.value)}
            />
            <ScrollArea className="h-96 border rounded-lg">
              <div className="p-4 space-y-3">
                {filteredSubmerchants.map((submerchant) => (
                  <label key={submerchant.id} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedSubmerchants.includes(submerchant.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSubmerchants([...selectedSubmerchants, submerchant.id])
                        } else {
                          setSelectedSubmerchants(
                            selectedSubmerchants.filter((id) => id !== submerchant.id)
                          )
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{submerchant.name}</p>
                      <p className="text-xs text-muted-foreground">{submerchant.id}</p>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>

            <Button
              onClick={() => {
                const selectedSubmerchantObjs = mockSubmerchants.filter((s) =>
                  selectedSubmerchants.includes(s.id)
                )
                onConfirm(selectedAcquirerObj, selectedSubmerchantObjs)
              }}
              disabled={!canAssign}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Register Submerchants
            </Button>
          </CardContent>
        </Card>
      )}

      {!selectedAcquirerObj && (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-muted-foreground">Select an acquirer to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-2">Manage relationships between entities</p>
        </div>

        {/* Assignment Type Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <Button
                variant={assignmentType === 'submerchant-acquirer' ? 'default' : 'outline'}
                onClick={() => {
                  setAssignmentType('submerchant-acquirer')
                  setSelectedLeft(new Set())
                  setSelectedRight(new Set())
                  setSearchLeft('')
                  setSearchRight('')
                }}
              >
                Submerchant ↔ Acquirer
              </Button>
              <Button
                variant={assignmentType === 'user-project' ? 'default' : 'outline'}
                onClick={() => {
                  setAssignmentType('user-project')
                  setSelectedLeft(new Set())
                  setSelectedRight(new Set())
                  setSearchLeft('')
                  setSearchRight('')
                }}
              >
                User ↔ Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Create Assignment</CardTitle>
            <CardDescription>
              Select {leftLabel.toLowerCase()} and {rightLabel.toLowerCase()} to create relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Left Panel - Submerchants/Acquirers */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-3">{leftLabel}s</h3>
                  <Input
                    placeholder={`Search ${leftLabel.toLowerCase()}...`}
                    value={searchLeft}
                    onChange={(e) => setSearchLeft(e.target.value)}
                    className="mb-4"
                  />
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {leftPanel.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-background transition-colors"
                      >
                        <Checkbox
                          checked={selectedLeft.has(item.id)}
                          onCheckedChange={(checked) => {
                            const newSet = new Set(selectedLeft)
                            if (checked) {
                              newSet.add(item.id)
                            } else {
                              newSet.delete(item.id)
                            }
                            setSelectedLeft(newSet)
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          {assignmentType === 'submerchant-acquirer' ? (
                            'merchantId' in item && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.merchantId}
                              </p>
                            )
                          ) : null}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Selected: {selectedLeft.size}
                  </p>
                </div>
              </div>

              {/* Center - Arrow & Summary */}
              <div className="flex flex-col items-center justify-center gap-4">
                <ArrowRight className="h-6 w-6 text-primary hidden lg:block" />
                <div className="bg-background border rounded-lg p-4 w-full text-center">
                  <p className="text-xs text-muted-foreground mb-2">Will assign:</p>
                  <p className="text-lg font-bold text-foreground">
                    {selectedLeft.size * selectedRight.size}
                  </p>
                  <p className="text-xs text-muted-foreground">relationship{selectedLeft.size * selectedRight.size !== 1 ? 's' : ''}</p>
                </div>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!isAnySelected}
                  className="w-full"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </div>

              {/* Right Panel - Acquirers/Projects */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-3">{rightLabel}s</h3>
                  <Input
                    placeholder={`Search ${rightLabel.toLowerCase()}...`}
                    value={searchRight}
                    onChange={(e) => setSearchRight(e.target.value)}
                    className="mb-4"
                  />
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {rightPanel.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-background transition-colors"
                      >
                        <Checkbox
                          checked={selectedRight.has(item.id)}
                          onCheckedChange={(checked) => {
                            const newSet = new Set(selectedRight)
                            if (checked) {
                              newSet.add(item.id)
                            } else {
                              newSet.delete(item.id)
                            }
                            setSelectedRight(newSet)
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          {'code' in item && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.code}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Selected: {selectedRight.size}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Assignment</DialogTitle>
              <DialogDescription>
                You are about to create {selectedLeft.size * selectedRight.size} relationship
                {selectedLeft.size * selectedRight.size !== 1 ? 's' : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Summary:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    {leftLabel}s selected: <span className="font-semibold text-foreground">{selectedLeft.size}</span>
                  </li>
                  <li>
                    {rightLabel}s selected: <span className="font-semibold text-foreground">{selectedRight.size}</span>
                  </li>
                  <li>
                    Total relationships: <span className="font-semibold text-foreground">{selectedLeft.size * selectedRight.size}</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This action will create new relationships. Existing ones will not be affected.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Confirm Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
