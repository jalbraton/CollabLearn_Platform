import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@collablearn/database"
import { z } from "zod"

const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string(),
})

interface RouteParams {
  params: {
    workspaceId: string
  }
}

// GET /api/workspaces/[workspaceId]/pages - List pages in workspace
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check workspace access
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id,
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const pages = await prisma.page.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/workspaces/[workspaceId]/pages - Create new page
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check workspace access
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id,
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = pageSchema.parse(body)

    // Create page and initial version
    const page = await prisma.page.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        workspaceId: params.workspaceId,
        authorId: session.user.id,
        versions: {
          create: {
            content: validatedData.content,
            createdById: session.user.id,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        workspaceId: params.workspaceId,
        action: "create",
        entityType: "page",
        entityId: page.id,
        metadata: {
          title: page.title,
        },
      },
    })

    return NextResponse.json(
      { page, message: "Page created successfully" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
