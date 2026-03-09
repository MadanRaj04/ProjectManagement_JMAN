import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  const body = await req.json()
  const { title, projectId } = body

  if (!title || !projectId) {
    return NextResponse.json(
      { error: "Title and Project ID required" },
      { status: 400 }
    )
  }

  const task = await prisma.task.create({
    data: {
      title,
      projectId
    }
  })

  return NextResponse.json(task)
}