import StatCard from "@/components/StatCard";
import ActivityLogPanel from "@/components/ActivityLogPanel";
import { UtensilsCrossed, Package, Truck, Wallet, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, differenceInDays } from "date-fns";
import { useOrg } from "@/hooks/useOrg";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { currentOrgId } = useOrg();

  // Subscription / trial info
  const { data: subscription } = useQuery({
    queryKey: ["subscription", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("org_id", currentOrgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const trialDaysLeft = subscription?.status === "trial" && subscription?.trial_ends_at
    ? Math.max(0, differenceInDays(new Date(subscription.trial_ends_at), new Date()))
    : null;

  // Today's distributions
  const { data: todayDist = [] } = useQuery({
    queryKey: ["dash-dist-today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_records")
        .select("portion_count, status, school_id, schools(name)")
        .eq("date", today);
      if (error) throw error;
      return data;
    },
  });

  // Schools
  const { data: schools = [] } = useQuery({
    queryKey: ["dash-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id, name, student_count");
      if (error) throw error;
      return data;
    },
  });

  // Low stock items
  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["dash-low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("name, current_stock, min_stock");
      if (error) throw error;
      return (data ?? []).filter((i) => Number(i.current_stock) <= Number(i.min_stock));
    },
  });

  // Weekly portions for chart
  const { data: weeklyData = [], isLoading } = useQuery({
    queryKey: ["dash-weekly"],
    queryFn: async () => {
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return { date: format(d, "yyyy-MM-dd"), label: dayNames[d.getDay()] };
      });
      const { data, error } = await supabase
        .from("distribution_records")
        .select("date, portion_count")
        .gte("date", days[0].date)
        .lte("date", days[6].date);
      if (error) throw error;
      return days.map((d) => ({
        day: d.label,
        porsi: (data ?? []).filter((r) => r.date === d.date).reduce((a, r) => a + r.portion_count, 0),
      }));
    },
  });

  const totalPorsi = todayDist.reduce((a, d) => a + d.portion_count, 0);
  const delivered = todayDist.filter((d) => d.status === "delivered").length;
  const schoolsServed = new Set(todayDist.map((d) => d.school_id)).size;

  // Pie data from schools student_count
  const pieColors = ["hsl(152, 55%, 38%)", "hsl(28, 90%, 55%)", "hsl(210, 70%, 50%)", "hsl(45, 90%, 55%)", "hsl(340, 70%, 55%)"];
  const distributionData = todayDist.length > 0
    ? Object.entries(
        todayDist.reduce<Record<string, number>>((acc, d) => {
          const name = d.schools?.name ?? "Lainnya";
          acc[name] = (acc[name] ?? 0) + d.portion_count;
          return acc;
        }, {})
      ).map(([name, value], i) => ({ name, value, color: pieColors[i % pieColors.length] }))
    : [];

  return (
    <div className="space-y-6">
      {/* Trial banner */}
      {trialDaysLeft !== null && (
        <div className={`flex items-center gap-3 rounded-xl border p-4 animate-fade-in ${
          trialDaysLeft <= 2 ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
        }`}>
          <Clock className={`h-5 w-5 ${trialDaysLeft <= 2 ? "text-destructive" : "text-primary"}`} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {trialDaysLeft === 0
                ? "Trial Anda berakhir hari ini!"
                : `Masa trial tersisa ${trialDaysLeft} hari`}
            </p>
            <p className="text-xs text-muted-foreground">
              {trialDaysLeft <= 2
                ? "Segera upgrade untuk tetap menggunakan layanan."
                : "Nikmati semua fitur selama masa trial."}
            </p>
          </div>
          <Link to="/settings" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            {trialDaysLeft <= 2 ? "Upgrade Sekarang" : "Lihat Paket"}
          </Link>
        </div>
      )}

      {subscription?.status === "expired" && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Langganan Expired</p>
            <p className="text-xs text-muted-foreground">Akses terbatas. Silakan upgrade untuk melanjutkan.</p>
          </div>
          <Link to="/settings" className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">
            Upgrade
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UtensilsCrossed}
          label="Porsi Hari Ini"
          value={totalPorsi.toLocaleString("id")}
          subtitle={`${todayDist.length} distribusi`}
          color="green"
          delay={0}
        />
        <StatCard
          icon={Truck}
          label="Distribusi"
          value={`${schoolsServed} / ${schools.length}`}
          subtitle="Sekolah terlayani"
          color="blue"
          delay={100}
        />
        <StatCard
          icon={Package}
          label="Item Stok Rendah"
          value={String(lowStockItems.length)}
          subtitle={lowStockItems.length > 0 ? "Perlu restock segera" : "Semua stok aman"}
          trend={lowStockItems.length > 0 ? { value: `${lowStockItems.length} item`, positive: false } : undefined}
          color="yellow"
          delay={200}
        />
        <StatCard
          icon={CheckCircle}
          label="Terkirim"
          value={`${delivered}`}
          subtitle={`Dari ${todayDist.length} pengiriman`}
          color="green"
          delay={300}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi Porsi 7 Hari Terakhir</h3>
          {isLoading ? (
            <Skeleton className="h-60 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="porsi" fill="hsl(152, 55%, 38%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi per Sekolah</h3>
          {distributionData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada data distribusi hari ini</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                    {distributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {distributionData.slice(0, 6).map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Peringatan Stok Rendah</p>
              <p className="text-xs text-muted-foreground">
                {lowStockItems.map((i) => i.name).join(", ")} — perlu restock segera
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
