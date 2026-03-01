import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface OrgMember {
  org_id: string;
  role: string;
  organizations: {
    id: string;
    name: string;
    slug: string;
    status: string;
    plan: string;
  };
}

interface OrgContextType {
  currentOrgId: string | null;
  currentOrg: OrgMember["organizations"] | null;
  orgRole: string | null;
  orgs: OrgMember[];
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  switchOrg: (orgId: string) => Promise<void>;
  loading: boolean;
}

const OrgContext = createContext<OrgContextType>({
  currentOrgId: null,
  currentOrg: null,
  orgRole: null,
  orgs: [],
  isSuperAdmin: false,
  isOrgAdmin: false,
  switchOrg: async () => {},
  loading: true,
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  // Check if super admin
  const { data: isSuperAdmin = false } = useQuery({
    queryKey: ["is-super-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "super_admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Fetch user's org memberships
  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ["my-orgs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_members")
        .select("org_id, role, organizations(id, name, slug, status, plan)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []) as unknown as OrgMember[];
    },
    enabled: !!user,
  });

  // Fetch current_org_id from profile
  const { data: profileOrgId } = useQuery({
    queryKey: ["profile-org-id", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("current_org_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data?.current_org_id || null;
    },
    enabled: !!user,
  });

  // Set current org on load
  useEffect(() => {
    if (orgs.length > 0 && !currentOrgId) {
      const savedOrg = profileOrgId;
      const validOrg = orgs.find((o) => o.org_id === savedOrg);
      setCurrentOrgId(validOrg ? savedOrg : orgs[0].org_id);
    }
  }, [orgs, profileOrgId, currentOrgId]);

  const switchOrg = async (orgId: string) => {
    setCurrentOrgId(orgId);
    if (user) {
      await supabase
        .from("profiles")
        .update({ current_org_id: orgId })
        .eq("user_id", user.id);
    }
    // Invalidate all org-scoped queries
    qc.invalidateQueries();
  };

  const currentMembership = orgs.find((o) => o.org_id === currentOrgId);
  const currentOrg = currentMembership?.organizations || null;
  const orgRole = currentMembership?.role || null;

  return (
    <OrgContext.Provider
      value={{
        currentOrgId,
        currentOrg,
        orgRole,
        orgs,
        isSuperAdmin,
        isOrgAdmin: orgRole === "admin",
        switchOrg,
        loading: isLoading,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);
