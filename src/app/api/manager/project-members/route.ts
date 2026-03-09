import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {

  const projectId = req.nextUrl.searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" })
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId
    }
  })

  const members = await prisma.projectMember.findMany({
    where: {
      projectId: projectId
    },
    include: {
      user: true
    }
  })

  return NextResponse.json({
    projectName: project?.name,
    members
  })
}