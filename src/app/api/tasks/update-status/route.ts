import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, TaskStatus } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  const { taskId, status } = await req.json()

  if (!taskId || !status) {
    return NextResponse.json(
      { error: "Task ID and status required" },
      { status: 400 }
    )
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as TaskStatus
    }
  })

  return NextResponse.json(task)
}