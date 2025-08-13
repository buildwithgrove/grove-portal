import { Stack, Button } from "@mantine/core"
import { json, LoaderFunction } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { ArrowLeft } from "lucide-react"
import React, { useEffect } from "react"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import LinkTabs from "~/components/LinkTabs"
import RootAppShell from "~/components/RootAppShell/RootAppShell"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account, RoleName, SortOrder, User } from "~/models/portal/sdk"
import { ColorScheme } from "~/root"
import { getUserAccountRole } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { getColorSchemeSession } from "~/utils/colorScheme.server"
import { requireUser } from "~/utils/user.server"

export type UserAccountLoaderData = {
  accounts: Account[]
  pendingAccounts: Account[]
  user: User
  primaryAccount?: Account
  primaryUserRole?: RoleName
  colorScheme: ColorScheme
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })

  // Get color scheme from session to ensure it's preserved on user routes
  const themeSession = await getColorSchemeSession(request)
  const systemPreferredColorScheme = request.headers.get(
    "Sec-CH-Prefers-Color-Scheme",
  ) as ColorScheme
  const sessionColorScheme = themeSession.getColorScheme()
  const colorScheme = sessionColorScheme || systemPreferredColorScheme || "dark"

  try {
    const accounts = await portal.getUserAccounts({
      accepted: true,
      sortOrder: SortOrder.Asc,
    })

    const userPendingAccounts = await portal.getUserAccounts({
      accepted: false,
      sortOrder: SortOrder.Asc,
    })

    const accountsList = accounts.getUserAccounts as Account[]
    // Find the primary account (first Owner account, or first account if no owner)
    const primaryAccount =
      accountsList.find((account) => {
        const userRole = getUserAccountRole(account.users, user.user.portalUserID)
        return userRole === RoleName.Owner
      }) || accountsList[0]

    const primaryUserRole = primaryAccount
      ? (getUserAccountRole(primaryAccount.users, user.user.portalUserID) as RoleName)
      : undefined

    return json<UserAccountLoaderData>({
      accounts: accountsList,
      pendingAccounts: userPendingAccounts.getUserAccounts as Account[],
      user: user.user,
      primaryAccount,
      primaryUserRole,
      colorScheme,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function UserAccount() {
  const {
    accounts,
    user,
    pendingAccounts,
    primaryAccount,
    primaryUserRole,
    colorScheme,
  } = useLoaderData() as UserAccountLoaderData

  // Ensure the document color scheme attribute matches the server-provided color scheme
  useEffect(() => {
    if (
      document.documentElement.getAttribute("data-mantine-color-scheme") !== colorScheme
    ) {
      document.documentElement.setAttribute("data-mantine-color-scheme", colorScheme)
    }
  }, [colorScheme])

  const routes = [
    {
      to: "",
      label: "Profile",
      end: true,
    },
    {
      to: "accounts",
      label: "Accounts",
    },
  ]

  return (
    <RootAppShell
      accounts={accounts}
      user={user}
      account={primaryAccount}
      userRole={primaryUserRole}
    >
      <Button
        color="gray"
        component={NavLink}
        leftSection={<ArrowLeft size={18} />}
        mb="xl"
        ml={-15}
        size="compact-sm"
        to="/account"
        variant="subtle"
      >
        Back
      </Button>
      <Stack gap="xl">
        <LinkTabs routes={routes} />
      </Stack>
      <Outlet context={{ accounts, user, pendingAccounts }} />
    </RootAppShell>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
