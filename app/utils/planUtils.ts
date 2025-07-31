import { PayPlanType } from "~/models/portal/sdk"
export const FREE_TIER_MONTHLY_RELAY_LIMIT = 150000

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
    case PayPlanType.Enterprise: {
      return "Enterprise"
    }
    case PayPlanType.PlanUnlimited: {
      return "Unlimited"
    }
    case PayPlanType.PlanFree: {
      return "Free"
    }
    default: {
      return "Legacy"
    }
  }
}
