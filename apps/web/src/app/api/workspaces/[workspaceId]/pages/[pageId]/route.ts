import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@collablearn/database"
import { z } from "zod"

const pageUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
})

interface RouteParams {
  params: {
    workspaceId: string
    pageId: string
  }
}

// GET /api/workspaces/[workspaceId]/pages/[pageId] - Get page details
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

    const page = await prisma.page.findUnique({
      where: {
        id: params.pageId,
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        versions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/workspaces/[workspaceId]/pages/[pageId] - Update page
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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
    const validatedData = pageUpdateSchema.parse(body)

    // Update page
    const page = await prisma.page.update({
      where: {
        id: params.pageId,
        workspaceId: params.workspaceId,
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    // Create new version if content changed
    if (validatedData.content) {
      await prisma.pageVersion.create({
        data: {
          pageId: params.pageId,
          content: validatedData.content,
          createdById: session.user.id,
        },
      })
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        workspaceId: params.workspaceId,
        action: "update",
        entityType: "page",
        entityId: page.id,
        metadata: {
          title: page.title,
        },
      },
    })

    return NextResponse.json({ page, message: "Page updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/workspaces/[workspaceId]/pages/[pageId] - Delete page
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is owner or admin
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id,
        role: {
          in: ["owner", "admin"],
        },
      },
    })

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      select: { authorId: true },
    })

    if (!member && page?.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.page.delete({
      where: {
        id: params.pageId,
        workspaceId: params.workspaceId,
      },
    })

    return NextResponse.json({ message: "Page deleted successfully" })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
