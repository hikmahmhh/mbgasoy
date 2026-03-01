import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";

export function useActivityLog() {
  const { currentOrgId } = useOrg();
  const { user } = useAuth();

  const log = useCallback(
    async (action: string, entityType: string, entityId?: string, details?: Record<string, any>) => {
      if (!currentOrgId || !user) return;
      await supabase.from("activity_logs").insert({
        org_id: currentOrgId,
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId || undefined,
        details: details || {},
      });
    },
    [currentOrgId, user]
  );

  return { log };
}
