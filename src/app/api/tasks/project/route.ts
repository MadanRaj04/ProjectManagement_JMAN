import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {

  const projectId = req.nextUrl.searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID required" },
      { status: 400 }
    )
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: projectId
    },
    include: {
      assignedTo: true
    }
  })

  return NextResponse.json(tasks)
}