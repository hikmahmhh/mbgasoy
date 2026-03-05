import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Trash2, CreditCard, UserPlus, Mail, Check, X, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { format, differenceInDays } from "date-fns";
import { useActivityLog } from "@/hooks/useActivityLog";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { WA_PAYMENT_LINK, WA_PAYMENT_NUMBER } from "@/lib/planLimits";

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
  const { currentOrgId, isOrgAdmin, currentOrg } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { log } = useActivityLog();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("operator");
  const [inviting, setInviting] = useState(false);
  const { canAdd, limits } = usePlanLimits();

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

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["org-invitations", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_invitations" as any)
        .select("*")
        .eq("org_id", currentOrgId!)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrgId,
  });

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase.from("org_members").update({ role: newRole }).eq("id", memberId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["org-members"] });
      toast({ title: `Role berhasil diubah ke ${newRole}` });
      await log("update", "member", memberId, { role: newRole });
    } catch (e: any) {
      toast({ title: "Gagal mengubah role", description: e.message, variant: "destructive" });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentOrgId) return;
    setInviting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("Sesi tidak valid, silakan login ulang");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            role: inviteRole,
            org_id: currentOrgId,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengundang");

      qc.invalidateQueries({ queryKey: ["org-members"] });
      qc.invalidateQueries({ queryKey: ["org-invitations"] });
      toast({ title: "Berhasil!", description: result.message });
      await log("invite", "member", undefined, { email: inviteEmail, role: inviteRole, type: result.type });
      setInviteEmail("");
    } catch (e: any) {
      toast({ title: "Gagal mengundang", description: e.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    try {
      const { error } = await supabase
        .from("org_invitations" as any)
        .update({ status: "cancelled" })
        .eq("id", inviteId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["org-invitations"] });
      toast({ title: "Undangan dibatalkan", description: `Undangan untuk ${email} dibatalkan` });
    } catch (e: any) {
      toast({ title: "Gagal", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-muted-foreground text-center py-8">Memuat...</p>;

  return (
    <div className="space-y-4">
      {/* Invite member section */}
      {isOrgAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Undang Anggota</CardTitle>
            <CardDescription>Undang anggota baru via email. User yang sudah terdaftar akan langsung ditambahkan, yang belum akan menerima email undangan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Email anggota baru"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim() || !canAdd("members")}
                title={!canAdd("members") ? `Batas ${limits.maxMembers} anggota tercapai` : ""}>
                <Mail className="h-4 w-4 mr-1" />
                {inviting ? "Mengundang..." : "Undang"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Undangan Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingInvites.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: <Badge variant="secondary" className="text-[10px] ml-1">{inv.role}</Badge>
                      <span className="ml-2">Kadaluarsa: {new Date(inv.expires_at).toLocaleDateString("id-ID")}</span>
                    </p>
                  </div>
                  {isOrgAdmin && (
                    <Button size="sm" variant="ghost" onClick={() => handleCancelInvite(inv.id, inv.email)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                      {m.user_id !== user?.id && (
                        <Button size="icon" variant="ghost"
                          onClick={() => setDeleteTarget({ id: m.id, name: m.profiles?.full_name || "Anggota" })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
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
          else {
            toast({ title: "Anggota dihapus" });
            qc.invalidateQueries({ queryKey: ["org-members"] });
            await log("delete", "member", deleteTarget!.id, { name: deleteTarget!.name });
          }
        }}
      />
    </div>
  );
}

function SubscriptionTab() {
  const { currentOrgId, currentOrg } = useOrg();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription-settings", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("org_id", currentOrgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payment-history", currentOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("org_id", currentOrgId!)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrgId,
  });

  if (isLoading) return <p className="text-muted-foreground text-center py-8">Memuat...</p>;

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    trial: { label: "Trial", variant: "secondary" },
    active: { label: "Aktif", variant: "default" },
    expired: { label: "Expired", variant: "destructive" },
    cancelled: { label: "Dibatalkan", variant: "destructive" },
  };

  const trialDaysLeft = subscription?.status === "trial" && subscription?.trial_ends_at
    ? Math.max(0, differenceInDays(new Date(subscription.trial_ends_at), new Date()))
    : null;

  const statusInfo = statusMap[subscription?.status || "trial"] || statusMap.trial;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Langganan</CardTitle>
          <CardDescription>Status langganan organisasi {currentOrg?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={statusInfo.variant} className="mt-1">{statusInfo.label}</Badge>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Paket</p>
              <p className="mt-1 text-sm font-semibold text-foreground capitalize">{subscription?.plan || "-"}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">
                {subscription?.status === "trial" ? "Trial berakhir" : "Periode berakhir"}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {subscription?.status === "trial" && subscription?.trial_ends_at
                  ? `${format(new Date(subscription.trial_ends_at), "dd/MM/yyyy")} (${trialDaysLeft} hari lagi)`
                  : subscription?.current_period_end
                    ? format(new Date(subscription.current_period_end), "dd/MM/yyyy")
                    : "-"}
              </p>
            </div>
          </div>
          {(subscription?.status === "trial" || subscription?.status === "expired") && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">
                {subscription.status === "expired" ? "Langganan telah berakhir" : "Anda sedang dalam masa trial"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Hubungi admin untuk upgrade paket atau lakukan pembayaran melalui metode yang tersedia.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-accent" /> Perbandingan Paket</CardTitle>
          <CardDescription>Pilih paket yang sesuai dengan kebutuhan dapur Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
              const isCurrent = (subscription?.plan || currentOrg?.plan || "starter") === key;
              const features = [
                { label: "Sekolah", value: plan.maxSchools === Infinity ? "Unlimited" : `${plan.maxSchools}` },
                { label: "Anggota", value: plan.maxMembers === Infinity ? "Unlimited" : `${plan.maxMembers}` },
                { label: "Menu", value: plan.maxMenuItems === Infinity ? "Unlimited" : `${plan.maxMenuItems}` },
                { label: "Inventaris", value: plan.maxInventoryItems === Infinity ? "Unlimited" : `${plan.maxInventoryItems}` },
                { label: "Export PDF", value: plan.exportPDF },
                { label: "Export CSV", value: plan.exportCSV },
              ];

              return (
                <div
                  key={key}
                  className={`relative rounded-xl border-2 p-5 transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px]">
                      Paket Saat Ini
                    </Badge>
                  )}
                  {key === "pro" && !isCurrent && (
                    <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground text-[10px]">
                      Populer
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">{plan.label}</h3>
                    <p className="text-2xl font-extrabold text-foreground mt-1">
                      {formatPrice(plan.price)}
                      <span className="text-xs font-normal text-muted-foreground">/bulan</span>
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2 text-sm">
                        {typeof f.value === "boolean" ? (
                          f.value ? (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                          )
                        ) : (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <span className={typeof f.value === "boolean" && !f.value ? "text-muted-foreground/60" : "text-foreground"}>
                          {f.label}: {typeof f.value === "boolean" ? (f.value ? "Ya" : "Tidak") : f.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <Button className="w-full mt-4" variant={key === "pro" ? "default" : "outline"} size="sm">
                      Upgrade ke {plan.label}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{format(new Date(p.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-medium">Rp {Number(p.amount).toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.payment_method || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "paid" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { isOrgAdmin } = useOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil, anggota, dan langganan</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="members"><Users className="h-3.5 w-3.5 mr-1" /> Anggota</TabsTrigger>
          <TabsTrigger value="subscription"><CreditCard className="h-3.5 w-3.5 mr-1" /> Langganan</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4"><ProfileTab /></TabsContent>
        <TabsContent value="members" className="mt-4"><OrgMembersTab /></TabsContent>
        <TabsContent value="subscription" className="mt-4"><SubscriptionTab /></TabsContent>
      </Tabs>
    </div>
  );
}
