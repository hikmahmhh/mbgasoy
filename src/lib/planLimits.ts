// Plan-based feature limits configuration
export interface PlanLimits {
  maxSchools: number;
  maxMembers: number;
  maxMenuItems: number;
  maxInventoryItems: number;
  exportPDF: boolean;
  exportCSV: boolean;
  label: string;
  price: number; // harga per bulan dalam Rupiah
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    maxSchools: 10,
    maxMembers: 5,
    maxMenuItems: 50,
    maxInventoryItems: 50,
    exportPDF: true,
    exportCSV: false,
    label: "Starter",
    price: 30000,
  },
  basic: {
    maxSchools: 20,
    maxMembers: 10,
    maxMenuItems: 100,
    maxInventoryItems: 150,
    exportPDF: true,
    exportCSV: true,
    label: "Basic",
    price: 70000,
  },
  pro: {
    maxSchools: Infinity,
    maxMembers: Infinity,
    maxMenuItems: Infinity,
    maxInventoryItems: Infinity,
    exportPDF: true,
    exportCSV: true,
    label: "Pro",
    price: 150000,
  },
};

export function getPlanLimits(plan: string | undefined | null): PlanLimits {
  return PLAN_LIMITS[plan || "starter"] || PLAN_LIMITS.starter;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}
