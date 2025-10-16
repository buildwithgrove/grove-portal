import { Outlet, useActionData, useRouteLoaderData } from "@remix-run/react"

import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountSettingsLayoutView from "~/routes/account.$accountId.settings/view"
import { ActionDataStruct } from "~/types/global"
import ErrorBoundaryView from "~/components/ErrorBoundaryView/ErrorBoundaryView"
import useActionNotification from "~/hooks/useActionNotification"

export default function AccountSettings() {
  const { portalAccount, portalAccounts, user, userRole } = useRouteLoaderData(
    "routes/account.$accountId",
  ) as AccountIdLoaderData
  const actionData = useActionData() as ActionDataStruct<{ success: boolean }>

  // handle all notifications at the layout level
  useActionNotification(actionData)

  return (
    <AccountSettingsLayoutView account={portalAccount} userRole={userRole}>
      <Outlet context={{ account: portalAccount, accounts: portalAccounts, user, userRole }} />
    </AccountSettingsLayoutView>
  )
}
export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
