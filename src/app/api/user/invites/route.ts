import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {

  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const invites = await prisma.projectInvite.findMany({
      where: {
        userId: decoded.id,
        status: "PENDING"
      },
      include: {
        project: true
      }
    })

    return NextResponse.json(invites)

  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}