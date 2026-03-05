import StatCard from "@/components/StatCard";
import ActivityLogPanel from "@/components/ActivityLogPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed, Package, Truck, CheckCircle, AlertTriangle, Clock,
  TrendingUp, Apple, Flame, Beef, Wheat, Droplets,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, differenceInDays } from "date-fns";
import { useOrg } from "@/hooks/useOrg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// SPPG standard nutrition targets per portion (based on Indonesian school nutrition guidelines)
const SPPG_TARGETS = {
  calories: { min: 400, max: 600, label: "Kalori", unit: "kkal" },
  protein: { min: 15, max: 30, label: "Protein", unit: "g" },
  carbs: { min: 50, max: 70, label: "Karbohidrat", unit: "g" },
  fat: { min: 10, max: 25, label: "Lemak", unit: "g" },
};

function calcNutritionScore(menuItems: any[]) {
  if (!menuItems.length) return { score: 0, compliant: 0, total: 0, avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };

  const mains = menuItems.filter((m) => m.category === "main");
  if (!mains.length) return { score: 0, compliant: 0, total: menuItems.length, avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };

  let compliant = 0;
  let totalScore = 0;

  mains.forEach((m) => {
    let itemScore = 0;
    let checks = 0;

    const cal = m.calories ?? 0;
    const pro = m.protein ?? 0;
    const carb = m.carbs ?? 0;
    const fat = m.fat ?? 0;

    if (cal >= SPPG_TARGETS.calories.min && cal <= SPPG_TARGETS.calories.max) { itemScore++; }
    checks++;
    if (pro >= SPPG_TARGETS.protein.min && pro <= SPPG_TARGETS.protein.max) { itemScore++; }
    checks++;
    if (carb >= SPPG_TARGETS.carbs.min && carb <= SPPG_TARGETS.carbs.max) { itemScore++; }
    checks++;
    if (fat >= SPPG_TARGETS.fat.min && fat <= SPPG_TARGETS.fat.max) { itemScore++; }
    checks++;

    const pct = (itemScore / checks) * 100;
    totalScore += pct;
    if (pct >= 75) compliant++;
  });

  const avgCalories = Math.round(mains.reduce((a, m) => a + (m.calories ?? 0), 0) / mains.length);
  const avgProtein = Math.round(mains.reduce((a, m) => a + (m.protein ?? 0), 0) / mains.length * 10) / 10;
  const avgCarbs = Math.round(mains.reduce((a, m) => a + (m.carbs ?? 0), 0) / mains.length * 10) / 10;
  const avgFat = Math.round(mains.reduce((a, m) => a + (m.fat ?? 0), 0) / mains.length * 10) / 10;

  return {
    score: Math.round(totalScore / mains.length),
    compliant,
    total: mains.length,
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFat,
  };
}

function NutritionGauge({ score, delay }: { score: number; delay: number }) {
  const data = [{ value: score, fill: score >= 75 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))" }];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height={160}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={180} endAngle={0} data={data} barSize={12}>
          <RadialBar background dataKey="value" cornerRadius={10} max={100} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center -mt-4">
        <span className="text-3xl font-extrabold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </motion.div>
  );
}

