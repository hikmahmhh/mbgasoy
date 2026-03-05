import { useState, useEffect } from "react";
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
import {
  Shield, Building2, Users, Plus, Pencil, Ban, CheckCircle, Eye,
  CreditCard, Search, UserCog, Clock, AlertTriangle, CalendarPlus, Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { format, addDays, addMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function SuperAdminPage() {
  const { isSuperAdmin, switchOrg } = useOrg();
  const qc = useQueryClient();
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<any>(null);
  const [viewOrgId, setViewOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("orgs");
  const [expiryDialogSub, setExpiryDialogSub] = useState<any>(null);

  // Search states
  const [orgSearch, setOrgSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [subSearch, setSubSearch] = useState("");

  // ── All Organizations ──
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["sa-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ── All Org Members (global) with profiles ──
  const { data: allMembers = [] } = useQuery({
    queryKey: ["sa-all-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_members")
        .select("*, profiles:user_id(full_name, phone), organizations(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  // ── All User Roles ──
  const { data: allRoles = [] } = useQuery({
    queryKey: ["sa-all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  // ── Org Members for specific org ──
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

  // ── All Subscriptions ──
  const { data: subscriptions = [] } = useQuery({
    queryKey: ["sa-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, organizations(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  // ── Helper: get owner (admin) of an org ──
  const getOrgOwner = (orgId: string) => {
    const admin = allMembers.find(m => m.org_id === orgId && m.role === "admin");
    return admin ? {
      name: admin.profiles?.full_name || "—",
      phone: admin.profiles?.phone || "—",
    } : { name: "—", phone: "—" };
  };

  // ── Stats ──
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => o.status === "active").length;
  const suspendedOrgs = organizations.filter(o => o.status === "suspended").length;
  const totalUsers = new Set(allMembers.map(m => m.user_id)).size;
  const trialSubs = subscriptions.filter(s => s.status === "trial").length;
  const activeSubs = subscriptions.filter(s => s.status === "active").length;
  const expiredSubs = subscriptions.filter(s => s.status === "expired").length;

  // ── Filtered data ──
  const filteredOrgs = organizations.filter(o =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
    o.slug.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const filteredMembers = allMembers.filter(m => {
    const name = m.profiles?.full_name || "";
    const orgName = m.organizations?.name || "";
    const q = userSearch.toLowerCase();
    return name.toLowerCase().includes(q) || orgName.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
  });

  const filteredSubs = subscriptions.filter(s => {
    const orgName = s.organizations?.name || "";
    const q = subSearch.toLowerCase();
    return orgName.toLowerCase().includes(q) || s.status.toLowerCase().includes(q);
  });

  const isSuperAdminUser = (userId: string) => allRoles.some(r => r.user_id === userId && r.role === "super_admin");

  const handleToggleStatus = async (orgId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const { error } = await supabase.from("organizations").update({ status: newStatus }).eq("id", orgId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Organisasi ${newStatus === "active" ? "diaktifkan" : "disuspend"}`);
    qc.invalidateQueries({ queryKey: ["sa-organizations"] });
  };

  const handleImpersonate = (orgId: string) => {
    switchOrg(orgId);
    toast.success("Anda sekarang melihat sebagai organisasi ini");
  };

  const handleUpdateSubStatus = async (subId: string, status: string) => {
    const { error } = await supabase.from("subscriptions").update({ status, updated_at: new Date().toISOString() }).eq("id", subId);
    if (error) { toast.error(error.message); return; }
    // If activating, also activate the org
    if (status === "active") {
      const sub = subscriptions.find(s => s.id === subId);
      if (sub) {
        await supabase.from("organizations").update({ status: "active" }).eq("id", sub.org_id);
        qc.invalidateQueries({ queryKey: ["sa-organizations"] });
      }
    }
    toast.success(`Status langganan diubah ke ${status}`);
    qc.invalidateQueries({ queryKey: ["sa-subscriptions"] });
  };

  const handleSetExpiry = async (subId: string, date: string) => {
    const { error } = await supabase.from("subscriptions").update({
      current_period_end: date,
      status: "active",
      updated_at: new Date().toISOString(),
    }).eq("id", subId);
    if (error) { toast.error(error.message); return; }
    // Also activate org
    const sub = subscriptions.find(s => s.id === subId);
    if (sub) {
      await supabase.from("organizations").update({ status: "active" }).eq("id", sub.org_id);
      qc.invalidateQueries({ queryKey: ["sa-organizations"] });
    }
    toast.success("Masa aktif diperbarui & langganan diaktifkan");
    qc.invalidateQueries({ queryKey: ["sa-subscriptions"] });
    setExpiryDialogSub(null);
  };

  const handleQuickExtend = async (subId: string, days: number) => {
    const sub = subscriptions.find(s => s.id === subId);
    const baseDate = sub?.current_period_end ? new Date(sub.current_period_end) : new Date();
    const newDate = addDays(baseDate, days);
    await handleSetExpiry(subId, format(newDate, "yyyy-MM-dd"));
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from("org_members").delete().eq("id", memberId);
    if (error) { toast.error(error.message); return; }
    toast.success("Anggota dihapus");
    qc.invalidateQueries({ queryKey: ["sa-all-members"] });
  };

  const formatDate = (d: string | null) => d ? format(new Date(d), "dd MMM yyyy", { locale: idLocale }) : "—";

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default", trial: "secondary", expired: "destructive", suspended: "destructive",
      pending: "outline", paid: "default", failed: "destructive", cancelled: "destructive",
    };
    return <Badge variant={map[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Panel Pengelola Web</h1>
          <p className="text-muted-foreground">Kelola semua organisasi, pengguna, dan langganan platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { label: "Total Org", value: totalOrgs, icon: Building2, color: "text-primary" },
          { label: "Org Aktif", value: activeOrgs, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Suspended", value: suspendedOrgs, icon: Ban, color: "text-destructive" },
          { label: "Total User", value: totalUsers, icon: Users, color: "text-primary" },
          { label: "Trial", value: trialSubs, icon: Clock, color: "text-amber-500" },
          { label: "Berbayar", value: activeSubs, icon: CreditCard, color: "text-emerald-500" },
          { label: "Expired", value: expiredSubs, icon: AlertTriangle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="orgs"><Building2 className="h-3.5 w-3.5 mr-1" /> Organisasi</TabsTrigger>
          <TabsTrigger value="users"><UserCog className="h-3.5 w-3.5 mr-1" /> User Global</TabsTrigger>
          <TabsTrigger value="subs"><CreditCard className="h-3.5 w-3.5 mr-1" /> Langganan</TabsTrigger>
          {viewOrgId && <TabsTrigger value="members"><Users className="h-3.5 w-3.5 mr-1" /> Anggota Org</TabsTrigger>}
        </TabsList>

        {/* ── TAB: Organisasi ── */}
        <TabsContent value="orgs" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>Daftar Organisasi</CardTitle>
                <CardDescription>Semua tenant yang terdaftar di platform</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Cari organisasi..." value={orgSearch} onChange={e => setOrgSearch(e.target.value)}
                    className="pl-8 h-9 w-48 text-sm" />
                </div>
                <Button size="sm" onClick={() => { setEditOrg(null); setOrgDialogOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Buat Organisasi
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Memuat...</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Owner (Admin)</TableHead>
                        <TableHead>No. HP Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dibuat</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrgs.map(org => {
                        const owner = getOrgOwner(org.id);
                        return (
                          <TableRow key={org.id}>
                            <TableCell className="font-medium">{org.name}</TableCell>
                            <TableCell className="text-sm">{owner.name}</TableCell>
                            <TableCell className="text-sm">
                              {owner.phone !== "—" ? (
                                <a href={`https://wa.me/${owner.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline">
                                  <Phone className="h-3 w-3" />
                                  {owner.phone}
                                </a>
                              ) : "—"}
                            </TableCell>
                            <TableCell>{statusBadge(org.status)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDate(org.created_at)}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Lihat anggota"
                                onClick={() => { setViewOrgId(org.id); setActiveTab("members"); }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit"
                                onClick={() => { setEditOrg(org); setOrgDialogOpen(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" title={org.status === "active" ? "Suspend" : "Aktifkan"}
                                onClick={() => handleToggleStatus(org.id, org.status)}>
                                {org.status === "active" ? <Ban className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs"
                                onClick={() => handleImpersonate(org.id)}>
                                Login As
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredOrgs.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Tidak ada organisasi ditemukan</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: User Global ── */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>Semua Pengguna</CardTitle>
                <CardDescription>{totalUsers} pengguna terdaftar di seluruh organisasi</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Cari nama, organisasi, role..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  className="pl-8 h-9 w-56 text-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Organisasi</TableHead>
                      <TableHead>Role Org</TableHead>
                      <TableHead>Role Sistem</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.profiles?.full_name || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.profiles?.phone || "—"}</TableCell>
                        <TableCell className="text-sm">{m.organizations?.name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={m.role === "admin" ? "default" : "secondary"}>{m.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {isSuperAdminUser(m.user_id) && (
                            <Badge variant="destructive" className="text-[10px]">Super Admin</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => handleImpersonate(m.org_id)}>
                            Login As Org
                          </Button>
                          {!isSuperAdminUser(m.user_id) && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive"
                              onClick={() => handleRemoveMember(m.id)}>
                              Hapus
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredMembers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Tidak ada pengguna ditemukan</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: Langganan ── */}
        <TabsContent value="subs" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>Manajemen Langganan</CardTitle>
                <CardDescription>Kelola status dan masa aktif langganan setiap organisasi</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Cari organisasi, status..." value={subSearch} onChange={e => setSubSearch(e.target.value)}
                  className="pl-8 h-9 w-56 text-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisasi</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trial Berakhir</TableHead>
                      <TableHead>Masa Aktif Hingga</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubs.map((s: any) => {
                      const isTrialExpiring = s.status === "trial" && new Date(s.trial_ends_at) < new Date(Date.now() + 3 * 86400000);
                      const isExpired = s.status === "expired" || s.status === "cancelled";
                      const owner = getOrgOwner(s.org_id);
                      return (
                        <TableRow key={s.id} className={isExpired ? "bg-destructive/5" : isTrialExpiring ? "bg-amber-500/5" : ""}>
                          <TableCell className="font-medium">{s.organizations?.name || "—"}</TableCell>
                          <TableCell className="text-xs">
                            <div>{owner.name}</div>
                            {owner.phone !== "—" && (
                              <a href={`https://wa.me/${owner.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-0.5">
                                <Phone className="h-2.5 w-2.5" /> {owner.phone}
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select value={s.status} onValueChange={(v) => handleUpdateSubStatus(s.id, v)}>
                              <SelectTrigger className="w-28 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="trial">Trial</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className={isTrialExpiring ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                              {formatDate(s.trial_ends_at)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {s.current_period_end ? (
                              <span className={new Date(s.current_period_end) < new Date() ? "text-destructive" : "text-foreground"}>
                                {formatDate(s.current_period_end)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Belum diset</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="outline" className="h-7 text-xs"
                                onClick={() => handleQuickExtend(s.id, 30)} title="Tambah 30 hari">
                                +30 hari
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs"
                                onClick={() => setExpiryDialogSub(s)} title="Atur masa aktif">
                                <CalendarPlus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredSubs.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Tidak ada langganan ditemukan</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: Anggota Org ── */}
        {viewOrgId && (
          <TabsContent value="members" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Anggota Organisasi</CardTitle>
                <CardDescription>{organizations.find(o => o.id === viewOrgId)?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgMembers.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.profiles?.full_name || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.profiles?.phone || "—"}</TableCell>
                        <TableCell><Badge variant={m.role === "admin" ? "default" : "secondary"}>{m.role}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <OrgFormDialog
        open={orgDialogOpen}
        onOpenChange={setOrgDialogOpen}
        org={editOrg}
        onSaved={() => qc.invalidateQueries({ queryKey: ["sa-organizations"] })}
      />

      {/* ── Expiry Date Dialog ── */}
      <ExpiryDialog
        sub={expiryDialogSub}
        onClose={() => setExpiryDialogSub(null)}
        onSave={handleSetExpiry}
        onQuickExtend={handleQuickExtend}
      />
    </div>
  );
}

function ExpiryDialog({ sub, onClose, onSave, onQuickExtend }: {
  sub: any; onClose: () => void;
  onSave: (subId: string, date: string) => Promise<void>;
  onQuickExtend: (subId: string, days: number) => Promise<void>;
}) {
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sub?.current_period_end) {
      setCustomDate(format(new Date(sub.current_period_end), "yyyy-MM-dd"));
    } else {
      setCustomDate(format(addMonths(new Date(), 1), "yyyy-MM-dd"));
    }
  }, [sub]);

  const handleSave = async () => {
    if (!customDate) return;
    setLoading(true);
    await onSave(sub.id, customDate);
    setLoading(false);
  };

  if (!sub) return null;

  return (
    <Dialog open={!!sub} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Atur Masa Aktif</DialogTitle>
          <DialogDescription>{sub.organizations?.name || "Organisasi"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Masa aktif saat ini: <span className="font-medium text-foreground">
              {sub.current_period_end ? format(new Date(sub.current_period_end), "dd MMM yyyy") : "Belum diset"}
            </span>
          </div>

          {/* Quick buttons */}
          <div className="space-y-2">
            <Label className="text-xs">Perpanjang cepat:</Label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "+7 hari", days: 7 },
                { label: "+30 hari", days: 30 },
                { label: "+90 hari", days: 90 },
                { label: "+1 tahun", days: 365 },
              ].map(opt => (
                <Button key={opt.days} size="sm" variant="outline" className="text-xs"
                  onClick={async () => { setLoading(true); await onQuickExtend(sub.id, opt.days); setLoading(false); }}
                  disabled={loading}>
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom date */}
          <div className="space-y-1">
            <Label className="text-xs">Atau pilih tanggal spesifik:</Label>
            <Input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} disabled={loading || !customDate}>
            {loading ? "Menyimpan..." : "Simpan & Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrgFormDialog({ open, onOpenChange, org, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; org: any; onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", address: "", phone: "" });
  const isEdit = !!org;

  useEffect(() => {
    if (open) {
      if (org) {
        setForm({ name: org.name, slug: org.slug, address: org.address || "", phone: org.phone || "" });
      } else {
        setForm({ name: "", slug: "", address: "", phone: "" });
      }
    }
  }, [open, org]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
