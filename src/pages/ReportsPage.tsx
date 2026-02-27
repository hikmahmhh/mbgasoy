import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";

export default function ReportsPage() {
  const today = format(new Date(), "yyyy-MM-dd");

  // Today's distribution summary
  const { data: todayDist = [] } = useQuery({
    queryKey: ["report-dist-today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_records")
        .select("portion_count, status, school_id")
        .eq("date", today);
      if (error) throw error;
      return data;
    },
  });

  // Today's daily menus
  const { data: todayMenus = [] } = useQuery({
    queryKey: ["report-menus-today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("portion_count")
        .eq("date", today);
      if (error) throw error;
      return data;
    },
  });

  // Schools count
  const { data: schools = [] } = useQuery({
    queryKey: ["report-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id");
      if (error) throw error;
      return data;
    },
  });

  // Inventory count
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["report-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("id");
      if (error) throw error;
      return data;
    },
  });

  // Last 7 days distribution for chart
  const { data: weeklyData = [], isLoading } = useQuery({
    queryKey: ["report-weekly"],
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));
      const { data, error } = await supabase
        .from("distribution_records")
        .select("date, portion_count")
        .gte("date", days[0])
        .lte("date", days[6]);
      if (error) throw error;

      return days.map((d) => {
        const dayRecords = (data ?? []).filter((r) => r.date === d);
        const total = dayRecords.reduce((a, r) => a + r.portion_count, 0);
        return { date: format(new Date(d), "dd/MM"), porsi: total };
      });
    },
  });

  const totalPorsi = todayDist.reduce((a, d) => a + d.portion_count, 0);
  const schoolsServed = new Set(todayDist.map((d) => d.school_id)).size;
  const menuPortions = todayMenus.reduce((a, m) => a + m.portion_count, 0);

  return (
    <div className="space-y-6">
      {/* Daily summary */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Ringkasan Hari Ini</h3>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Porsi Terdistribusi", value: totalPorsi.toLocaleString("id") },
            { label: "Target Porsi Menu", value: menuPortions.toLocaleString("id") },
            { label: "Sekolah Terlayani", value: `${schoolsServed}/${schools.length}` },
            { label: "Total Bahan", value: `${inventoryItems.length} item` },
            { label: "Distribusi Hari Ini", value: `${todayDist.length} record` },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi Porsi 7 Hari Terakhir</h3>
          {isLoading ? (
            <Skeleton className="h-60 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="porsi" fill="hsl(152, 55%, 38%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Tren Porsi Harian</h3>
          {isLoading ? (
            <Skeleton className="h-60 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="porsi" stroke="hsl(28, 90%, 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(28, 90%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
