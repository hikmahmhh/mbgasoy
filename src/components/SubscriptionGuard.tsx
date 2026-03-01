import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { Link } from "react-router-dom";
import { AlertTriangle, CreditCard } from "lucide-react";

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { currentOrgId, isSuperAdmin } = useOrg();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["sub-guard", currentOrgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, trial_ends_at, current_period_end")
        .eq("org_id", currentOrgId!)
        .maybeSingle();
      return data;
    },
    enabled: !!currentOrgId,
  });

  if (isLoading) return null;

  // Super admins bypass
  if (isSuperAdmin) return <>{children}</>;

  // Check if expired
  const isExpired =
    subscription?.status === "expired" ||
    subscription?.status === "cancelled" ||
    (subscription?.status === "trial" &&
      subscription?.trial_ends_at &&
      new Date(subscription.trial_ends_at) < new Date());

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Akses Terbatas</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Masa trial atau langganan Anda telah berakhir. Upgrade paket untuk melanjutkan menggunakan semua fitur.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Kelola Langganan
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
