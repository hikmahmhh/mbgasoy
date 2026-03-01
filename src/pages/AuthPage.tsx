import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (forgotMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Link reset password telah dikirim ke email Anda!");
        setForgotMode(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Berhasil masuk!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Akun berhasil dibuat! Silakan cek email untuk verifikasi.");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Dapur MBG</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sistem Pengelolaan SPPG</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            {forgotMode ? "Reset Password" : isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required={!isLogin}
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dapur.mbg"
                  required
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {!forgotMode && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && !forgotMode && (
              <div className="text-right">
                <button type="button" onClick={() => setForgotMode(true)} className="text-xs text-primary hover:underline">
                  Lupa password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : forgotMode ? "Kirim Link Reset" : isLogin ? "Masuk" : "Daftar"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
