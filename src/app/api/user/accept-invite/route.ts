import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  const { inviteId, projectId, userId } = await req.json()

  await prisma.projectInvite.update({
    where: { id: inviteId },
    data: { status: "ACCEPTED" }
  })

  await prisma.projectMember.create({
    data: {
      projectId,
      userId
    }
  })

  return NextResponse.json({
    message: "Invite accepted"
  })
}