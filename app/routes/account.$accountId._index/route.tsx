import { LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account, PortalApp } from "~/models/portal/sdk"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountOverviewView from "~/routes/account.$accountId._index/view"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Account Overview ${seo_title_append}`,
    },
  ]
}

export type AccountOverviewData = {
  account: Account
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })

  try {
    const { accountId } = params
    invariant(typeof accountId === "string", "AccountId must be a set url parameter")

    const account = await portal.getUserAccount({ accountID: accountId, accepted: true })
    const userAccount = account.getUserAccount as Account
    const apps = (userAccount?.portalApps as PortalApp[]) || []

    // If there are apps, redirect to the first one
    if (apps.length > 0) {
      return redirect(`/account/${accountId}/${apps[0].id}`)
    }

    // Otherwise show the empty state
    return redirect(`/account/${accountId}/create`)
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AccountOverview() {
  const { account } = useLoaderData() as AccountOverviewData
  const { userRole } = useOutletContext<AccountIdLoaderData>()

  return <AccountOverviewView account={account} userRole={userRole} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
