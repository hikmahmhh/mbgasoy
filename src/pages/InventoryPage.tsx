import { Package, AlertTriangle, Plus, Search } from "lucide-react";
import { useState } from "react";

const inventory = [
  { id: 1, nama: "Beras", stok: 180, satuan: "kg", min: 50, harga: 14000, kategori: "Pokok" },
  { id: 2, nama: "Ayam Potong", stok: 45, satuan: "kg", min: 30, harga: 38000, kategori: "Protein" },
  { id: 3, nama: "Telur", stok: 40, satuan: "butir", min: 100, harga: 2500, kategori: "Protein" },
  { id: 4, nama: "Bayam", stok: 25, satuan: "ikat", min: 20, harga: 5000, kategori: "Sayur" },
  { id: 5, nama: "Ikan Tongkol", stok: 30, satuan: "kg", min: 20, harga: 32000, kategori: "Protein" },
  { id: 6, nama: "Minyak Goreng", stok: 15, satuan: "liter", min: 10, harga: 18000, kategori: "Pokok" },
  { id: 7, nama: "Kangkung", stok: 18, satuan: "ikat", min: 15, harga: 3000, kategori: "Sayur" },
  { id: 8, nama: "Pisang", stok: 60, satuan: "sisir", min: 30, harga: 15000, kategori: "Buah" },
  { id: 9, nama: "Gula Pasir", stok: 8, satuan: "kg", min: 10, harga: 16000, kategori: "Pokok" },
  { id: 10, nama: "Susu UHT", stok: 120, satuan: "kotak", min: 50, harga: 5500, kategori: "Minuman" },
];

const categories = ["Semua", "Pokok", "Protein", "Sayur", "Buah", "Minuman"];

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filtered = inventory.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Semua" || item.kategori === category;
    return matchSearch && matchCat;
  });

  const lowStock = inventory.filter((i) => i.stok <= i.min);

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
              {lowStock.map((i) => i.nama).join(", ")} perlu restock segera
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
              {filtered.map((item) => {
                const isLow = item.stok <= item.min;
                return (
                  <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{item.nama}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {item.stok} {item.satuan}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      {item.min} {item.satuan}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">
                      Rp {item.harga.toLocaleString("id")}
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
