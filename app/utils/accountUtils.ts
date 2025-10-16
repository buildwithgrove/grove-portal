import { Account, AccountUser, PortalApp } from "~/models/portal/sdk"
import type { PortalAccount, PortalAccountRbac, PortalApplicationSummary, PortalPlan } from "~/models/portal-db/types"
import { DEFAULT_APPMOJI } from "~/routes/account_.$accountId.create/components/AppmojiPicker"

export const getAccountAcceptedValue = (
  portalAppUsers: AccountUser[],
  userId: string,
) => {
  const user = portalAppUsers.find((user) => user.id === userId)
  return user?.accepted ?? false
}

export const getUserAccountRole = (
  users: Pick<AccountUser, "id" | "roleName">[],
  userId: string,
) => {
  const user = users.find((user) => user.id === userId)
  return user?.roleName ?? null
}

export const getUserAccountRoleFromRbac = (
  rbacRows: PortalAccountRbac[],
  userId: string,
): string | null => {
  const userRbac = rbacRows.find((row) => row.portal_user_id === userId)
  return userRbac?.role_name ?? null
}

// Overload signatures for backward compatibility
export function isAccountWithinAppLimit(
  account: PortalAccount,
  applications: PortalApplicationSummary[],
  plan: PortalPlan
): boolean
export function isAccountWithinAppLimit(
  account: Account | PortalAccount,
  applications?: PortalApplicationSummary[],
  plan?: PortalPlan
): boolean {
  // Legacy Account type (GraphQL)
  if ('portalApps' in account && 'plan' in account) {
    const { portalApps, plan } = account
    if (plan.appLimit === 0) {
      return true
    }
    return !portalApps || portalApps.length < plan.appLimit
  }

  // New PortalAccount type (PostgREST)
  if (applications !== undefined && plan !== undefined) {
    const appLimit = plan.plan_application_limit ?? 0
    if (appLimit === 0) {
      return true
    }
    return applications.length < appLimit
  }

  // Fallback - shouldn't reach here with correct typing
  return false
}

export const getAppNameWithEmoji = (app: PortalApp) =>
  `${String.fromCodePoint(
    parseInt(app?.appEmoji ? app.appEmoji : DEFAULT_APPMOJI, 16),
  )} \u00A0 ${app?.name}`
