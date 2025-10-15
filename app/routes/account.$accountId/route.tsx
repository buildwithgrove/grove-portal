import { Account, RoleName, User } from "~/models/portal/sdk"
import { LoaderFunction, json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { redirectToUserAccount, requireUser } from "~/utils/user.server"

import { ColorScheme } from "~/root"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import RootAppShell from "~/components/RootAppShell/RootAppShell"
import { getColorSchemeSession } from "~/utils/colorScheme.server"
import { getErrorMessage } from "~/utils/catchError"
import { getUserAccountRole } from "~/utils/accountUtils"
import { initPortalClient } from "~/models/portal/portal.server"
import { initPortalDbClient } from "~/models/portal-db/portal-db.server"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import invariant from "tiny-invariant"
import { useEffect } from "react"

export type AccountIdLoaderData = {
  account: Account
  accounts: Account[]
  services: ServiceWithEndpoints[]
  user: User
  userRole: RoleName
  colorScheme: ColorScheme
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

  const portal = initPortalClient({ token: user.accessToken })
  const portalDb = initPortalDbClient({ token: user.accessToken })
  const { accountId } = params
  invariant(accountId, "AccountId must be set")
  let userAccounts

  try {
    const account = await portal.getUserAccount({ accountID: accountId, accepted: true })
    userAccounts = await portal.getUserAccounts({ accepted: true })

    const userRole = getUserAccountRole(
      account.getUserAccount.users,
      user.user.portalUserID,
    ) as RoleName

    // Step 1: Fetch active services
    const { data: services, error: servicesError } = await portalDb.GET("/services", {
      params: {
        query: {
          active: "eq.true",
          order: "service_name.asc",
        },
      },
    })

    if (servicesError) {
      throw new Response("Failed to fetch services", { status: 500 })
    }

    // Filter out unwanted services
    // TODO_IN_THIS_PR(@commoddity): CALRIFY: Why do we need to do this?
    const filteredServices = services?.filter(
      (service) => service.service_id !== "BE2A" && !service.service_id?.includes("wss")
    ) ?? []

    // Step 2: Fetch endpoints for these services
    const serviceIds = filteredServices.map(s => s.service_id).join(",")
    const { data: endpoints, error: endpointsError } = await portalDb.GET("/service_endpoints", {
      params: {
        query: {
          service_id: `in.(${serviceIds})`,
        },
      },
    })

    if (endpointsError) {
      throw new Response("Failed to fetch service endpoints", { status: 500 })
    }

    // Step 3: Join services with their endpoints
    const servicesWithEndpoints: ServiceWithEndpoints[] = filteredServices.map(service => {
      const serviceEndpoints = endpoints?.filter(ep => ep.service_id === service.service_id) ?? []
      return {
        ...service,
        endpoints: serviceEndpoints,
        hasWebsocket: serviceEndpoints.some(ep => ep.endpoint_type === "WSS"),
      }
    })

    return json<AccountIdLoaderData>({
      account: account.getUserAccount as Account,
      accounts: userAccounts.getUserAccounts as Account[],
      user: user.user,
      services: servicesWithEndpoints,
      userRole,
      colorScheme,
    })
  } catch (error) {
    /**
     * Handle when an invalid account is manually entered & when the user leaves the account
     */

    const ownerAccount = userAccounts?.getUserAccounts?.find(
      (account) =>
        account?.users?.find((u) => u.id === user.user.portalUserID)?.roleName ===
        RoleName.Owner,
    )

    if (accountId !== ownerAccount?.id) {
      return redirectToUserAccount(user)
    } else {
      throw new Response(getErrorMessage(error), {
        status: 500,
      })
    }
  }
}

export default function AccountId() {
  const { account, accounts, services, user, userRole, colorScheme } =
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
    <RootAppShell account={account} accounts={accounts} user={user} userRole={userRole}>
      <Outlet context={{ account, accounts, services, user, userRole }} />
    </RootAppShell>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
