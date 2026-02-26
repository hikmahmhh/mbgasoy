import { FileBarChart, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthlyData = [
  { bulan: "Jan", porsi: 28500, anggaran: 256 },
  { bulan: "Feb", porsi: 31200, anggaran: 280 },
  { bulan: "Mar", porsi: 29800, anggaran: 268 },
  { bulan: "Apr", porsi: 33100, anggaran: 297 },
  { bulan: "Mei", porsi: 30500, anggaran: 274 },
  { bulan: "Jun", porsi: 32000, anggaran: 288 },
];

const dailySummary = {
  totalPorsi: 1350,
  totalAnggaran: 12150000,
  rataPerPorsi: 9000,
  sekolahDilayani: 12,
  totalSekolah: 15,
  bahanTerpakai: 28,
};

export default function ReportsPage() {
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Porsi", value: dailySummary.totalPorsi.toLocaleString("id") },
            { label: "Total Anggaran", value: `Rp ${(dailySummary.totalAnggaran / 1e6).toFixed(1)} Jt` },
            { label: "Rata-rata/Porsi", value: `Rp ${dailySummary.rataPerPorsi.toLocaleString("id")}` },
            { label: "Sekolah", value: `${dailySummary.sekolahDilayani}/${dailySummary.totalSekolah}` },
            { label: "Bahan Terpakai", value: `${dailySummary.bahanTerpakai} item` },
            { label: "Efisiensi", value: "94%" },
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
          <h3 className="mb-4 text-sm font-semibold text-foreground">Tren Porsi Bulanan</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="bulan" axisLine={false} tickLine={false} className="text-xs" />
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

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Tren Anggaran (Juta Rp)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="bulan" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="anggaran" stroke="hsl(28, 90%, 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(28, 90%, 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
