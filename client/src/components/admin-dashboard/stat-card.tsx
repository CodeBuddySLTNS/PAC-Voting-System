import { Card, CardContent } from "../ui/card";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm shadow-zinc-200/50 dark:shadow-none dark:bg-zinc-900/40 relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors duration-500" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </h3>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        </div>
        <div className="flex flex-col mt-3">
          <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</span>
          
          {(description || trend) && (
            <div className="text-xs mt-2 flex items-center gap-2">
              {trend && (
                <span className={`font-medium py-0.5 px-1.5 rounded-md ${
                  trend.isPositive 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                }`}>
                  {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                </span>
              )}
              <span className="text-zinc-500 dark:text-zinc-400">
                {trend ? trend.label : description}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
