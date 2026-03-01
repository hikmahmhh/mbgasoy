import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Building2, Users, Plus, Pencil, Ban, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export default function SuperAdminPage() {
  const { isSuperAdmin, switchOrg } = useOrg();
  const qc = useQueryClient();
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<any>(null);
  const [viewOrgId, setViewOrgId] = useState<string | null>(null);

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  // Fetch all organizations (super admin can see all via RLS)
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["sa-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all org_members for a specific org
  const { data: orgMembers = [] } = useQuery({
    queryKey: ["sa-org-members", viewOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_members")
        .select("*, profiles:user_id(full_name, phone)")
        .eq("org_id", viewOrgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!viewOrgId,
  });

  // Stats
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => o.status === "active").length;
  const suspendedOrgs = organizations.filter(o => o.status === "suspended").length;

  const handleToggleStatus = async (orgId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const { error } = await supabase.from("organizations").update({ status: newStatus }).eq("id", orgId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Organisasi ${newStatus === "active" ? "diaktifkan" : "disuspend"}`);
    qc.invalidateQueries({ queryKey: ["sa-organizations"] });
  };

  const handleUpdatePlan = async (orgId: string, plan: string) => {
    const { error } = await supabase.from("organizations").update({ plan }).eq("id", orgId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Plan berhasil diubah ke ${plan}`);
    qc.invalidateQueries({ queryKey: ["sa-organizations"] });
  };

  const handleImpersonate = (orgId: string) => {
    switchOrg(orgId);
    toast.success("Anda sekarang melihat sebagai organisasi ini");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Super Admin Panel</h1>
          <p className="text-muted-foreground">Kelola semua tenant/organisasi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Organisasi", value: totalOrgs, icon: Building2 },
          { label: "Aktif", value: activeOrgs, icon: CheckCircle },
          { label: "Suspended", value: suspendedOrgs, icon: Ban },
        ].map((s, i) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="orgs">
        <TabsList>
          <TabsTrigger value="orgs"><Building2 className="h-3.5 w-3.5 mr-1" /> Organisasi</TabsTrigger>
          {viewOrgId && <TabsTrigger value="members"><Users className="h-3.5 w-3.5 mr-1" /> Anggota</TabsTrigger>}
        </TabsList>

        <TabsContent value="orgs" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Organisasi</CardTitle>
                <CardDescription>Semua tenant yang terdaftar</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditOrg(null); setOrgDialogOpen(true); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Buat Organisasi
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Memuat...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map(org => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{org.slug}</TableCell>
                        <TableCell>
                          <Badge variant={org.status === "active" ? "default" : "destructive"}>
                            {org.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select value={org.plan} onValueChange={(v) => handleUpdatePlan(org.id, v)}>
                            <SelectTrigger className="w-24 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(org.created_at).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => { setViewOrgId(org.id); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => { setEditOrg(org); setOrgDialogOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => handleToggleStatus(org.id, org.status)}>
                            {org.status === "active" ? <Ban className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle className="h-3.5 w-3.5 text-success" />}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => handleImpersonate(org.id)}>
                            Login As
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {viewOrgId && (
          <TabsContent value="members" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Anggota Organisasi</CardTitle>
                <CardDescription>
                  {organizations.find(o => o.id === viewOrgId)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgMembers.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.profiles?.full_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={m.role === "admin" ? "default" : "secondary"}>{m.role}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleDateString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Create/Edit Org Dialog */}
      <OrgFormDialog
        open={orgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        org={editOrg}
        onSaved={() => qc.invalidateQueries({ queryKey: ["sa-organizations"] })}
      />
    </div>
  );
}

function OrgFormDialog({ open, onOpenChange, org, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; org: any; onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", address: "", phone: "" });

  const isEdit = !!org;

  useState(() => {
    if (org) {
      setForm({ name: org.name, slug: org.slug, address: org.address || "", phone: org.phone || "" });
    } else {
      setForm({ name: "", slug: "", address: "", phone: "" });
    }
  });

  // Reset form when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o && org) {
      setForm({ name: org.name, slug: org.slug, address: org.address || "", phone: org.phone || "" });
    } else if (o) {
      setForm({ name: "", slug: "", address: "", phone: "" });
    }
    onOpenChange(o);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Nama organisasi harus diisi"); return; }
    const slug = form.slug || "org-" + Date.now();
    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase.from("organizations").update({ ...form, slug }).eq("id", org.id);
        if (error) throw error;
        toast.success("Organisasi diperbarui");
      } else {
        const { error } = await supabase.from("organizations").insert({ ...form, slug });
        if (error) throw error;
        toast.success("Organisasi dibuat");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Organisasi" : "Buat Organisasi Baru"}</DialogTitle>
          <DialogDescription>{isEdit ? "Ubah detail organisasi" : "Isi data organisasi baru"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Nama *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" /></div>
          <div><Label>Alamat</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div><Label>Telepon</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
