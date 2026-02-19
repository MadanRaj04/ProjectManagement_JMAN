import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

// ⚠️ MOCK USER ID — REPLACE WITH REAL AUTH LATER
const getUserId = () => {
  return "REAL_USER_ID_HERE"
}

export async function GET() {
  try {
    const userId = getUserId()

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assigned tasks" },
      { status: 500 }
    )
  }
}
