import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
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

// ─── Animation Variants ───────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.1, ease: "easeOut" },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Hero ──────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 md:py-32">
      <motion.div
        className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto max-w-6xl px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/25"
        >
          <ChefHat className="h-10 w-10 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl"
        >
          Dapur <span className="text-primary">MBG</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Sistem Pengelolaan SPPG terlengkap. Kelola menu, inventaris, dan distribusi makanan bergizi ke seluruh sekolah — dalam satu platform.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button asChild size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/25">
            <Link to="/auth">
              Mulai Trial 7 Hari <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 text-base">
            <a href="#pricing">Lihat Paket Harga</a>
          </Button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-3 text-xs text-muted-foreground"
        >
          Tanpa kartu kredit • Gratis 7 hari • Batalkan kapan saja
        </motion.p>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────
const featureGroups = [
  {
    label: "Operasional Dapur",
    description: "Kelola seluruh aktivitas dapur dari satu tempat.",
    items: [
      { icon: UtensilsCrossed, title: "Manajemen Menu", desc: "Atur menu harian lengkap dengan info kalori, protein, karbohidrat, dan lemak per porsi." },
      { icon: Package, title: "Inventaris Bahan", desc: "Pantau stok bahan secara real-time, notifikasi stok minimum, dan riwayat restok." },
    ],
  },
  {
    label: "Distribusi & Sekolah",
    description: "Pantau pengiriman dan kelola data sekolah binaan.",
    items: [
      { icon: Truck, title: "Distribusi Makanan", desc: "Catat pengiriman ke setiap sekolah, pantau status distribusi, dan laporan harian." },
      { icon: School, title: "Data Sekolah", desc: "Kelola data sekolah binaan, jumlah siswa, kontak PIC, dan alamat lengkap." },
    ],
  },
  {
    label: "Analitik & Keamanan",
    description: "Insight berbasis data dengan keamanan tingkat enterprise.",
    items: [
      { icon: BarChart3, title: "Laporan & Analitik", desc: "Dashboard visual dengan grafik tren distribusi, ringkasan keuangan, dan laporan PDF." },
      { icon: ShieldCheck, title: "Multi-Tenant & Aman", desc: "Setiap organisasi terisolasi. Kelola tim dengan peran admin & operator secara aman." },
    ],
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-primary">Fitur Unggulan</motion.p>
          <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Semua yang Anda Butuhkan</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Platform lengkap untuk operasional dapur program makanan bergizi gratis.
          </motion.p>
        </motion.div>
        <div className="space-y-12">
          {featureGroups.map((group, gi) => (
            <motion.div
              key={group.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <div className="text-center">
                  <h3 className="text-base font-bold text-foreground">{group.label}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <div className="h-px flex-1 bg-border" />
              </motion.div>
              <div className="grid gap-6 md:grid-cols-2">
                {group.items.map((f, fi) => (
                  <motion.div key={f.title} variants={scaleIn} custom={fi}>
                    <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full">
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
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────
const plans = [
  {
    name: "Starter", price: "199.000", period: "/bulan", desc: "Untuk dapur kecil yang baru memulai.",
    features: ["Maks 5 sekolah", "Manajemen menu harian", "Distribusi & laporan dasar", "1 admin + 2 operator", "Email support"],
    cta: "Mulai Trial", popular: false,
  },
  {
    name: "Professional", price: "499.000", period: "/bulan", desc: "Untuk dapur yang sedang berkembang.",
    features: ["Maks 25 sekolah", "Semua fitur Starter", "Inventaris & restok otomatis", "Laporan PDF & analitik", "5 admin + unlimited operator", "Prioritas support"],
    cta: "Mulai Trial", popular: true,
  },
  {
    name: "Enterprise", price: "999.000", period: "/bulan", desc: "Untuk operasi skala besar.",
    features: ["Unlimited sekolah", "Semua fitur Professional", "Multi-cabang dapur", "API akses & integrasi", "Dedicated account manager", "SLA 99.9% uptime"],
    cta: "Mulai Trial", popular: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-primary">Paket Harga</motion.p>
          <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Pilih Paket yang Tepat</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Semua paket termasuk trial gratis 7 hari. Tanpa komitmen.
          </motion.p>
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {plans.map((p, i) => (
            <motion.div key={p.name} variants={scaleIn} custom={i}>
              <Card
                className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-lg ${
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
                  <Button asChild className="w-full" variant={p.popular ? "default" : "outline"} size="lg">
                    <Link to="/auth">{p.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────
const testimonials = [
  { name: "Ibu Sari", role: "Kepala Dapur, Dapur Sehat Jakarta", text: "Sebelum pakai Dapur MBG, semua dicatat manual. Sekarang distribusi ke 15 sekolah bisa dipantau real-time. Sangat membantu!", stars: 5 },
  { name: "Pak Budi", role: "Admin Operasional, Dapur Nusantara", text: "Fitur inventaris-nya luar biasa. Stok bahan selalu terpantau, tidak ada lagi bahan yang terbuang karena expired.", stars: 5 },
  { name: "Ibu Ratna", role: "Koordinator SPPG, Dapur Mandiri Surabaya", text: "Laporan harian bisa langsung di-download PDF. Waktu audit jadi lebih cepat dan rapi.", stars: 5 },
];

function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-primary">Testimoni</motion.p>
          <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Dipercaya Banyak Dapur</motion.h2>
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {testimonials.map((t, i) => (
            <motion.div key={t.name} variants={fadeUp} custom={i}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed italic">"{t.text}"</p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────
const faqs = [
  { q: "Berapa lama trial gratis berlaku?", a: "Trial gratis berlaku selama 7 hari sejak pendaftaran. Anda mendapatkan akses penuh ke semua fitur sesuai paket yang dipilih. Setelah trial berakhir, layanan akan otomatis dinonaktifkan sampai Anda melakukan pembayaran." },
  { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima pembayaran melalui Virtual Account (BCA, BNI, Mandiri, BRI, dll), QRIS, dan E-Wallet (OVO, Dana, ShopeePay) melalui payment gateway Duitku." },
  { q: "Apakah data saya aman?", a: "Tentu. Setiap organisasi memiliki data yang sepenuhnya terisolasi. Kami menggunakan Row Level Security di database dan enkripsi untuk menjaga keamanan data Anda." },
  { q: "Bisakah saya upgrade atau downgrade paket?", a: "Ya, Anda bisa mengubah paket kapan saja melalui menu Pengaturan. Perubahan akan berlaku di periode pembayaran berikutnya." },
  { q: "Apakah ada kontrak jangka panjang?", a: "Tidak. Semua paket berlangganan bulanan tanpa kontrak. Anda bisa berhenti kapan saja." },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Pertanyaan Umum</motion.h2>
        </motion.div>
        <motion.div
          className="space-y-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
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
              <motion.div
                initial={false}
                animate={openIndex === i ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────
function Footer() {
  return (
    <motion.footer
      className="border-t border-border bg-card py-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
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
    </motion.footer>
  );
}

// ─── Navbar ────────────────────────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
    >
      <div className="container mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
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
    </motion.nav>
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
