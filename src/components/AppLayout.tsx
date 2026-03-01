import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, Package, Truck, FileBarChart,
  ChefHat, School, Settings, Menu, LogOut, Shield, ChevronsUpDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: UtensilsCrossed, label: "Menu Harian", path: "/menu" },
  { icon: Package, label: "Stok Bahan", path: "/inventory" },
  { icon: Truck, label: "Distribusi", path: "/distribution" },
  { icon: FileBarChart, label: "Laporan", path: "/reports" },
  { icon: School, label: "Sekolah", path: "/schools" },
  { icon: Settings, label: "Pengaturan", path: "/settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { currentOrgId, currentOrg, orgRole, orgs, isSuperAdmin, switchOrg } = useOrg();

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col sidebar-gradient transition-transform duration-300 lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <ChefHat className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-sidebar-foreground truncate">
              {currentOrg?.name || "Dapur MBG"}
            </h1>
            <p className="text-xs text-sidebar-foreground/60">SPPG Management</p>
          </div>
        </div>

        {/* Org Switcher */}
        {orgs.length > 1 && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <Select value={currentOrgId || ""} onValueChange={switchOrg}>
              <SelectTrigger className="w-full h-8 text-xs bg-sidebar-accent/40 border-sidebar-border text-sidebar-foreground">
                <ChevronsUpDown className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Pilih organisasi" />
              </SelectTrigger>
              <SelectContent>
                {orgs.map((o) => (
                  <SelectItem key={o.org_id} value={o.org_id}>
                    {o.organizations.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}>
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}

          {isSuperAdmin && (
            <Link to="/super-admin" onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                location.pathname === "/super-admin"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
              <Shield className="h-4.5 w-4.5" />
              Super Admin
            </Link>
          )}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
          <div className="rounded-lg bg-sidebar-accent/60 px-3 py-3">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.email}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">
              {isSuperAdmin ? "Super Admin" : orgRole || "member"}
            </p>
          </div>
          <button onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-secondary lg:hidden">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">
              {navItems.find((n) => n.path === location.pathname)?.label
                || (location.pathname === "/super-admin" ? "Super Admin" : "Dashboard")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
