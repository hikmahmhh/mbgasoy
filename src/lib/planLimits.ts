// Simplified - no plan tiers, all features unlimited
export interface PlanLimits {
  maxSchools: number;
  maxMembers: number;
  maxMenuItems: number;
  maxInventoryItems: number;
  exportPDF: boolean;
  exportCSV: boolean;
  label: string;
}

// Single unlimited plan
const UNLIMITED: PlanLimits = {
  maxSchools: Infinity,
  maxMembers: Infinity,
  maxMenuItems: Infinity,
  maxInventoryItems: Infinity,
  exportPDF: true,
  exportCSV: true,
  label: "Aktif",
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: UNLIMITED,
  basic: UNLIMITED,
  pro: UNLIMITED,
};

export function getPlanLimits(_plan: string | undefined | null): PlanLimits {
  return UNLIMITED;
}

export const WA_PAYMENT_NUMBER = "+62 881-0264-54972";
export const WA_PAYMENT_LINK = "https://wa.me/6288102645497?text=Halo%20Tim%20Pytagotech%2C%20saya%20ingin%20melakukan%20pembayaran%20langganan.";
