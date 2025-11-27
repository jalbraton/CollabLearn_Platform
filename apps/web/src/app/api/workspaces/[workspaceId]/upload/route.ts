import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@collablearn/database"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

interface RouteParams {
  params: {
    workspaceId: string
  }
}

// POST /api/workspaces/[workspaceId]/upload - Upload file
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const pageId = formData.get("pageId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`

    // In production, upload to MinIO/S3
    // For now, save locally (this is just a placeholder)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // TODO: Upload to MinIO
    // const uploadPath = join(process.cwd(), "uploads", params.workspaceId, uniqueFilename)
    // await writeFile(uploadPath, buffer)

    // Save file record to database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${params.workspaceId}/${uniqueFilename}`, // Placeholder URL
        workspaceId: params.workspaceId,
        uploadedById: session.user.id,
        ...(pageId ? { pageId } : {}),
      },
      include: {
        uploadedBy: {
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
        action: "upload",
        entityType: "file",
        entityId: fileUpload.id,
        metadata: {
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        },
      },
    })

    return NextResponse.json(
      {
        file: fileUpload,
        message: "File uploaded successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/workspaces/[workspaceId]/upload - List files
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

    const { searchParams } = new URL(req.url)
    const pageId = searchParams.get("pageId")

    const files = await prisma.fileUpload.findMany({
      where: {
        workspaceId: params.workspaceId,
        ...(pageId ? { pageId } : {}),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
