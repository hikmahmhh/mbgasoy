import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  UtensilsCrossed,
  Truck,
  Package,
  BarChart3,
  School,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Hero ──────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 md:py-32">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />

      <div className="container mx-auto max-w-6xl px-4 text-center relative z-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/25">
          <ChefHat className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Dapur <span className="text-primary">MBG</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Sistem Pengelolaan SPPG terlengkap. Kelola menu, inventaris, dan distribusi makanan bergizi ke seluruh sekolah — dalam satu platform.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/25">
            <Link to="/auth">
              Mulai Trial 7 Hari <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 text-base">
            <a href="#pricing">Lihat Paket Harga</a>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Tanpa kartu kredit • Gratis 7 hari • Batalkan kapan saja</p>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────
const features = [
  {
    icon: UtensilsCrossed,
    title: "Manajemen Menu",
    desc: "Atur menu harian lengkap dengan info kalori, protein, karbohidrat, dan lemak per porsi.",
  },
  {
    icon: Package,
    title: "Inventaris Bahan",
    desc: "Pantau stok bahan secara real-time, notifikasi stok minimum, dan riwayat restok.",
  },
  {
    icon: Truck,
    title: "Distribusi Makanan",
    desc: "Catat pengiriman ke setiap sekolah, pantau status distribusi, dan laporan harian.",
  },
  {
    icon: School,
    title: "Data Sekolah",
    desc: "Kelola data sekolah binaan, jumlah siswa, kontak PIC, dan alamat lengkap.",
  },
  {
    icon: BarChart3,
    title: "Laporan & Analitik",
    desc: "Dashboard visual dengan grafik tren distribusi, ringkasan keuangan, dan laporan PDF.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tenant & Aman",
    desc: "Setiap organisasi terisolasi. Kelola tim dengan peran admin & operator secara aman.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Fitur Unggulan</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Semua yang Anda Butuhkan</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Platform lengkap untuk operasional dapur program makanan bergizi gratis.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: "199.000",
    period: "/bulan",
    desc: "Untuk dapur kecil yang baru memulai.",
    features: [
      "Maks 5 sekolah",
      "Manajemen menu harian",
      "Distribusi & laporan dasar",
      "1 admin + 2 operator",
      "Email support",
    ],
    cta: "Mulai Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "499.000",
    period: "/bulan",
    desc: "Untuk dapur yang sedang berkembang.",
    features: [
      "Maks 25 sekolah",
      "Semua fitur Starter",
      "Inventaris & restok otomatis",
      "Laporan PDF & analitik",
      "5 admin + unlimited operator",
      "Prioritas support",
    ],
    cta: "Mulai Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "999.000",
    period: "/bulan",
    desc: "Untuk operasi skala besar.",
    features: [
      "Unlimited sekolah",
      "Semua fitur Professional",
      "Multi-cabang dapur",
      "API akses & integrasi",
      "Dedicated account manager",
      "SLA 99.9% uptime",
    ],
    cta: "Mulai Trial",
    popular: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Paket Harga</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Pilih Paket yang Tepat</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Semua paket termasuk trial gratis 7 hari. Tanpa komitmen.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
                p.popular ? "border-primary shadow-lg scale-[1.02]" : ""
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground shadow">
                  Paling Populer
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Rp</span>
                  <span className="text-4xl font-extrabold text-foreground">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={p.popular ? "default" : "outline"}
                  size="lg"
                >
                  <Link to="/auth">{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────
const testimonials = [
  {
    name: "Ibu Sari",
    role: "Kepala Dapur, Dapur Sehat Jakarta",
    text: "Sebelum pakai Dapur MBG, semua dicatat manual. Sekarang distribusi ke 15 sekolah bisa dipantau real-time. Sangat membantu!",
    stars: 5,
  },
  {
    name: "Pak Budi",
    role: "Admin Operasional, Dapur Nusantara",
    text: "Fitur inventaris-nya luar biasa. Stok bahan selalu terpantau, tidak ada lagi bahan yang terbuang karena expired.",
    stars: 5,
  },
  {
    name: "Ibu Ratna",
    role: "Koordinator SPPG, Dapur Mandiri Surabaya",
    text: "Laporan harian bisa langsung di-download PDF. Waktu audit jadi lebih cepat dan rapi.",
    stars: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Testimoni</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Dipercaya Banyak Dapur</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────
const faqs = [
  {
    q: "Berapa lama trial gratis berlaku?",
    a: "Trial gratis berlaku selama 7 hari sejak pendaftaran. Anda mendapatkan akses penuh ke semua fitur sesuai paket yang dipilih. Setelah trial berakhir, layanan akan otomatis dinonaktifkan sampai Anda melakukan pembayaran.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami menerima pembayaran melalui Virtual Account (BCA, BNI, Mandiri, BRI, dll), QRIS, dan E-Wallet (OVO, Dana, ShopeePay) melalui payment gateway Duitku.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Tentu. Setiap organisasi memiliki data yang sepenuhnya terisolasi. Kami menggunakan Row Level Security di database dan enkripsi untuk menjaga keamanan data Anda.",
  },
  {
    q: "Bisakah saya upgrade atau downgrade paket?",
    a: "Ya, Anda bisa mengubah paket kapan saja melalui menu Pengaturan. Perubahan akan berlaku di periode pembayaran berikutnya.",
  },
  {
    q: "Apakah ada kontrak jangka panjang?",
    a: "Tidak. Semua paket berlangganan bulanan tanpa kontrak. Anda bisa berhenti kapan saja.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Pertanyaan Umum</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Dapur MBG</span>
        </div>
        <p className="text-sm text-muted-foreground">Sistem Pengelolaan SPPG — Makanan Bergizi Gratis</p>
        <p className="mt-4 text-xs text-muted-foreground">© 2026 Dapur MBG. Hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}

// ─── Navbar ────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Dapur MBG</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Harga</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Masuk</Link>
          </Button>
          <Button asChild size="sm" className="shadow-sm">
            <Link to="/auth">Daftar</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

// ─── Page ──────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
