"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function ManagerDashboard() {

  const [projects, setProjects] = useState<any[]>([])
  const [name, setName] = useState("")

  const fetchProjects = async () => {
    const res = await fetch("/api/manager/projects", {
      credentials: "include"
    })

    const data = await res.json()
    setProjects(data)
  }

  const createProject = async () => {

    const res = await fetch("/api/manager/create-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name })
    })

    const data = await res.json()

    if (res.ok) {
      alert("Project created")
      setName("")
      fetchProjects()
    } else {
      alert(data.error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div style={{ padding: "40px" }}>

      <h1>Manager Dashboard</h1>

      <h2>Create Project</h2>

      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createProject}>Create</button>

      <h2>Your Projects</h2>

      {projects.map((project) => (
        <div key={project.id}>
          <Link href={`/manager/project/${project.id}`}>
            📁 {project.name}
          </Link>
        </div>
      ))}

    </div>
  )
}