function NutrientBar({ label, value, min, max, unit, icon: Icon, delay }: { label: string; value: number; min: number; max: number; unit: string; icon: any; delay: number }) {
  const inRange = value >= min && value <= max;
  const pct = Math.min(100, (value / max) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
        </span>
        <span className={inRange ? "text-success font-bold" : "text-warning font-bold"}>
          {value} {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-2 rounded-full ${inRange ? "bg-success" : "bg-warning"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: (delay + 100) / 1000 }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">Target: {min}–{max} {unit}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { currentOrgId } = useOrg();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*").eq("org_id", currentOrgId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const trialDaysLeft = subscription?.status === "trial" && subscription?.trial_ends_at
    ? Math.max(0, differenceInDays(new Date(subscription.trial_ends_at), new Date()))
    : null;

  const { data: todayDist = [] } = useQuery({
    queryKey: ["dash-dist-today", today, currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_records")
        .select("portion_count, status, school_id, schools(name)")
        .eq("date", today)
        .eq("org_id", currentOrgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const { data: schools = [] } = useQuery({
    queryKey: ["dash-schools", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id, name, student_count").eq("org_id", currentOrgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["dash-low-stock", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("name, current_stock, min_stock").eq("org_id", currentOrgId!);
      if (error) throw error;
      return (data ?? []).filter((i) => Number(i.current_stock) <= Number(i.min_stock));
    },
    enabled: !!currentOrgId,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["dash-menu-items", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("name, category, calories, protein, carbs, fat").eq("org_id", currentOrgId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!currentOrgId,
  });

  const { data: weeklyData = [], isLoading } = useQuery({
    queryKey: ["dash-weekly", currentOrgId],
    queryFn: async () => {
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        return { date: format(d, "yyyy-MM-dd"), label: dayNames[d.getDay()] };
      });
      const { data, error } = await supabase
        .from("distribution_records")
        .select("date, portion_count")
        .eq("org_id", currentOrgId!)
        .gte("date", days[0].date)
        .lte("date", days[6].date);
      if (error) throw error;
      return days.map((d) => ({
        day: d.label,
        porsi: (data ?? []).filter((r) => r.date === d.date).reduce((a, r) => a + r.portion_count, 0),
      }));
    },
    enabled: !!currentOrgId,
  });

  const totalPorsi = todayDist.reduce((a, d) => a + d.portion_count, 0);
  const delivered = todayDist.filter((d) => d.status === "delivered").length;
  const schoolsServed = new Set(todayDist.map((d) => d.school_id)).size;
  const deliveryRate = todayDist.length > 0 ? Math.round((delivered / todayDist.length) * 100) : 0;

  const nutrition = calcNutritionScore(menuItems);

  const pieColors = [
    "hsl(var(--success))", "hsl(var(--accent))", "hsl(var(--info))",
    "hsl(var(--warning))", "hsl(var(--destructive))",
  ];
  const distributionData = todayDist.length > 0
    ? Object.entries(
        todayDist.reduce<Record<string, number>>((acc, d) => {
          const name = (d.schools as any)?.name ?? "Lainnya";
          acc[name] = (acc[name] ?? 0) + d.portion_count;
          return acc;
        }, {})
      ).map(([name, value], i) => ({ name, value, color: pieColors[i % pieColors.length] }))
    : [];

  return (
    <div className="space-y-6">
      {/* Trial / Expired banners */}
      {trialDaysLeft !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-2xl border p-4 ${
            trialDaysLeft <= 2 ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
          }`}
        >
          <Clock className={`h-5 w-5 ${trialDaysLeft <= 2 ? "text-destructive" : "text-primary"}`} />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              {trialDaysLeft === 0 ? "Trial Anda berakhir hari ini!" : `Masa trial tersisa ${trialDaysLeft} hari`}
            </p>
            <p className="text-xs text-muted-foreground">
              {trialDaysLeft <= 2 ? "Segera upgrade untuk tetap menggunakan layanan." : "Nikmati semua fitur selama masa trial."}
            </p>
          </div>
          <a href="https://wa.me/6288102645497?text=Halo%20Tim%20Pytagotech%2C%20saya%20ingin%20upgrade%20langganan." target="_blank" rel="noopener noreferrer"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
            {trialDaysLeft <= 2 ? "Hubungi WA" : "Lihat Info"}
          </a>
        </motion.div>
      )}

      {subscription?.status === "expired" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Langganan Expired</p>
            <p className="text-xs text-muted-foreground">Akses terbatas. Silakan upgrade untuk melanjutkan.</p>
          </div>
          <Link to="/settings" className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors">
            Upgrade
          </Link>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan operasional dapur hari ini — {format(new Date(), "EEEE, dd MMMM yyyy")}</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UtensilsCrossed} label="Porsi Hari Ini" value={totalPorsi.toLocaleString("id")} subtitle={`${todayDist.length} distribusi`} color="green" delay={0} />
        <StatCard icon={Truck} label="Sekolah Terlayani" value={`${schoolsServed} / ${schools.length}`} subtitle="Cakupan distribusi" color="blue" delay={100} progress={schools.length > 0 ? (schoolsServed / schools.length) * 100 : 0} />
        <StatCard icon={Package} label="Stok Rendah" value={String(lowStockItems.length)} subtitle={lowStockItems.length > 0 ? "Perlu restock segera" : "Semua stok aman"} trend={lowStockItems.length > 0 ? { value: `${lowStockItems.length} item`, positive: false } : undefined} color={lowStockItems.length > 0 ? "red" : "green"} delay={200} />
        <StatCard icon={CheckCircle} label="Terkirim" value={`${delivered}`} subtitle={`${deliveryRate}% delivery rate`} color="green" delay={300} progress={deliveryRate} />
      </div>

      {/* SPPG Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Skor Kualitas Gizi */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Skor Kualitas Gizi
                </CardTitle>
                <Badge variant={nutrition.score >= 75 ? "default" : nutrition.score >= 50 ? "secondary" : "destructive"} className="text-[10px]">
                  {nutrition.score >= 75 ? "Baik" : nutrition.score >= 50 ? "Cukup" : "Kurang"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Berdasarkan standar SPPG</p>
            </CardHeader>
            <CardContent>
              <NutritionGauge score={nutrition.score} delay={500} />
              <div className="text-center -mt-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{nutrition.compliant}</span> dari <span className="font-bold text-foreground">{nutrition.total}</span> menu memenuhi standar
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Kecukupan Gizi Rata-rata */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Apple className="h-4 w-4 text-success" />
                Kecukupan Gizi Rata-rata
              </CardTitle>
              <p className="text-xs text-muted-foreground">Per porsi menu utama</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <NutrientBar label="Kalori" value={nutrition.avgCalories} min={SPPG_TARGETS.calories.min} max={SPPG_TARGETS.calories.max} unit="kkal" icon={Flame} delay={600} />
              <NutrientBar label="Protein" value={nutrition.avgProtein} min={SPPG_TARGETS.protein.min} max={SPPG_TARGETS.protein.max} unit="g" icon={Beef} delay={700} />
              <NutrientBar label="Karbohidrat" value={nutrition.avgCarbs} min={SPPG_TARGETS.carbs.min} max={SPPG_TARGETS.carbs.max} unit="g" icon={Wheat} delay={800} />
              <NutrientBar label="Lemak" value={nutrition.avgFat} min={SPPG_TARGETS.fat.min} max={SPPG_TARGETS.fat.max} unit="g" icon={Droplets} delay={900} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Kepatuhan Menu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="h-full border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-info" />
                Kepatuhan Menu SPPG
              </CardTitle>
              <p className="text-xs text-muted-foreground">Status nutrisi per menu utama</p>
            </CardHeader>
            <CardContent>
              {menuItems.filter(m => m.category === "main").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada menu utama</p>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {menuItems.filter(m => m.category === "main").map((m, i) => {
                    const cal = m.calories ?? 0;
                    const pro = m.protein ?? 0;
                    const carb = m.carbs ?? 0;
                    const fat = m.fat ?? 0;
                    let checks = 0;
                    if (cal >= SPPG_TARGETS.calories.min && cal <= SPPG_TARGETS.calories.max) checks++;
                    if (pro >= SPPG_TARGETS.protein.min && pro <= SPPG_TARGETS.protein.max) checks++;
                    if (carb >= SPPG_TARGETS.carbs.min && carb <= SPPG_TARGETS.carbs.max) checks++;
                    if (fat >= SPPG_TARGETS.fat.min && fat <= SPPG_TARGETS.fat.max) checks++;
                    const pct = (checks / 4) * 100;

                    return (
                      <motion.div
                        key={m.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (700 + i * 80) / 1000 }}
                        className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{cal} kkal · {pro}g P · {carb}g K · {fat}g L</p>
                        </div>
                        <Badge
                          variant={pct >= 75 ? "default" : pct >= 50 ? "secondary" : "destructive"}
                          className="ml-2 text-[10px] flex-shrink-0"
                        >
                          {checks}/4
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Distribusi Porsi 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-60 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="porsiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area type="monotone" dataKey="porsi" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#porsiGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="h-full border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Distribusi per Sekolah</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="mt-2 grid grid-cols-1 gap-1.5">
                    {distributionData.slice(0, 6).map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="truncate">{d.name}</span>
                        <span className="ml-auto font-bold text-foreground">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">Peringatan Stok Rendah</p>
              <p className="text-xs text-muted-foreground">
                {lowStockItems.map((i) => i.name).join(", ")} — perlu restock segera
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Activity log */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
        <ActivityLogPanel />
      </motion.div>
    </div>
  );
}
