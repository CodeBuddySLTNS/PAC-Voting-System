import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import StatCard from "./stat-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AdminDashboard() {
  // Mock data for the UI
  const recentActivities = [
    {
      id: 1,
      action: "Student registered",
      user: "John Doe",
      time: "2 hours ago",
      avatar: "J",
    },
    {
      id: 2,
      action: "Election created",
      user: "Admin",
      time: "5 hours ago",
      avatar: "A",
    },
    {
      id: 3,
      action: "Vote casted",
      user: "Anonymous",
      time: "1 day ago",
      avatar: "?",
    },
    {
      id: 4,
      action: "Candidate updated",
      user: "Admin",
      time: "2 days ago",
      avatar: "A",
    },
  ];

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
          value="2,450"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, label: "from last month", isPositive: true }}
        />
        <StatCard
          title="Active Elections"
          value="3"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 1, label: "new this week", isPositive: true }}
        />
        <StatCard
          title="Total Votes"
          value="12,389"
          icon={<CheckCircle className="h-5 w-5" />}
          trend={{ value: 8, label: "increase", isPositive: true }}
        />
        <StatCard
          title="Pending Approvals"
          value="14"
          icon={
            <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          }
          description="Requires attention"
        />
      </div>

      {/* Content Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none bg-white shadow-sm dark:bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Election Engagement</CardTitle>
            <CardDescription>
              Voting turnout for the current academic year.
            </CardDescription>
          </CardHeader>
          <CardContent className="m-6 mt-0 flex h-[300px] items-center justify-center rounded-xl border border-dashed border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/20">
            <p className="text-sm font-medium text-zinc-500">
              Chart visualization will appear here.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none bg-white shadow-sm dark:bg-zinc-900/40">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions taken within the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activity.user}`}
                    />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {activity.avatar}
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
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
