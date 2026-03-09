import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {

  const userId = req.cookies.get("userId")?.value

  console.log("COOKIE USERID:", userId)

  if (!userId) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 }
    )
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: userId
    }
  })

  return NextResponse.json(tasks)
}