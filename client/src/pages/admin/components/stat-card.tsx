import { Card, CardContent } from "../../../components/ui/card";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-none p-0 shadow-sm shadow-zinc-200/50">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl transition-colors duration-500 group-hover:bg-indigo-500/10">
        {icon}
      </div>
      <CardContent className="relative z-10 p-6">
        <div className="flex items-center justify-between space-y-0">
          <h3 className="text-sm font-medium tracking-tight text-zinc-500">
            {title}
          </h3>
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            {icon}
          </div>
        </div>
        <div className="mt-3 flex flex-col">
          <span className="text-3xl font-bold tracking-tight text-zinc-900">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
