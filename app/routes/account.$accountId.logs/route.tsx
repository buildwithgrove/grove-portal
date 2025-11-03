import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { PortalApp, SortOrder } from "~/models/portal/sdk"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountLogsView from "~/routes/account.$accountId.logs/view"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Logs ${seo_title_append}`,
    },
  ]
}

export type AccountLogsData = {
  apps: PortalApp[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const { accountId } = params

  invariant(typeof accountId === "string", "AccountId must be a set url parameter")

  try {
    const getUserAccountResponse = await portal.getUserAccount({
      accountID: accountId,
      accepted: true,
      sortOrder: SortOrder.Asc,
    })

    const apps = getUserAccountResponse.getUserAccount.portalApps as PortalApp[]

    return json<AccountLogsData>({
      apps,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AccountLogs() {
  const { apps } = useLoaderData() as AccountLogsData
  const { blockchains } = useOutletContext<AccountIdLoaderData>()

  return <AccountLogsView apps={apps} blockchains={blockchains} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
