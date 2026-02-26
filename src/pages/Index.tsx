import StatCard from "@/components/StatCard";
import { UtensilsCrossed, Package, Truck, Wallet, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const weeklyData = [
  { day: "Sen", porsi: 1200 },
  { day: "Sel", porsi: 1350 },
  { day: "Rab", porsi: 1180 },
  { day: "Kam", porsi: 1400 },
  { day: "Jum", porsi: 1290 },
  { day: "Sab", porsi: 0 },
  { day: "Min", porsi: 0 },
];

const distributionData = [
  { name: "PAUD", value: 320, color: "hsl(152, 55%, 38%)" },
  { name: "SD", value: 580, color: "hsl(28, 90%, 55%)" },
  { name: "SMP", value: 300, color: "hsl(210, 70%, 50%)" },
  { name: "Ibu Hamil", value: 150, color: "hsl(45, 90%, 55%)" },
];

const recentActivities = [
  { icon: CheckCircle, text: "Distribusi ke SDN 1 Cimahi selesai", time: "10 menit lalu", color: "text-success" },
  { icon: Package, text: "Stok beras diterima: 200 kg", time: "1 jam lalu", color: "text-info" },
  { icon: AlertTriangle, text: "Stok telur menipis (< 50 butir)", time: "2 jam lalu", color: "text-warning" },
  { icon: Truck, text: "Pengiriman ke SMPN 2 dalam perjalanan", time: "3 jam lalu", color: "text-accent" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UtensilsCrossed}
          label="Porsi Hari Ini"
          value="1.350"
          subtitle="Target: 1.500 porsi"
          trend={{ value: "5%", positive: true }}
          color="green"
          delay={0}
        />
        <StatCard
          icon={Wallet}
          label="Anggaran Terpakai"
          value="Rp 12,1 Jt"
          subtitle="Dari Rp 13,5 Jt"
          trend={{ value: "Rp 8.963/porsi", positive: true }}
          color="orange"
          delay={100}
        />
        <StatCard
          icon={Truck}
          label="Distribusi"
          value="12 / 15"
          subtitle="Sekolah terlayani"
          color="blue"
          delay={200}
        />
        <StatCard
          icon={Package}
          label="Item Stok Rendah"
          value="3"
          subtitle="Perlu restock segera"
          trend={{ value: "2 baru", positive: false }}
          color="yellow"
          delay={300}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Produksi Porsi Minggu Ini</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
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
        </div>

        {/* Pie chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Distribusi per Kategori</h3>
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
            {distributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Aktivitas Terbaru</h3>
        <div className="space-y-3">
          {recentActivities.map((act, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg p-2 hover:bg-secondary/50 transition-colors">
              <act.icon className={`h-4.5 w-4.5 mt-0.5 ${act.color}`} />
              <div className="flex-1">
                <p className="text-sm text-foreground">{act.text}</p>
                <p className="text-xs text-muted-foreground">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
