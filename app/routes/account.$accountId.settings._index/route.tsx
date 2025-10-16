import { MetaFunction } from "@remix-run/node"
import { useOutletContext } from "@remix-run/react"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountSettingsView from "~/routes/account.$accountId.settings._index/view"
import { seo_title_append } from "~/utils/seo"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Account Settings ${seo_title_append}`,
    },
  ]
}

export default function AccountSettings() {
  const { portalAccount, userRole } = useOutletContext<AccountIdLoaderData>()

  // TODO_IN_THIS_PR(@commoddity): Update AccountSettingsView to accept PortalAccount
  return <AccountSettingsView account={portalAccount} userRole={userRole} />
}
