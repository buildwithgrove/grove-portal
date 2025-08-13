import { json, LoaderFunction } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import React, { useEffect } from "react"
import invariant from "tiny-invariant"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import RootAppShell from "~/components/RootAppShell/RootAppShell"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account, Blockchain, RoleName, SortOrder, User } from "~/models/portal/sdk"
import { ColorScheme } from "~/root"
import { getUserAccountRole } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { getColorSchemeSession } from "~/utils/colorScheme.server"
import { redirectToUserAccount, requireUser } from "~/utils/user.server"

export type AccountIdLoaderData = {
  account: Account
  accounts: Account[]
  blockchains: Blockchain[]
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

    const getBlockchainsResponse = await portal.blockchains({ sortOrder: SortOrder.Asc })
    const blockchains = (getBlockchainsResponse.blockchains as Blockchain[]).filter(
      (chain) => chain.id !== "BE2A" && chain.scheme !== "wss",
    )

    return json<AccountIdLoaderData>({
      account: account.getUserAccount as Account,
      accounts: userAccounts.getUserAccounts as Account[],
      user: user.user,
      blockchains,
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
  const { account, accounts, blockchains, user, userRole, colorScheme } =
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
      <Outlet context={{ account, accounts, blockchains, user, userRole }} />
    </RootAppShell>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
