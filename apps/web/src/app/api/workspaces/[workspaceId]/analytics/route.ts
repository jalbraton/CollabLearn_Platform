import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@collablearn/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Verify workspace access
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch analytics data
    const [
      totalPages,
      totalComments,
      totalMembers,
      activeUsers,
      pageActivity,
      topPages,
      memberActivity,
      activityByHour,
    ] = await Promise.all([
      // Total pages
      prisma.page.count({
        where: { workspaceId: params.workspaceId },
      }),

      // Total comments
      prisma.comment.count({
        where: {
          page: { workspaceId: params.workspaceId },
        },
      }),

      // Total members
      prisma.workspaceMember.count({
        where: { workspaceId: params.workspaceId },
      }),

      // Active users (last 24h)
      prisma.activity.groupBy({
        by: ['userId'],
        where: {
          workspaceId: params.workspaceId,
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Page activity over time
      prisma.activity.groupBy({
        by: ['createdAt'],
        where: {
          workspaceId: params.workspaceId,
          createdAt: { gte: startDate },
          type: { in: ['page_viewed', 'page_edited'] },
        },
        _count: true,
      }),

      // Top pages
      prisma.page.findMany({
        where: { workspaceId: params.workspaceId },
        include: {
          _count: {
            select: {
              comments: true,
              versions: true,
            },
          },
          activity: {
            where: {
              type: 'page_viewed',
              createdAt: { gte: startDate },
            },
          },
        },
        take: 5,
        orderBy: {
          activity: {
            _count: 'desc',
          },
        },
      }),

      // Member activity
      prisma.user.findMany({
        where: {
          workspaceMembers: {
            some: { workspaceId: params.workspaceId },
          },
        },
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
          activity: {
            where: {
              workspaceId: params.workspaceId,
              createdAt: { gte: startDate },
              type: 'page_edited',
            },
          },
        },
        take: 10,
      }),

      // Activity by hour
      prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "createdAt") as hour,
          COUNT(*) as activity
        FROM "Activity"
        WHERE "workspaceId" = ${params.workspaceId}
          AND "createdAt" >= ${startDate}
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY hour
      `,
    ]);

    // Calculate growth rate (compared to previous period)
    const previousStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const previousPagesCount = await prisma.page.count({
      where: {
        workspaceId: params.workspaceId,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const currentPagesCount = await prisma.page.count({
      where: {
        workspaceId: params.workspaceId,
        createdAt: { gte: startDate },
      },
    });

    const growthRate = previousPagesCount > 0
      ? ((currentPagesCount - previousPagesCount) / previousPagesCount) * 100
      : 0;

    // Format page activity data
    const formattedPageActivity = Array.from({ length: daysAgo }, (_, i) => {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivity = pageActivity.filter((activity: any) => {
        const activityDate = new Date(activity.createdAt).toISOString().split('T')[0];
        return activityDate === dateStr;
      });

      return {
        date: dateStr.slice(5), // MM-DD format
        views: dayActivity.length,
        edits: dayActivity.filter((a: any) => a.type === 'page_edited').length,
      };
    });

    // Format activity by hour
    const formattedActivityByHour = Array.from({ length: 24 }, (_, hour) => {
      const hourActivity = (activityByHour as any[]).find((a: any) => Number(a.hour) === hour);
      return {
        hour: `${hour}:00`,
        activity: hourActivity ? Number(hourActivity.activity) : 0,
      };
    });

    // Content distribution
    const contentDistribution = [
      { name: 'Text Pages', value: totalPages },
      { name: 'Comments', value: totalComments },
      { name: 'Files', value: 0 }, // TODO: Add file count
    ];

    const analytics = {
      overview: {
        totalPages,
        totalComments,
        totalMembers,
        activeUsers: activeUsers.length,
        growthRate: Math.round(growthRate),
      },
      pageActivity: formattedPageActivity,
      topPages: topPages.map((page: any) => ({
        id: page.id,
        title: page.title,
        views: page.activity.length,
        edits: page._count.versions,
        comments: page._count.comments,
      })),
      memberActivity: memberActivity.map((member: any) => ({
        userId: member.id,
        userName: member.name || 'Unknown',
        edits: member.activity.length,
        comments: member._count.comments,
        lastActive: member.activity[0]?.createdAt
          ? new Date(member.activity[0].createdAt).toLocaleDateString()
          : 'N/A',
      })),
      activityByHour: formattedActivityByHour,
      contentDistribution,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
