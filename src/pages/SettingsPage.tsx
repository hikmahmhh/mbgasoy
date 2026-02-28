import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import type { Tables as DbTables } from "@/integrations/supabase/types";

// --- Profile Tab ---
function ProfileTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", kitchen_name: "" });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        kitchen_name: profile.kitchen_name || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(form)
        .eq("user_id", user!.id);
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
      <CardHeader>
        <CardTitle>Profil Dapur</CardTitle>
        <CardDescription>Informasi profil Anda dan nama dapur</CardDescription>
      </CardHeader>
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

// --- User Management Tab (Admin only) ---
function UserManagementTab() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: usersWithRoles = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Fetch all profiles + their roles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, kitchen_name, created_at");
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role, id");
      if (rErr) throw rErr;

      return (profiles || []).map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role || "operator",
        role_id: roles?.find(r => r.user_id === p.user_id)?.id || null,
      }));
    },
  });

  const handleRoleChange = async (userId: string, roleId: string | null, newRole: string) => {
    try {
      if (roleId) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole as any })
          .eq("id", roleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole as any });
        if (error) throw error;
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: `Role berhasil diubah ke ${newRole}` });
    } catch (e: any) {
      toast({ title: "Gagal mengubah role", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-muted-foreground text-center py-8">Memuat data pengguna...</p>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Pengguna</CardTitle>
          <CardDescription>Kelola peran pengguna — hanya admin yang bisa mengakses halaman ini</CardDescription>
        </CardHeader>
        <CardContent>
          {usersWithRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Belum ada pengguna</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Dapur</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersWithRoles.map(u => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-medium">{u.full_name || "-"}</TableCell>
                    <TableCell>{u.kitchen_name || "-"}</TableCell>
                    <TableCell>{u.phone || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.user_id, u.role_id, val)}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <Badge variant="default" className="text-[10px]">Admin</Badge>
                          </SelectItem>
                          <SelectItem value="operator">
                            <Badge variant="secondary" className="text-[10px]">Operator</Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget({ id: u.role_id!, name: u.full_name || "Pengguna" })}
                        disabled={!u.role_id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        title="Hapus Role Pengguna"
        description={`Yakin ingin menghapus role ${deleteTarget?.name}? Pengguna tidak akan bisa mengakses fitur.`}
        onConfirm={async () => {
          const { error } = await supabase.from("user_roles").delete().eq("id", deleteTarget!.id);
          if (error) toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
          else { toast({ title: "Role dihapus" }); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
        }}
      />
    </>
  );
}

// --- Main Settings Page ---
export default function SettingsPage() {
  const { user } = useAuth();

  const { data: isAdmin = false } = useQuery({
    queryKey: ["my-role", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dapur dan pengguna</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil Dapur</TabsTrigger>
          {isAdmin && <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1" /> Pengguna</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileTab />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="users" className="mt-4">
            <UserManagementTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
