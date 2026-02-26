import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  color: "green" | "orange" | "blue" | "yellow";
  delay?: number;
}

const colorMap = {
  green: "bg-success/10 text-success",
  orange: "bg-accent/10 text-accent",
  blue: "bg-info/10 text-info",
  yellow: "bg-warning/10 text-warning",
};

export default function StatCard({ icon: Icon, label, value, subtitle, trend, color, delay = 0 }: StatCardProps) {
  return (
    <div
      className="stat-card-gradient rounded-xl border border-border p-5 shadow-sm opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
