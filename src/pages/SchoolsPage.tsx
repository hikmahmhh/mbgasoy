import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, School } from "lucide-react";
import { useState } from "react";
import SchoolDialog from "@/components/SchoolDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function SchoolsPage() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<Tables<"schools"> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tables<"schools"> | null>(null);

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const totalStudents = schools.reduce((s, sc) => s + sc.student_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><School className="h-6 w-6" /> Manajemen Sekolah</h1>
          <p className="text-muted-foreground">{schools.length} sekolah · {totalStudents.toLocaleString("id-ID")} siswa</p>
        </div>
        <Button onClick={() => { setEditSchool(null); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Tambah Sekolah</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Sekolah</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Memuat...</p>
          ) : schools.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada data sekolah</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="text-right">Jumlah Siswa</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.address || "-"}</TableCell>
                    <TableCell className="text-right">{s.student_count.toLocaleString("id-ID")}</TableCell>
                    <TableCell>{s.contact_person || "-"}</TableCell>
                    <TableCell>{s.contact_phone || "-"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditSchool(s); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SchoolDialog open={dialogOpen} onOpenChange={setDialogOpen} school={editSchool} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        title="Hapus Sekolah"
        description={`Yakin ingin menghapus ${deleteTarget?.name}?`}
        onConfirm={async () => {
          const { error } = await supabase.from("schools").delete().eq("id", deleteTarget!.id);
          if (error) toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
          else { toast({ title: "Sekolah dihapus" }); qc.invalidateQueries({ queryKey: ["schools"] }); }
        }}
      />
    </div>
  );
}
