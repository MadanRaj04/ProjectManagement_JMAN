import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  const { taskId, userId } = await req.json()

  if (!taskId || !userId) {
    return NextResponse.json(
      { error: "Task ID and user ID required" },
      { status: 400 }
    )
  }

  const task = await prisma.task.update({
    where: {
      id: taskId
    },
    data: {
      assignedToId: userId
    }
  })

  return NextResponse.json(task)
}