import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { useOrg } from "@/hooks/useOrg";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school?: Tables<"schools"> | null;
}

export default function SchoolDialog({ open, onOpenChange, school }: Props) {
  const qc = useQueryClient();
  const { currentOrgId } = useOrg();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", student_count: 0, contact_person: "", contact_phone: "",
  });

  useEffect(() => {
    if (school) {
      setForm({
        name: school.name, address: school.address || "",
        student_count: school.student_count, contact_person: school.contact_person || "",
        contact_phone: school.contact_phone || "",
      });
    } else {
      setForm({ name: "", address: "", student_count: 0, contact_person: "", contact_phone: "" });
    }
  }, [school, open]);

  const handleSubmit = async () => {
    if (!form.name) return toast({ title: "Nama sekolah wajib diisi", variant: "destructive" });
    if (!currentOrgId) return toast({ title: "Organisasi belum dipilih", variant: "destructive" });
    setLoading(true);
    try {
      const data = { ...form, student_count: Number(form.student_count) };
      if (school) {
        const { error } = await supabase.from("schools").update(data).eq("id", school.id);
        if (error) throw error;
        toast({ title: "Sekolah berhasil diperbarui" });
      } else {
        const { error } = await supabase.from("schools").insert({ ...data, org_id: currentOrgId });
        if (error) throw error;
        toast({ title: "Sekolah berhasil ditambahkan" });
      }
      qc.invalidateQueries({ queryKey: ["schools"] });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Gagal menyimpan", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{school ? "Edit Sekolah" : "Tambah Sekolah"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Nama Sekolah *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label>Alamat</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div><Label>Jumlah Siswa</Label><Input type="number" value={form.student_count} onChange={e => setForm(f => ({ ...f, student_count: Number(e.target.value) }))} /></div>
          <div><Label>Kontak Person</Label><Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
          <div><Label>No. Telepon</Label><Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
