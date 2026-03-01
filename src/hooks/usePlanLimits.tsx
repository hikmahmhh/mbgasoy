import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { getPlanLimits, type PlanLimits } from "@/lib/planLimits";

interface UsePlanLimitsReturn {
  limits: PlanLimits;
  counts: {
    schools: number;
    members: number;
    menuItems: number;
    inventoryItems: number;
  };
  canAdd: (entity: "schools" | "members" | "menuItems" | "inventoryItems") => boolean;
  remaining: (entity: "schools" | "members" | "menuItems" | "inventoryItems") => number;
  isLoading: boolean;
}

export function usePlanLimits(): UsePlanLimitsReturn {
  const { currentOrgId, currentOrg, isSuperAdmin } = useOrg();
  const limits = getPlanLimits(currentOrg?.plan);

  const { data: counts = { schools: 0, members: 0, menuItems: 0, inventoryItems: 0 }, isLoading } = useQuery({
    queryKey: ["plan-counts", currentOrgId],
    queryFn: async () => {
      const [schoolsRes, membersRes, menuRes, invRes] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact", head: true }).eq("org_id", currentOrgId!),
        supabase.from("org_members").select("id", { count: "exact", head: true }).eq("org_id", currentOrgId!),
        supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("org_id", currentOrgId!),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }).eq("org_id", currentOrgId!),
      ]);
      return {
        schools: schoolsRes.count ?? 0,
        members: membersRes.count ?? 0,
        menuItems: menuRes.count ?? 0,
        inventoryItems: invRes.count ?? 0,
      };
    },
    enabled: !!currentOrgId,
  });

  const maxMap = {
    schools: limits.maxSchools,
    members: limits.maxMembers,
    menuItems: limits.maxMenuItems,
    inventoryItems: limits.maxInventoryItems,
  };

  const canAdd = (entity: keyof typeof maxMap) => {
    if (isSuperAdmin) return true;
    return counts[entity] < maxMap[entity];
  };

  const remaining = (entity: keyof typeof maxMap) => {
    if (isSuperAdmin) return Infinity;
    return Math.max(0, maxMap[entity] - counts[entity]);
  };

  return { limits, counts, canAdd, remaining, isLoading };
}
