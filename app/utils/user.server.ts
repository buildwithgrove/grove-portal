import { redirect } from "@remix-run/node"
import jwt_decode from "jwt-decode"
import { authenticator, AuthUser } from "./auth.server"
import { getUserAccounts } from "~/models/portal-db/queries.server"
import { RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"

export enum Permissions {
  PayPlanTypes = "write:pay_plan_types",
  AppsUnlimited = "create:apps_unlimited",
}

export const requireUser = async (request: Request, defaultRedirect = "/") => {
  let user = await authenticator.isAuthenticated(request)

  if (!user) {
    throw redirect("/api/auth/auth0")
  }

  if (!user.user) {
    throw await authenticator.logout(request, { redirectTo: "/api/auth/auth0" })
  }

  if (!user.user.email_verified) {
    throw await authenticator.logout(request, { redirectTo: "/email-verification" })
  }

  if (!user.user.portal_user_id) {
    user = await authenticator.authenticate("auth0", request)
  }

  const decode = jwt_decode<{
    exp: number
  }>(user.accessToken)

  if (Date.now() >= decode.exp * 1000) {
    throw await authenticator.logout(request, { redirectTo: "/api/auth/auth0" })
  }

  return user
}

export const requireUserProfile = async (
  request: Request,
  defaultRedirect = "/",
): Promise<AuthPortalUser> => {
  const user = await requireUser(request, defaultRedirect)
  return user.user
}

export const requireAdmin = async (
  request: Request,
  defaultRedirect = "/",
): Promise<AuthPortalUser> => {
  const user = await authenticator.isAuthenticated(request)

  if (!user) {
    throw redirect(defaultRedirect)
  }

  const permissions = getUserPermissions(user.accessToken)

  if (!isAdmin(permissions)) {
    throw redirect(defaultRedirect)
  }
  return user.user
}

export const isAdmin = (permissions: string[]) => {
  let isAdmin = false
  const adminPermissions = [Permissions.PayPlanTypes]

  adminPermissions.forEach((adminPermission) => {
    isAdmin = permissions.includes(adminPermission)
  })

  return isAdmin
}

export const getUserPermissions = (accessToken: string) => {
  const decode = jwt_decode<{
    exp: number
    permissions: string[]
  }>(accessToken)

  return decode.permissions
}

export const getUserId = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request)
  if (!user || !user.user.auth0ID) return undefined
  return getPoktId(user.user.auth0ID)
}

export const getPoktId = (id: string) => {
  return id.split("|")[1]
}

export const getUserProfile = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request)
  return user?.user
}

/**
 * Redirects user to their primary account (Owner account if available, otherwise first account).
 * 
 * This function:
 *    1. Fetches all user's accepted accounts using getUserAccounts
 *    2. Determines user roles from RBAC data
 *    3. Prioritizes Owner accounts
 *    4. Redirects to the selected account
 */
export const redirectToUserAccount = async (user: AuthUser) => {
  const allAccountsData = await getUserAccounts(user.accessToken)

  if (allAccountsData.length === 0) {
    throw new Response("No accounts found", { status: 404 })
  }

  // Filter to only accepted accounts
  const acceptedAccounts = allAccountsData.filter((accountData) => {
    const rbac = accountData.rbac.find((r) => r.portal_user_id === user.user.portal_user_id)
    return rbac?.user_joined_account === true
  })

  let selectedAccountData = acceptedAccounts[0]

  // Find Owner account if available
  const ownerAccountData = acceptedAccounts.find((accountData) => {
    const rbac = accountData.rbac.find((r) => r.portal_user_id === user.user.portal_user_id)
    return rbac?.role_name === RoleName.Owner
  })

  if (ownerAccountData) {
    selectedAccountData = ownerAccountData
  }

  return redirect(`/account/${selectedAccountData.account.portal_account_id}`)
}
