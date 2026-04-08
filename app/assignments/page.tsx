'use client'

import { useState } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { MainLayout } from '@/components/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { users, projects, acquirers, submerchants } from '@/lib/mock-data'

type AssignmentType = 'submerchant-acquirer' | 'user-project'

export default function AssignmentsPage() {
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('submerchant-acquirer')
  const [searchUsers, setSearchUsers] = useState('')
  const [searchLeft, setSearchLeft] = useState('')
  const [searchRight, setSearchRight] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectedLeft, setSelectedLeft] = useState<Set<string>>(new Set())
  const [selectedRight, setSelectedRight] = useState<Set<string>>(new Set())
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Filter data based on assignment type
  const leftPanel =
    assignmentType === 'submerchant-acquirer'
      ? submerchants.filter((item) =>
        item.name.toLowerCase().includes(searchLeft.toLowerCase()) ||
        item.merchantId.toLowerCase().includes(searchLeft.toLowerCase())
      )
      : acquirers.filter((item) =>
        item.name.toLowerCase().includes(searchLeft.toLowerCase()) ||
        item.code.toLowerCase().includes(searchLeft.toLowerCase())
      )

  const rightPanel =
    assignmentType === 'submerchant-acquirer'
      ? acquirers.filter((item) =>
        item.name.toLowerCase().includes(searchRight.toLowerCase()) ||
        item.code.toLowerCase().includes(searchRight.toLowerCase())
      )
      : projects.filter((item) =>
        item.name.toLowerCase().includes(searchRight.toLowerCase())
      )

  const isAnySelected = selectedLeft.size > 0 && selectedRight.size > 0
  const leftLabel = assignmentType === 'submerchant-acquirer' ? 'Submerchant' : 'Acquirer'
  const rightLabel = assignmentType === 'submerchant-acquirer' ? 'Acquirer' : 'Project'

  const handleConfirm = () => {
    setShowConfirmation(false)
    // Reset selections after confirmation
    setSelectedLeft(new Set())
    setSelectedRight(new Set())
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
