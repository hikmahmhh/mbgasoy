import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { useOrg } from "@/hooks/useOrg";

type DistRecord = Tables<"distribution_records"> & { schools?: { name: string; student_count: number } | null };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: DistRecord | null;
}

const statuses = [
  { value: "pending", label: "Menunggu" },
  { value: "in_transit", label: "Dalam Perjalanan" },
  { value: "delivered", label: "Terkirim" },
];

export default function DistributionDialog({ open, onOpenChange, item }: Props) {
  const qc = useQueryClient();
  const { currentOrgId } = useOrg();
  const [loading, setLoading] = useState(false);

  const { data: schools = [] } = useQuery({
    queryKey: ["schools-list", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const [form, setForm] = useState({
    school_id: "",
    portion_count: 0,
    status: "pending",
    delivered_by: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    if (item) {
      setForm({
        school_id: item.school_id,
        portion_count: item.portion_count,
        status: item.status,
        delivered_by: item.delivered_by ?? "",
        notes: item.notes ?? "",
        date: item.date,
      });
    } else {
      setForm({ school_id: "", portion_count: 0, status: "pending", delivered_by: "", notes: "", date: format(new Date(), "yyyy-MM-dd") });
    }
  }, [item, open]);

  const handleSubmit = async () => {
    if (!form.school_id) { toast.error("Pilih sekolah terlebih dahulu"); return; }
    if (form.portion_count <= 0) { toast.error("Jumlah porsi harus lebih dari 0"); return; }
    if (!currentOrgId) { toast.error("Organisasi belum dipilih"); return; }
    setLoading(true);
    try {
      if (item) {
        const { error } = await supabase.from("distribution_records").update(form).eq("id", item.id);
        if (error) throw error;
        toast.success("Distribusi berhasil diperbarui");
      } else {
        const { error } = await supabase.from("distribution_records").insert({ ...form, org_id: currentOrgId });
        if (error) throw error;
        toast.success("Distribusi berhasil ditambahkan");
      }
      qc.invalidateQueries({ queryKey: ["distributions"] });
      qc.invalidateQueries({ queryKey: ["dash-dist-today"] });
      qc.invalidateQueries({ queryKey: ["report-dist-today"] });
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
          <DialogTitle>{item ? "Edit Distribusi" : "Tambah Distribusi"}</DialogTitle>
          <DialogDescription>{item ? "Ubah detail distribusi" : "Catat distribusi baru"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Sekolah *</Label>
            <Select value={form.school_id} onValueChange={(v) => setForm({ ...form, school_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih sekolah..." /></SelectTrigger>
              <SelectContent>
                {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {schools.length === 0 && <p className="text-xs text-muted-foreground mt-1">Belum ada data sekolah</p>}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pengantar</Label>
              <Input value={form.delivered_by} onChange={(e) => setForm({ ...form, delivered_by: e.target.value })} maxLength={100} placeholder="Nama pengantar" />
            </div>
          </div>
          <div>
            <Label>Catatan</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : item ? "Simpan" : "Tambah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
