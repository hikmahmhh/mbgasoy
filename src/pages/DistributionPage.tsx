import { Truck, CheckCircle, Clock, MapPin } from "lucide-react";

const distributions = [
  { id: 1, sekolah: "SDN 1 Cimahi", jenis: "SD", porsi: 180, waktu: "07:30", status: "delivered", driver: "Pak Anto" },
  { id: 2, sekolah: "SDN 2 Padalarang", jenis: "SD", porsi: 200, waktu: "08:00", status: "delivered", driver: "Pak Budi" },
  { id: 3, sekolah: "SMPN 2 Ngamprah", jenis: "SMP", porsi: 150, waktu: "08:30", status: "in_transit", driver: "Pak Candra" },
  { id: 4, sekolah: "PAUD Melati", jenis: "PAUD", porsi: 60, waktu: "09:00", status: "in_transit", driver: "Pak Dedi" },
  { id: 5, sekolah: "SDN 3 Cisarua", jenis: "SD", porsi: 200, waktu: "09:30", status: "pending", driver: "Pak Eko" },
  { id: 6, sekolah: "SMPN 1 Lembang", jenis: "SMP", porsi: 150, waktu: "10:00", status: "pending", driver: "Pak Fajar" },
  { id: 7, sekolah: "PAUD Dahlia", jenis: "PAUD", porsi: 45, waktu: "10:30", status: "pending", driver: "Pak Anto" },
  { id: 8, sekolah: "SDN 5 Batujajar", jenis: "SD", porsi: 165, waktu: "11:00", status: "pending", driver: "Pak Budi" },
];

const statusConfig = {
  delivered: { label: "Terkirim", icon: CheckCircle, className: "bg-success/10 text-success" },
  in_transit: { label: "Dalam Perjalanan", icon: Truck, className: "bg-info/10 text-info" },
  pending: { label: "Menunggu", icon: Clock, className: "bg-warning/10 text-warning" },
};

export default function DistributionPage() {
  const delivered = distributions.filter((d) => d.status === "delivered").length;
  const totalPorsi = distributions.reduce((a, d) => a + d.porsi, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Sekolah", value: distributions.length, sub: `${delivered} terkirim` },
          { label: "Total Porsi", value: totalPorsi.toLocaleString("id"), sub: "Hari ini" },
          { label: "Progress", value: `${Math.round((delivered / distributions.length) * 100)}%`, sub: `${delivered}/${distributions.length} selesai` },
        ].map((s, i) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm opacity-0 animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground/70">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Progress Distribusi</p>
          <p className="text-sm font-bold text-primary">{delivered}/{distributions.length}</p>
        </div>
        <div className="h-3 w-full rounded-full bg-secondary">
          <div
            className="h-3 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(delivered / distributions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {distributions.map((d, i) => {
          const config = statusConfig[d.status as keyof typeof statusConfig];
          const StatusIcon = config.icon;
          return (
            <div
              key={d.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-in"
              style={{ animationDelay: `${400 + i * 50}ms` }}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.className}`}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{d.sekolah}</p>
                <p className="text-xs text-muted-foreground">{d.jenis} · {d.porsi} porsi · {d.driver}</p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
                  {config.label}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{d.waktu}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
