import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {

  const taskId = req.nextUrl.searchParams.get("taskId")

  if (!taskId) {
    return NextResponse.json(
      { error: "Task ID required" },
      { status: 400 }
    )
  }

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: {
      user: true
    },
    orderBy: {
      createdAt: "asc"
    }
  })

  return NextResponse.json(comments)
}