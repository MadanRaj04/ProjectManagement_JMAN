import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"


const getUserId = () => {
  return "USER_ID_HERE"
}

export async function GET() {
  try {
    const userId = getUserId()

    const managedProjects = await prisma.project.findMany({
      where: {
        managerId: userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    })

    const joinedProjects = await prisma.projectMember.findMany({
    where: { userId },
    include: {
        project: {
        select: {
            id: true,
            name: true,
            status: true,
        },
        },
    },
    }) as Array<{
    project: {
        id: string
        name: string
        status: string
    }
    }>


    return NextResponse.json({
      managedProjects,
      joinedProjects: joinedProjects.map((j) => j.project),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project summary" },
      { status: 500 }
    )
  }
}
