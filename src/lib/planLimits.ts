// Plan-based feature limits configuration
export interface PlanLimits {
  maxSchools: number;
  maxMembers: number;
  maxMenuItems: number;
  maxInventoryItems: number;
  exportPDF: boolean;
  exportCSV: boolean;
  label: string;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    maxSchools: 5,
    maxMembers: 3,
    maxMenuItems: 20,
    maxInventoryItems: 30,
    exportPDF: true,
    exportCSV: false,
    label: "Starter",
  },
  basic: {
    maxSchools: 20,
    maxMembers: 10,
    maxMenuItems: 50,
    maxInventoryItems: 100,
    exportPDF: true,
    exportCSV: true,
    label: "Basic",
  },
  pro: {
    maxSchools: Infinity,
    maxMembers: Infinity,
    maxMenuItems: Infinity,
    maxInventoryItems: Infinity,
    exportPDF: true,
    exportCSV: true,
    label: "Pro",
  },
};

export function getPlanLimits(plan: string | undefined | null): PlanLimits {
  return PLAN_LIMITS[plan || "starter"] || PLAN_LIMITS.starter;
}
