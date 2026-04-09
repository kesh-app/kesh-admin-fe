'use client'

import { Users, Briefcase, Building2, ShoppingCart, TrendingUp, Activity } from 'lucide-react'
import { MainLayout } from '@/components/main-layout'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { users, projects } from '@/lib/mock-data'

function RecentUsersTable() {
  const recentUsers = users.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Latest user registrations and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RecentProjectsTable() {
  const recentProjects = projects.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
        <CardDescription>Overview of all projects and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acquirers</TableHead>
              <TableHead>Submerchants</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      project.status === 'active'
                        ? 'success'
                        : project.status === 'inactive'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>{project.acquirers}</TableCell>
                <TableCell>{project.submerchants}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to KESH Admin Panel</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value="1,248"
            change="+12% from last month"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Active Projects"
            value="24"
            change="+2 new projects"
            icon={Briefcase}
            trend="up"
          />
          <StatCard
            title="Acquirers"
            value="6"
            change="5 verified"
            icon={Building2}
            trend="neutral"
          />
          <StatCard
            title="Submerchants"
            value="487"
            change="+45 this month"
            icon={ShoppingCart}
            trend="up"
          />
        </div>

        {/* Tables */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <RecentUsersTable />
          <RecentProjectsTable />
        </div>
      </div>
    </div>
  )
}
