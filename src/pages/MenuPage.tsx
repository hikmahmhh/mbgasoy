import { UtensilsCrossed, Plus, Pencil, Trash2, CalendarPlus } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import MenuItemDialog from "@/components/MenuItemDialog";
import DailyMenuDialog from "@/components/DailyMenuDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function MenuPage() {
  const qc = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dailyDialogOpen, setDailyDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Tables<"menu_items"> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Tables<"menu_items"> | null>(null);
  const [deleteDailyMenu, setDeleteDailyMenu] = useState<string | null>(null);
  const { canAdd, limits } = usePlanLimits();

  const { data: dailyMenus, isLoading: loadingDaily } = useQuery({
    queryKey: ["daily-menus", today, tomorrow],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*, menu_items(*)")
        .in("date", [today, tomorrow])
        .order("date");
      if (error) throw error;
      return data;
    },
  });

  const { data: allMenuItems, isLoading: loadingItems } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("category").order("name");
      if (error) throw error;
      return data;
    },
  });

  const todayMenus = dailyMenus?.filter((m) => m.date === today) ?? [];
  const tomorrowMenus = dailyMenus?.filter((m) => m.date === tomorrow) ?? [];
  const menuCards = [
    ...todayMenus.map((m) => ({ ...m, label: "Hari Ini" })),
    ...tomorrowMenus.map((m) => ({ ...m, label: "Besok" })),
  ];

  const handleDelete = async () => {
    if (!deleteItem) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", deleteItem.id);
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Menu berhasil dihapus");
    qc.invalidateQueries({ queryKey: ["menu-items"] });
    qc.invalidateQueries({ queryKey: ["daily-menus"] });
  };

  const handleDeleteDailyMenu = async () => {
    if (!deleteDailyMenu) return;
    const { error } = await supabase.from("daily_menus").delete().eq("id", deleteDailyMenu);
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Menu harian berhasil dihapus");
    qc.invalidateQueries({ queryKey: ["daily-menus"] });
    qc.invalidateQueries({ queryKey: ["report-menus-today"] });
  };

  return (
    <div className="space-y-6">
      {/* Today & tomorrow menu cards */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Menu Hari Ini & Besok</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setDailyDialogOpen(true)}>
              <CalendarPlus className="h-3.5 w-3.5 mr-1" /> Jadwalkan Menu
            </Button>
            <Button size="sm" onClick={() => { setEditItem(null); setDialogOpen(true); }} disabled={!canAdd("menuItems")}
              title={!canAdd("menuItems") ? `Batas ${limits.maxMenuItems} menu tercapai` : ""}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Menu
            </Button>
          </div>
        </div>

        {loadingDaily ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : menuCards.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada menu untuk hari ini & besok</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuCards.map((item, i) => {
              const mi = item.menu_items;
              return (
                <div key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <UtensilsCrossed className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{item.label} · {mi?.category}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{mi?.name}</p>
                  {mi?.description && <p className="text-xs text-muted-foreground mb-3">{mi.description}</p>}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Kalori", val: mi?.calories ?? 0 },
                      { label: "Protein", val: `${mi?.protein ?? 0}g` },
                      { label: "Lemak", val: `${mi?.fat ?? 0}g` },
                      { label: "Karbo", val: `${mi?.carbs ?? 0}g` },
                    ].map((n) => (
                      <div key={n.label} className="rounded-md bg-secondary p-1.5">
                        <p className="text-xs font-bold text-foreground">{n.val}</p>
                        <p className="text-[10px] text-muted-foreground">{n.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Target: {item.portion_count.toLocaleString("id")} porsi</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteDailyMenu(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All menu items catalog */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Katalog Menu</h3>
        {loadingItems ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
        ) : !allMenuItems?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada item menu</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-semibold text-muted-foreground">Nama</th>
                  <th className="pb-3 text-left text-xs font-semibold text-muted-foreground">Kategori</th>
                  <th className="pb-3 text-right text-xs font-semibold text-muted-foreground">Kalori</th>
                  <th className="pb-3 text-right text-xs font-semibold text-muted-foreground">Protein</th>
                  <th className="pb-3 text-right text-xs font-semibold text-muted-foreground">Lemak</th>
                  <th className="pb-3 text-right text-xs font-semibold text-muted-foreground">Karbo</th>
                  <th className="pb-3 text-center text-xs font-semibold text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allMenuItems.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 font-medium text-foreground">{item.name}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{item.category}</span>
                    </td>
                    <td className="py-3 text-right text-foreground">{item.calories} kkal</td>
                    <td className="py-3 text-right text-muted-foreground">{item.protein}g</td>
                    <td className="py-3 text-right text-muted-foreground">{item.fat}g</td>
                    <td className="py-3 text-right text-muted-foreground">{item.carbs}g</td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(item); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteItem(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MenuItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editItem} />
      <DailyMenuDialog open={dailyDialogOpen} onOpenChange={setDailyDialogOpen} />
      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(o) => !o && setDeleteItem(null)}
        title="Hapus Menu"
        description={`Apakah Anda yakin ingin menghapus "${deleteItem?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
      <DeleteConfirmDialog
        open={!!deleteDailyMenu}
        onOpenChange={(o) => !o && setDeleteDailyMenu(null)}
        title="Hapus Menu Harian"
        description="Hapus jadwal menu harian ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDeleteDailyMenu}
      />
    </div>
  );
}
