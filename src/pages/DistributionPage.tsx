import { Truck, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  delivered: { label: "Terkirim", icon: CheckCircle, className: "bg-success/10 text-success" },
  in_transit: { label: "Dalam Perjalanan", icon: Truck, className: "bg-info/10 text-info" },
  pending: { label: "Menunggu", icon: Clock, className: "bg-warning/10 text-warning" },
};

export default function DistributionPage() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["distributions", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_records")
        .select("*, schools(name, student_count)")
        .eq("date", today)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const delivered = distributions.filter((d) => d.status === "delivered").length;
  const totalPorsi = distributions.reduce((a, d) => a + d.portion_count, 0);
  const total = distributions.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          [
            { label: "Total Sekolah", value: total, sub: `${delivered} terkirim` },
            { label: "Total Porsi", value: totalPorsi.toLocaleString("id"), sub: "Hari ini" },
            { label: "Progress", value: total > 0 ? `${Math.round((delivered / total) * 100)}%` : "0%", sub: `${delivered}/${total} selesai` },
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
          ))
        )}
      </div>

      {/* Progress bar */}
      {!isLoading && total > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Progress Distribusi</p>
            <p className="text-sm font-bold text-primary">{delivered}/{total}</p>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary">
            <div
              className="h-3 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(delivered / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : distributions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Truck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada data distribusi hari ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {distributions.map((d, i) => {
            const config = statusConfig[d.status] ?? statusConfig.pending;
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
                  <p className="text-sm font-semibold text-foreground">{d.schools?.name ?? "Sekolah"}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.portion_count} porsi {d.delivered_by ? `· ${d.delivered_by}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
                    {config.label}
                  </span>
                  {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
