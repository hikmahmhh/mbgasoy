import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { useOrg } from "@/hooks/useOrg";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Tables<"inventory_items"> | null;
}

const categories = ["Pokok", "Protein", "Sayur", "Buah", "Minuman", "Bumbu", "other"];
const units = ["kg", "gram", "liter", "ml", "butir", "ikat", "sisir", "kotak", "bungkus", "buah"];

export default function InventoryItemDialog({ open, onOpenChange, item }: Props) {
  const qc = useQueryClient();
  const { currentOrgId } = useOrg();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "other", unit: "kg", current_stock: 0, min_stock: 0, price_per_unit: 0, supplier: "",
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name, category: item.category, unit: item.unit,
        current_stock: Number(item.current_stock), min_stock: Number(item.min_stock),
        price_per_unit: Number(item.price_per_unit ?? 0), supplier: item.supplier ?? "",
      });
    } else {
      setForm({ name: "", category: "other", unit: "kg", current_stock: 0, min_stock: 0, price_per_unit: 0, supplier: "" });
    }
  }, [item, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Nama bahan harus diisi"); return; }
    if (!currentOrgId) { toast.error("Organisasi belum dipilih"); return; }
    setLoading(true);
    try {
      if (item) {
        const { error } = await supabase.from("inventory_items").update(form).eq("id", item.id);
        if (error) throw error;
        toast.success("Bahan berhasil diperbarui");
      } else {
        const { error } = await supabase.from("inventory_items").insert({ ...form, org_id: currentOrgId });
        if (error) throw error;
        toast.success("Bahan berhasil ditambahkan");
      }
      qc.invalidateQueries({ queryKey: ["inventory-items"] });
      qc.invalidateQueries({ queryKey: ["dash-low-stock"] });
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
          <DialogTitle>{item ? "Edit Bahan" : "Tambah Bahan Baru"}</DialogTitle>
          <DialogDescription>{item ? "Ubah detail bahan inventaris" : "Isi detail bahan baru"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Nama Bahan *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Satuan</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Stok Saat Ini</Label><Input type="number" min={0} step={0.1} value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: Number(e.target.value) })} /></div>
            <div><Label>Stok Minimum</Label><Input type="number" min={0} step={0.1} value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Harga per Satuan (Rp)</Label><Input type="number" min={0} value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: Number(e.target.value) })} /></div>
            <div><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} maxLength={100} /></div>
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
