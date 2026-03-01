import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DailyMenuDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    menu_item_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    portion_count: 0,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu-items-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("id, name, category").order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (open) {
      setForm({ menu_item_id: "", date: format(new Date(), "yyyy-MM-dd"), portion_count: 0 });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!form.menu_item_id) {
      toast.error("Pilih menu terlebih dahulu");
      return;
    }
    if (form.portion_count <= 0) {
      toast.error("Jumlah porsi harus lebih dari 0");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("daily_menus").insert({
        menu_item_id: form.menu_item_id,
        date: form.date,
        portion_count: form.portion_count,
      });
      if (error) throw error;
      toast.success("Menu harian berhasil ditambahkan");
      qc.invalidateQueries({ queryKey: ["daily-menus"] });
      qc.invalidateQueries({ queryKey: ["report-menus-today"] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Menu Harian</DialogTitle>
          <DialogDescription>Tambahkan item menu ke jadwal tanggal tertentu</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Menu Item *</Label>
            <Select value={form.menu_item_id} onValueChange={(v) => setForm({ ...form, menu_item_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih menu..." /></SelectTrigger>
              <SelectContent>
                {menuItems.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.category})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {menuItems.length === 0 && <p className="text-xs text-muted-foreground mt-1">Belum ada item menu. Tambah di Katalog Menu dulu.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tanggal</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Jumlah Porsi *</Label>
              <Input type="number" min={1} value={form.portion_count} onChange={(e) => setForm({ ...form, portion_count: Number(e.target.value) })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Tambah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
