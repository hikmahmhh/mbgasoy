import { UtensilsCrossed, Plus, Eye } from "lucide-react";
import { useState } from "react";

const menuData = [
  {
    id: 1,
    waktu: "Makan Siang",
    menu: "Nasi, Ayam Goreng, Sayur Bayam, Buah Pisang",
    kalori: 520,
    protein: 28,
    lemak: 18,
    karbo: 62,
    status: "approved",
    porsi: 1350,
  },
  {
    id: 2,
    waktu: "Snack Pagi",
    menu: "Roti Gandum, Susu UHT",
    kalori: 280,
    protein: 12,
    lemak: 8,
    karbo: 35,
    status: "approved",
    porsi: 800,
  },
  {
    id: 3,
    waktu: "Makan Siang (Besok)",
    menu: "Nasi, Ikan Panggang, Capcay, Buah Jeruk",
    kalori: 490,
    protein: 32,
    lemak: 14,
    karbo: 58,
    status: "draft",
    porsi: 1500,
  },
];

const weeklyPlan = [
  { hari: "Senin", menu: "Nasi + Ayam Goreng + Bayam + Pisang", kalori: 520 },
  { hari: "Selasa", menu: "Nasi + Ikan Panggang + Capcay + Jeruk", kalori: 490 },
  { hari: "Rabu", menu: "Nasi + Rendang + Sayur Asem + Semangka", kalori: 550 },
  { hari: "Kamis", menu: "Nasi + Telur Balado + Tumis Kangkung + Pepaya", kalori: 460 },
  { hari: "Jumat", menu: "Nasi + Ayam Suwir + Sup Sayur + Melon", kalori: 500 },
];

export default function MenuPage() {
  return (
    <div className="space-y-6">
      {/* Today menu cards */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Menu Hari Ini & Besok</h3>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Tambah Menu
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuData.map((item, i) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.waktu}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.status === "approved"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {item.status === "approved" ? "Disetujui" : "Draft"}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mb-3">{item.menu}</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Kalori", val: item.kalori },
                  { label: "Protein", val: `${item.protein}g` },
                  { label: "Lemak", val: `${item.lemak}g` },
                  { label: "Karbo", val: `${item.karbo}g` },
                ].map((n) => (
                  <div key={n.label} className="rounded-md bg-secondary p-1.5">
                    <p className="text-xs font-bold text-foreground">{n.val}</p>
                    <p className="text-[10px] text-muted-foreground">{n.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Target: {item.porsi.toLocaleString("id")} porsi</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly plan */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Rencana Menu Mingguan</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-semibold text-muted-foreground">Hari</th>
                <th className="pb-3 text-left text-xs font-semibold text-muted-foreground">Menu</th>
                <th className="pb-3 text-right text-xs font-semibold text-muted-foreground">Kalori</th>
              </tr>
            </thead>
            <tbody>
              {weeklyPlan.map((d) => (
                <tr key={d.hari} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium text-foreground">{d.hari}</td>
                  <td className="py-3 text-muted-foreground">{d.menu}</td>
                  <td className="py-3 text-right font-semibold text-foreground">{d.kalori} kkal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
