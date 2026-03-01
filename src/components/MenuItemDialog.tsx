import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { useOrg } from "@/hooks/useOrg";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Tables<"menu_items"> | null;
}

const categories = ["main", "side", "snack", "drink", "dessert"];

export default function MenuItemDialog({ open, onOpenChange, item }: Props) {
  const qc = useQueryClient();
  const { currentOrgId } = useOrg();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "main", calories: 0, protein: 0, fat: 0, carbs: 0,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name, description: item.description ?? "", category: item.category,
        calories: item.calories ?? 0, protein: Number(item.protein ?? 0),
        fat: Number(item.fat ?? 0), carbs: Number(item.carbs ?? 0),
      });
    } else {
      setForm({ name: "", description: "", category: "main", calories: 0, protein: 0, fat: 0, carbs: 0 });
    }
  }, [item, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Nama menu harus diisi"); return; }
    if (!currentOrgId) { toast.error("Organisasi belum dipilih"); return; }
    setLoading(true);
    try {
      if (item) {
        const { error } = await supabase.from("menu_items").update(form).eq("id", item.id);
        if (error) throw error;
        toast.success("Menu berhasil diperbarui");
      } else {
        const { error } = await supabase.from("menu_items").insert({ ...form, org_id: currentOrgId });
        if (error) throw error;
        toast.success("Menu berhasil ditambahkan");
      }
      qc.invalidateQueries({ queryKey: ["menu-items"] });
      qc.invalidateQueries({ queryKey: ["daily-menus"] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
          <DialogDescription>{item ? "Ubah detail menu" : "Isi detail menu baru"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Nama Menu *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
          <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} /></div>
          <div>
            <Label>Kategori</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Kalori (kkal)</Label><Input type="number" min={0} value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} /></div>
            <div><Label>Protein (g)</Label><Input type="number" min={0} step={0.1} value={form.protein} onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })} /></div>
            <div><Label>Lemak (g)</Label><Input type="number" min={0} step={0.1} value={form.fat} onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })} /></div>
            <div><Label>Karbohidrat (g)</Label><Input type="number" min={0} step={0.1} value={form.carbs} onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Menyimpan..." : item ? "Simpan" : "Tambah"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
