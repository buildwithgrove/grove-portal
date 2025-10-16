import { RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser, PortalApplicationSummary } from "~/models/portal-db/types"
import { LoaderFunction, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { redirectToUserAccount, requireUser } from "~/utils/user.server"

import { ColorScheme } from "~/root"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import RootAppShell from "~/components/RootAppShell/RootAppShell"
import { getColorSchemeSession } from "~/utils/colorScheme.server"
import { getUserAccountRoleFromRbac } from "~/utils/accountUtils"
import { initPortalDbClient } from "~/models/portal-db/portal-db.server"
import type { ServiceWithEndpoints, PortalAccountWithRelations } from "~/models/portal-db/types"
import { getUserAccounts } from "~/models/portal-db/queries.server"
import invariant from "tiny-invariant"
import { useEffect } from "react"

// TODO_IN_THIS_PR(@commoddity): move this function to queries.server.ts
/**
 * Fetches all active services with their associated endpoints from the portal database.
 * 
 * This function:
 *    1. Fetches all active services from the /services endpoint
 *    2. Fetches all service endpoints from the /service_endpoints endpoint
 *    3. Joins services with their endpoints and adds computed properties
 */
async function fetchServicesWithEndpoints(token: string): Promise<ServiceWithEndpoints[]> {
  const portalDb = initPortalDbClient({ token })

  // Fetch services and endpoints in parallel to avoid connection reuse issues
  const [servicesResult, endpointsResult] = await Promise.all([
    portalDb.GET("/services", {
      params: {
        query: {
          active: "eq.true",
          order: "service_name.asc",
        },
      },
    }),
    portalDb.GET("/service_endpoints"),
  ])

  const { data: services, error: servicesError } = servicesResult
  const { data: endpoints, error: endpointsError } = endpointsResult

  if (servicesError || !services) {
    throw new Response("Failed to fetch services from portal database", { status: 500 })
  }

  if (endpointsError) {
    throw new Response("Failed to fetch service endpoints from portal database", { status: 500 })
  }

  // Filter out specific services
  // BE2A is a legacy/deprecated service
  // Services with "wss" in their ID are websocket-only variants that are handled separately
  // TODO_IN_THIS_PR(@commoddity): CLARIFY why we need to do this.
  const filteredServices = services.filter(
    (service) => service.service_id !== "BE2A" && !service.service_id?.includes("wss")
  )

  // Join services with their endpoints and compute metadata
  const servicesWithEndpoints: ServiceWithEndpoints[] = filteredServices.map(service => {
    const serviceEndpoints = endpoints?.filter(ep => ep.service_id === service.service_id) ?? []

    return {
      ...service,
      endpoints: serviceEndpoints,
      // Determine if this service has WebSocket support by checking endpoint types
      hasWebsocket: serviceEndpoints.some(ep => ep.endpoint_type === "WSS"),
    }
  })

  return servicesWithEndpoints
}

// Removed: fetchAccountData function is replaced by getUserAccounts from queries.server.ts

export type AccountIdLoaderData = {
  accountData: PortalAccountWithRelations
  allUserAccounts: PortalAccountWithRelations[]
  services: ServiceWithEndpoints[]
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
  userRole: RoleName
  colorScheme: ColorScheme
  // Outlet context fields for child routes
  portalAccount: PortalAccountWithRelations['account']
  portalApplications: PortalAccountWithRelations['applications']
  accountRbac: PortalAccountWithRelations['rbac']
  portalAccounts: PortalAccountWithRelations['account'][]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)

  // Get color scheme from session to ensure it's preserved on account routes
  const themeSession = await getColorSchemeSession(request)
  const systemPreferredColorScheme = request.headers.get(
    "Sec-CH-Prefers-Color-Scheme",
  ) as ColorScheme
  const sessionColorScheme = themeSession.getColorScheme()
  const colorScheme = sessionColorScheme || systemPreferredColorScheme || "dark"

  const { accountId } = params
  invariant(accountId, "AccountId must be set")

  try {
    // Fetch services, specific account data, and all user accounts in parallel
    const [services, [accountData], allUserAccounts] = await Promise.all([
      fetchServicesWithEndpoints(user.accessToken),
      getUserAccounts(user.accessToken, accountId), // Returns array with single account
      getUserAccounts(user.accessToken), // Returns all user's accounts
    ])

    // Get user's role for this specific account from RBAC data
    const userRole = getUserAccountRoleFromRbac(
      accountData.rbac,
      user.user.portal_user_id,
    ) as RoleName

    return json<AccountIdLoaderData>({
      accountData,
      allUserAccounts,
      user: user.user,
      services,
      userRole,
      colorScheme,
      // Outlet context fields
      portalAccount: accountData.account,
      portalApplications: accountData.applications,
      accountRbac: accountData.rbac,
      portalAccounts: allUserAccounts.map(a => a.account),
    })
  } catch (error) {
    /**
     * Handle when an invalid account is manually entered & when the user leaves the account
     */
    return redirectToUserAccount(user)
  }
}

export default function AccountId() {
  const { accountData, allUserAccounts, services, user, userRole, colorScheme } =
    useLoaderData<AccountIdLoaderData>()

  // Ensure the document color scheme attribute matches the server-provided color scheme
  useEffect(() => {
    if (
      document.documentElement.getAttribute("data-mantine-color-scheme") !== colorScheme
    ) {
      document.documentElement.setAttribute("data-mantine-color-scheme", colorScheme)
    }
  }, [colorScheme])

  return (
    <RootAppShell
      account={accountData.account}
      accounts={allUserAccounts.map(a => a.account)}
      apps={accountData.applications}
      user={user}
      userRole={userRole}
    >
      <Outlet
        context={{
          portalAccount: accountData.account,
          portalApplications: accountData.applications,
          accountRbac: accountData.rbac,
          portalAccounts: allUserAccounts.map(a => a.account),
          services,
          user,
          userRole
        }}
      />
    </RootAppShell>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
