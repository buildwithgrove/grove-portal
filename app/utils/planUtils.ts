import { PayPlanType } from "~/models/portal-db/types"

// TODO: Implement populating FREE_TIER_MONTHLY_RELAY_LIMIT from Portal DB
// Currently hardcoded but should be configurable via database
export const FREE_TIER_MONTHLY_RELAY_LIMIT = 1000000

/**
 * Converts PostgREST string plan type to PayPlanType enum
 */
export function toPayPlanType(planType: string): PayPlanType {
  switch (planType) {
    case "ENTERPRISE":
      return PayPlanType.Enterprise
    case "PLAN_UNLIMITED":
      return PayPlanType.PlanUnlimited
    case "PLAN_FREE":
      return PayPlanType.PlanFree
    default:
      return PayPlanType.PlanFree // Default to free for unknown types
  }
}

export function isEnterprisePlan(planType: PayPlanType) {
  return planType === PayPlanType.Enterprise
}

export function isUnlimitedPlan(planType: PayPlanType) {
  return planType === PayPlanType.PlanUnlimited
}

export function isFree(planType: PayPlanType) {
  return planType === PayPlanType.PlanFree
}

export const getPlanName = (planType: PayPlanType) => {
  switch (planType) {
    case PayPlanType.Enterprise:
      return "Enterprise"
    case PayPlanType.PlanUnlimited:
      return "Unlimited"
    case PayPlanType.PlanFree:
      return "Free"
    default:
      return "Legacy"
  }
}
