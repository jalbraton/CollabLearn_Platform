import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@collablearn/database"
import { z } from "zod"

const webhookSchema = z.object({
  url: z.string().url("Invalid URL"),
  events: z.array(z.enum([
    "page.created",
    "page.updated",
    "page.deleted",
    "comment.created",
    "member.added",
    "member.removed",
    "file.uploaded",
  ])).min(1, "At least one event is required"),
  secret: z.string().optional(),
})

interface RouteParams {
  params: {
    workspaceId: string
  }
}

// GET /api/workspaces/[workspaceId]/webhooks - List webhooks
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or owner
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id,
        role: { in: ["owner", "admin"] },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/workspaces/[workspaceId]/webhooks - Create webhook
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or owner
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id,
        role: { in: ["owner", "admin"] },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = webhookSchema.parse(body)

    const webhook = await prisma.webhook.create({
      data: {
        url: validatedData.url,
        events: validatedData.events,
        secret: validatedData.secret,
        workspaceId: params.workspaceId,
      },
    })

    return NextResponse.json(
      { webhook, message: "Webhook created successfully" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
