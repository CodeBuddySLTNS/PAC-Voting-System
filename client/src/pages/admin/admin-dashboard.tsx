import { Users, FileText, UserX, UserCheck } from "lucide-react";
import StatCard from "./components/stat-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import LoadingAnimation from "../../components/loading-animation/loading";
import { handlePhotoUrl } from "@/lib/utils";
const chartConfig = {
  value: {
    label: "Turnout",
    color: "hsl(var(--primary))",
  },
};

const getRelativeTime = (dateStr: string) => {
  const diffInMs = new Date().getTime() - new Date(dateStr).getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  if (diffInMins < 60)
    return `${Math.max(1, diffInMins)} min${diffInMins !== 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const isTruncated = payload.value.length > 15;
  const displayText = isTruncated
    ? payload.value.substring(0, 15) + "..."
    : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        {displayText}
        {isTruncated && <title>{payload.value}</title>}
      </text>
    </g>
  );
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Overview
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Track key metrics and recent system activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Active Elections"
          value={stats.activeElections.toLocaleString()}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Active Voters"
          value={stats.activeStudents.toLocaleString()}
          icon={
            <UserCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
          }
        />
        <StatCard
          title="Inactive Voters"
          value={stats.inactiveStudents.toLocaleString()}
          icon={<UserX className="h-5 w-5 text-red-500 dark:text-red-400" />}
        />
      </div>

      {/* Content Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none bg-white shadow-sm dark:bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Election Engagement</CardTitle>
            <CardDescription>
              Total distinct votes cast per recent election.
            </CardDescription>
          </CardHeader>
          <CardContent className="m-6 mt-0 flex h-[300px] items-center justify-center rounded-xl border border-dashed border-zinc-100 bg-zinc-50 px-4 pt-6 dark:border-zinc-800 dark:bg-zinc-900/20">
            {stats.electionEngagement.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="mx-auto max-h-[250px] w-full"
              >
                <BarChart 
                  data={stats.electionEngagement} 
                  margin={{ left: -20, right: 0, top: 10, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    interval={0}
                    tick={<CustomXAxisTick />}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={35}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm font-medium text-zinc-500">
                No election data available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none bg-white shadow-sm dark:bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest votes casted within the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={handlePhotoUrl(activity?.imageUrl, activity.user)}
                      />
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {activity.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {activity.user}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {activity.action}
                      </p>
                    </div>
                    <div className="text-xs whitespace-nowrap text-zinc-400">
                      {getRelativeTime(activity.time)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-zinc-500">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
