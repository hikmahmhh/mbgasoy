import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  color: "green" | "orange" | "blue" | "yellow" | "red";
  delay?: number;
  progress?: number; // 0-100
}

const colorMap = {
  green: {
    icon: "bg-success/10 text-success",
    glow: "shadow-success/10",
    bar: "bg-success",
  },
  orange: {
    icon: "bg-accent/10 text-accent",
    glow: "shadow-accent/10",
    bar: "bg-accent",
  },
  blue: {
    icon: "bg-info/10 text-info",
    glow: "shadow-info/10",
    bar: "bg-info",
  },
  yellow: {
    icon: "bg-warning/10 text-warning",
    glow: "shadow-warning/10",
    bar: "bg-warning",
  },
  red: {
    icon: "bg-destructive/10 text-destructive",
    glow: "shadow-destructive/10",
    bar: "bg-destructive",
  },
};

export default function StatCard({ icon: Icon, label, value, subtitle, trend, color, delay = 0, progress }: StatCardProps) {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-300",
        c.glow
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.03] pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", c.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
              trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
        <p className="text-sm font-semibold text-muted-foreground mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
      </div>

      {progress !== undefined && (
        <div className="relative mt-3">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <motion.div
              className={cn("h-1.5 rounded-full", c.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.8, delay: (delay + 200) / 1000, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
