import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

// ⚠️ MOCK USER ID — REPLACE WITH REAL AUTH LATER
const getUserId = () => {
  return "REAL_USER_ID_HERE"
}

export async function GET() {
  try {
    const userId = getUserId()

    // Get projects where user is manager
    const managedProjects = await prisma.project.findMany({
      where: { managerId: userId },
      select: { id: true },
    })

    // Get projects where user is member
    const memberProjects = await prisma.projectMember.findMany({
      where: { userId: userId },
      select: { projectId: true },
    })

    const projectIds = [
    ...managedProjects.map((p: { id: string }) => p.id),
    ...memberProjects.map((m: { projectId: string }) => m.projectId),
    ]


    // Count total tasks
    const totalTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
      },
    })

    const todo = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: "TODO",
      },
    })

    const inProgress = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: "IN_PROGRESS",
      },
    })

    const done = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: "DONE",
      },
    })

    return NextResponse.json({
      totalTasks,
      todo,
      inProgress,
      done,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task analytics" },
      { status: 500 }
    )
  }
}
