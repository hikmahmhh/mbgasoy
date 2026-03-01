import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "login">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setStatus("login");
      setMessage("Silakan login terlebih dahulu untuk menerima undangan.");
      return;
    }
    if (!token) {
      setStatus("error");
      setMessage("Token undangan tidak valid.");
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.rpc("accept_invitation", { _token: token });
        if (error) throw error;
        const result = data as any;
        if (result?.error) {
          setStatus("error");
          setMessage(result.error);
        } else {
          setStatus("success");
          setMessage(result?.message || "Berhasil bergabung ke organisasi!");
        }
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Terjadi kesalahan.");
      }
    })();
  }, [session, authLoading, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Memproses undangan...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Berhasil!</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button onClick={() => navigate("/dashboard")}>Buka Dashboard</Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Gagal</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Kembali</Button>
          </>
        )}
        {status === "login" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Login Diperlukan</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button onClick={() => navigate(`/auth?redirect=/accept-invite?token=${token}`)}>Login</Button>
          </>
        )}
      </div>
    </div>
  );
}
