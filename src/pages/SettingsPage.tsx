import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Trash2, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { format, differenceInDays } from "date-fns";

function ProfileTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", kitchen_name: "" });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || "", phone: profile.phone || "", kitchen_name: profile.kitchen_name || "" });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update(form).eq("user_id", user!.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast({ title: "Profil berhasil disimpan" });
    } catch (e: any) {
      toast({ title: "Gagal menyimpan", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground text-center py-8">Memuat profil...</p>;

  return (
    <Card>
      <CardHeader><CardTitle>Profil Saya</CardTitle><CardDescription>Informasi profil Anda</CardDescription></CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        <div><Label>Email</Label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
        <div><Label>Nama Lengkap</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
        <div><Label>Nama Dapur</Label><Input value={form.kitchen_name} onChange={e => setForm(f => ({ ...f, kitchen_name: e.target.value }))} placeholder="Contoh: Dapur Sehat Nusantara" /></div>
        <div><Label>No. Telepon</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxxx" /></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Profil"}</Button>
      </CardContent>
    </Card>
  );
}

function OrgMembersTab() {
  const { currentOrgId, isOrgAdmin } = useOrg();
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["org-members", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_members")
        .select("id, user_id, role, created_at, profiles:user_id(full_name, phone, kitchen_name)")
        .eq("org_id", currentOrgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase.from("org_members").update({ role: newRole }).eq("id", memberId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["org-members"] });
      toast({ title: `Role berhasil diubah ke ${newRole}` });
    } catch (e: any) {
      toast({ title: "Gagal mengubah role", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-muted-foreground text-center py-8">Memuat...</p>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Anggota Organisasi</CardTitle>
          <CardDescription>Kelola anggota dan peran di organisasi ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Role</TableHead>
                {isOrgAdmin && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.profiles?.full_name || "—"}</TableCell>
                  <TableCell>{m.profiles?.phone || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    {isOrgAdmin ? (
                      <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin"><Badge variant="default" className="text-[10px]">Admin</Badge></SelectItem>
                          <SelectItem value="operator"><Badge variant="secondary" className="text-[10px]">Operator</Badge></SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={m.role === "admin" ? "default" : "secondary"}>{m.role}</Badge>
                    )}
                  </TableCell>
                  {isOrgAdmin && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost"
                        onClick={() => setDeleteTarget({ id: m.id, name: m.profiles?.full_name || "Anggota" })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        title="Hapus Anggota"
        description={`Yakin ingin menghapus ${deleteTarget?.name} dari organisasi?`}
        onConfirm={async () => {
          const { error } = await supabase.from("org_members").delete().eq("id", deleteTarget!.id);
          if (error) toast({ title: "Gagal", description: error.message, variant: "destructive" });
          else { toast({ title: "Anggota dihapus" }); qc.invalidateQueries({ queryKey: ["org-members"] }); }
        }}
      />
    </>
  );
}

export default function SettingsPage() {
  const { isOrgAdmin } = useOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan anggota organisasi</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="members"><Users className="h-3.5 w-3.5 mr-1" /> Anggota</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4"><ProfileTab /></TabsContent>
        <TabsContent value="members" className="mt-4"><OrgMembersTab /></TabsContent>
      </Tabs>
    </div>
  );
}
