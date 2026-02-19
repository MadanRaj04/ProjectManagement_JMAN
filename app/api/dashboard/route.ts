import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

// TEMP: Replace this later with real auth
const getUserId = () => {
  return "USER_ID_HERE"
}

export async function GET() {
  try {
    const userId = getUserId()

    // Count managed projects
    const managedProjects = await prisma.project.count({
      where: {
        managerId: userId,
      },
    })

    // Count joined projects
    const joinedProjects = await prisma.projectMember.count({
      where: {
        userId: userId,
      },
    })

    const totalProjects = managedProjects + joinedProjects

    return NextResponse.json({
      totalProjects,
      managedProjects,
      joinedProjects,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
