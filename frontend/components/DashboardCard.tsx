import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export function DashboardCard({ title, value, subtitle, icon: Icon, iconColor = "text-indigo-600", bgColor = "bg-indigo-100 dark:bg-indigo-950/40" }: DashboardCardProps) {
  return (
    <div
      className="p-5 rounded-xl border transition-colors hover:bg-muted/50"
      style={{
        backgroundColor: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--muted-foreground))" }}>{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "rgb(var(--foreground))" }}>{value}</p>
          <p className="text-xs mt-1" style={{ color: "rgb(var(--muted-foreground))" }}>{subtitle}</p>
        </div>
        <div className={`p-2 rounded-md bg-indigo-50 dark:bg-indigo-900/20`}>
          <Icon className={`w-5 h-5 text-indigo-600 dark:text-indigo-400`} />
        </div>
      </div>
    </div>
  );
}
