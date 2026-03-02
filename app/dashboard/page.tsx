"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

type DashboardData = {
  totalProjects: number
  managedProjects: number
  joinedProjects: number
}

type TaskAnalytics = {
  totalTasks: number
  todo: number
  inProgress: number
  done: number
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [tasks, setTasks] = useState<TaskAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await fetch("/api/dashboard")
        const dashData = await dashRes.json()
        setDashboard(dashData)

        const taskRes = await fetch("/api/dashboard/tasks")
        const taskData = await taskRes.json()
        setTasks(taskData)
      } catch (error) {
        console.error("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-6">Loading dashboard...</div>
  if (!dashboard || !tasks) return <div className="p-6">No data available</div>

  const chartData = [
    { name: "Todo", value: tasks.todo },
    { name: "In Progress", value: tasks.inProgress },
    { name: "Done", value: tasks.done },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard.totalProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard.managedProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Joined Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboard.joinedProjects}</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}