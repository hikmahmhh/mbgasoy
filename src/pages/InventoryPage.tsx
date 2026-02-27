import { Package, AlertTriangle, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const categories = ["Semua", ...Array.from(new Set(inventory.map((i) => i.category)))];

  const filtered = inventory.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Semua" || item.category === category;
    return matchSearch && matchCat;
  });

  const lowStock = inventory.filter((i) => Number(i.current_stock) <= Number(i.min_stock));

  return (
    <div className="space-y-6">
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 opacity-0 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {lowStock.length} item stok rendah
            </p>
            <p className="text-xs text-muted-foreground">
              {lowStock.map((i) => i.name).join(", ")} perlu restock segera
            </p>
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari bahan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Bahan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Kategori</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Stok</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Min. Stok</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Harga/Satuan</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      {inventory.length === 0 ? "Belum ada data inventaris" : "Tidak ada hasil pencarian"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = Number(item.current_stock) <= Number(item.min_stock);
                    return (
                      <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-3 font-medium text-foreground">{item.name}</td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-foreground">
                          {Number(item.current_stock)} {item.unit}
                        </td>
                        <td className="px-5 py-3 text-right text-muted-foreground">
                          {Number(item.min_stock)} {item.unit}
                        </td>
                        <td className="px-5 py-3 text-right text-muted-foreground">
                          Rp {Number(item.price_per_unit ?? 0).toLocaleString("id")}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              isLow ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                            }`}
                          >
                            {isLow ? "Rendah" : "Aman"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
