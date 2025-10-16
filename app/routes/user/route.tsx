import { RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser, PortalAccount } from "~/models/portal-db/types"
import { Button, Stack } from "@mantine/core"
import { LoaderFunction, json } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"

import { ArrowLeft } from "lucide-react"
import { ColorScheme } from "~/root"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import LinkTabs from "~/components/LinkTabs"
import RootAppShell from "~/components/RootAppShell/RootAppShell"
import { getColorSchemeSession } from "~/utils/colorScheme.server"
import { getErrorMessage } from "~/utils/catchError"
import { getUserAccountRoleFromRbac } from "~/utils/accountUtils"
import { getUserAccounts } from "~/models/portal-db/queries.server"
import { requireUser } from "~/utils/user.server"
import { useEffect } from "react"

export type UserAccountLoaderData = {
  accounts: PortalAccount[]
  pendingAccounts: PortalAccount[]
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
  primaryAccount?: PortalAccount
  primaryUserRole?: RoleName
  colorScheme: ColorScheme
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)

  // Get color scheme from session to ensure it's preserved on user routes
  const themeSession = await getColorSchemeSession(request)
  const systemPreferredColorScheme = request.headers.get(
    "Sec-CH-Prefers-Color-Scheme",
  ) as ColorScheme
  const sessionColorScheme = themeSession.getColorScheme()
  const colorScheme = sessionColorScheme || systemPreferredColorScheme || "dark"

  try {
    // Fetch all user's accounts with relations using getUserAccounts
    const allAccountsData = await getUserAccounts(user.accessToken)

    // Separate accounts based on user_joined_account status
    const acceptedAccountsData = allAccountsData.filter((accountData) => {
      const rbac = accountData.rbac.find((r) => r.portal_user_id === user.user.portal_user_id)
      return rbac?.user_joined_account === true
    })

    const pendingAccountsData = allAccountsData.filter((accountData) => {
      const rbac = accountData.rbac.find((r) => r.portal_user_id === user.user.portal_user_id)
      return rbac?.user_joined_account === false
    })

    // Find the primary account (first Owner account, or first account if no owner)
    const primaryAccountData =
      acceptedAccountsData.find((accountData) => {
        const rbac = accountData.rbac.find((r) => r.portal_user_id === user.user.portal_user_id)
        return rbac?.role_name === RoleName.Owner
      }) || acceptedAccountsData[0]

    const primaryUserRole = primaryAccountData
      ? (getUserAccountRoleFromRbac(
        primaryAccountData.rbac,
        user.user.portal_user_id
      ) as RoleName)
      : undefined

    return json<UserAccountLoaderData>({
      accounts: acceptedAccountsData.map(d => d.account),
      pendingAccounts: pendingAccountsData.map(d => d.account),
      user: user.user,
      primaryAccount: primaryAccountData?.account,
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
