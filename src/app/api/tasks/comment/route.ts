import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  try {

    const { taskId, content } = await req.json()

    const userId = req.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      )
    }

    if (!taskId || !content) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(comment)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}