'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, FileText, MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalPages: number;
    totalComments: number;
    totalMembers: number;
    activeUsers: number;
    growthRate: number;
  };
  pageActivity: Array<{
    date: string;
    views: number;
    edits: number;
  }>;
  topPages: Array<{
    id: string;
    title: string;
    views: number;
    edits: number;
    comments: number;
  }>;
  memberActivity: Array<{
    userId: string;
    userName: string;
    edits: number;
    comments: number;
    lastActive: string;
  }>;
  activityByHour: Array<{
    hour: string;
    activity: number;
  }>;
  contentDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export default function AnalyticsDashboard({ workspaceId }: { workspaceId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [workspaceId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/analytics?range=${timeRange}`
      );
      const analytics = await response.json();
      setData(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Insights and statistics for your workspace
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
              <h3 className="text-2xl font-bold mt-2">{data.overview.totalPages}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{data.overview.growthRate}% this period
              </p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Comments</p>
              <h3 className="text-2xl font-bold mt-2">{data.overview.totalComments}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Across all pages
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Members</p>
              <h3 className="text-2xl font-bold mt-2">{data.overview.totalMembers}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {data.overview.activeUsers} active now
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Activity Score</p>
              <h3 className="text-2xl font-bold mt-2">
                {Math.round((data.overview.totalPages + data.overview.totalComments) / data.overview.totalMembers)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Per member average
              </p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Page Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.pageActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#667eea"
                strokeWidth={2}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="edits"
                stroke="#764ba2"
                strokeWidth={2}
                name="Edits"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.activityByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activity" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Content Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.contentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.contentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
          <div className="space-y-4">
            {data.topPages.map((page, index) => (
              <div key={page.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {page.views} views · {page.edits} edits · {page.comments} comments
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Member Activity Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Member Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Member</th>
                <th className="text-right p-2 font-medium">Edits</th>
                <th className="text-right p-2 font-medium">Comments</th>
                <th className="text-right p-2 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {data.memberActivity.map((member) => (
                <tr key={member.userId} className="border-b last:border-0">
                  <td className="p-2">{member.userName}</td>
                  <td className="text-right p-2">{member.edits}</td>
                  <td className="text-right p-2">{member.comments}</td>
                  <td className="text-right p-2 flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {member.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
