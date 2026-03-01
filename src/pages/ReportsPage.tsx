import { Download, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function ReportsPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [exporting, setExporting] = useState(false);

  // Today's distribution with school names
  const { data: todayDist = [] } = useQuery({
    queryKey: ["report-dist-today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_records")
        .select("portion_count, status, school_id, delivered_by, notes, schools(name)")
        .eq("date", today);
      if (error) throw error;
      return data;
    },
  });

  // Today's daily menus with menu item names
  const { data: todayMenus = [] } = useQuery({
    queryKey: ["report-menus-today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("portion_count, menu_items(name, category)")
        .eq("date", today);
      if (error) throw error;
      return data;
    },
  });

  const { data: schools = [] } = useQuery({
    queryKey: ["report-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id, name, student_count");
      if (error) throw error;
      return data;
    },
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["report-inventory-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("name, current_stock, unit, min_stock, category");
      if (error) throw error;
      return data;
    },
  });

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

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const dateStr = format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId });

      // Header
      doc.setFontSize(18);
      doc.text("Laporan Harian MBG / SPPG", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Tanggal: ${dateStr}`, 14, 28);
      doc.setTextColor(0);

      // Summary
      doc.setFontSize(13);
      doc.text("Ringkasan", 14, 40);
      autoTable(doc, {
        startY: 44,
        head: [["Metrik", "Nilai"]],
        body: [
          ["Porsi Terdistribusi", totalPorsi.toLocaleString("id-ID")],
          ["Target Porsi Menu", menuPortions.toLocaleString("id-ID")],
          ["Sekolah Terlayani", `${schoolsServed} / ${schools.length}`],
          ["Total Bahan Inventaris", `${inventoryItems.length} item`],
          ["Jumlah Record Distribusi", `${todayDist.length}`],
        ],
        theme: "grid",
        headStyles: { fillColor: [34, 120, 74] },
        styles: { fontSize: 9 },
      });

      let nextY = (doc as any).lastAutoTable.finalY + 10;

      // Menu hari ini
      if (todayMenus.length > 0) {
        doc.setFontSize(13);
        doc.text("Menu Hari Ini", 14, nextY);
        autoTable(doc, {
          startY: nextY + 4,
          head: [["Menu", "Kategori", "Jumlah Porsi"]],
          body: todayMenus.map((m: any) => [
            m.menu_items?.name || "-",
            m.menu_items?.category || "-",
            m.portion_count.toLocaleString("id-ID"),
          ]),
          theme: "grid",
          headStyles: { fillColor: [34, 120, 74] },
          styles: { fontSize: 9 },
        });
        nextY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Distribusi hari ini
      if (todayDist.length > 0) {
        if (nextY > 240) { doc.addPage(); nextY = 20; }
        doc.setFontSize(13);
        doc.text("Distribusi Hari Ini", 14, nextY);
        autoTable(doc, {
          startY: nextY + 4,
          head: [["Sekolah", "Porsi", "Status", "Pengantar", "Catatan"]],
          body: todayDist.map((d: any) => [
            d.schools?.name || "-",
            d.portion_count.toLocaleString("id-ID"),
            d.status,
            d.delivered_by || "-",
            d.notes || "-",
          ]),
          theme: "grid",
          headStyles: { fillColor: [34, 120, 74] },
          styles: { fontSize: 9 },
        });
        nextY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Stok bahan (low stock highlight)
      if (inventoryItems.length > 0) {
        if (nextY > 220) { doc.addPage(); nextY = 20; }
        doc.setFontSize(13);
        doc.text("Status Inventaris", 14, nextY);
        autoTable(doc, {
          startY: nextY + 4,
          head: [["Bahan", "Kategori", "Stok", "Min. Stok", "Status"]],
          body: inventoryItems.map((item: any) => [
            item.name,
            item.category,
            `${Number(item.current_stock).toLocaleString("id-ID")} ${item.unit}`,
            `${Number(item.min_stock).toLocaleString("id-ID")} ${item.unit}`,
            Number(item.current_stock) <= Number(item.min_stock) ? "⚠ Rendah" : "✓ Aman",
          ]),
          theme: "grid",
          headStyles: { fillColor: [34, 120, 74] },
          styles: { fontSize: 9 },
          didParseCell: (data: any) => {
            if (data.section === "body" && data.column.index === 4 && data.cell.raw === "⚠ Rendah") {
              data.cell.styles.textColor = [200, 50, 50];
              data.cell.styles.fontStyle = "bold";
            }
          },
        });
        nextY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Tren 7 hari
      if (weeklyData.length > 0) {
        if (nextY > 230) { doc.addPage(); nextY = 20; }
        doc.setFontSize(13);
        doc.text("Tren Distribusi 7 Hari Terakhir", 14, nextY);
        autoTable(doc, {
          startY: nextY + 4,
          head: [["Tanggal", "Total Porsi"]],
          body: weeklyData.map((w) => [w.date, w.porsi.toLocaleString("id-ID")]),
          theme: "grid",
          headStyles: { fillColor: [34, 120, 74] },
          styles: { fontSize: 9 },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i}/${pageCount} — Dicetak ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 290);
      }

      doc.save(`Laporan-MBG-${today}.pdf`);
      toast({ title: "PDF berhasil diunduh" });
    } catch (e: any) {
      toast({ title: "Gagal export PDF", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Ringkasan Hari Ini</h3>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "Mengunduh..." : "Export PDF"}
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
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
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
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="porsi" stroke="hsl(28, 90%, 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(28, 90%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}