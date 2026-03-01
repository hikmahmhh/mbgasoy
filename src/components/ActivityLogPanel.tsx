import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Activity } from "lucide-react";

const actionLabels: Record<string, string> = {
  create: "Membuat",
  update: "Mengubah",
  delete: "Menghapus",
  distribute: "Mendistribusi",
  export: "Mengekspor",
  invite: "Mengundang",
};

const entityLabels: Record<string, string> = {
  menu_item: "Menu",
  daily_menu: "Menu Harian",
  inventory_item: "Stok Bahan",
  distribution: "Distribusi",
  school: "Sekolah",
  member: "Anggota",
  report: "Laporan",
};

export default function ActivityLogPanel() {
  const { currentOrgId } = useOrg();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity-logs", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("org_id", currentOrgId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <Activity className="h-4 w-4 text-primary" />
        Aktivitas Terbaru
      </h3>
      {isLoading ? (
        <p className="text-xs text-muted-foreground text-center py-4">Memuat...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Belum ada aktivitas</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-xs">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground">
                  <span className="font-medium">
                    {actionLabels[log.action] || log.action}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {entityLabels[log.entity_type] || log.entity_type}
                  </span>
                  {(log.details as any)?.name && (
                    <span className="font-medium"> "{(log.details as any).name}"</span>
                  )}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
