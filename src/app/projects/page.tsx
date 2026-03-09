"use client"

import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

import { Button } from "@/components/ui/button"

const projects = [

  {

    id: "1",

    name: "Website App",

    status: "ACTIVE",

    manager: "John",

    members: 5

  },

  {

    id: "2",

    name: "Mobile App",

    status: "ACTIVE",

    manager: "Alice",

    members: 3

  }

]

export default function ProjectsPage() {

  return (
<div className="min-h-screen bg-gray-100 p-8">
<div className="flex justify-between mb-8">
<h1 className="text-3xl font-bold">

          Projects
</h1>
<Link href="/projects/create">
<Button>+ Create Project</Button>
</Link>
</div>
<div className="grid grid-cols-3 gap-6">

        {projects.map((project) => (
<Card key={project.id}>
<CardContent className="p-5">
<h2 className="text-xl font-semibold">

                {project.name}
</h2>
<p className="text-sm">

                Manager: {project.manager}
</p>
<p className="text-sm">

                Members: {project.members}
</p>
<p className="text-sm">

                Status: {project.status}
</p>
<Link href={`/projects/${project.id}`}>
<Button className="mt-4 w-full">

                  Open Project
</Button>
</Link>
</CardContent>
</Card>

        ))}
</div>
</div>

  )

}
 