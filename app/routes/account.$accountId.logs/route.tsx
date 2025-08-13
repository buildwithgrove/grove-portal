import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { D2Log, D2Meta, PortalApp, SortOrder } from "~/models/portal/sdk"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountLogsView from "~/routes/account.$accountId.logs/view"
import { getErrorMessage } from "~/utils/catchError"
import { getLogsParams, LOGS_PAGE_SIZE } from "~/utils/dwhUtils.server"
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
  logs: D2Log[]
  meta?: D2Meta
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request)
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const url = new URL(request.url)
  const { accountId } = params
  const appIdParam = url.searchParams.get("app")

  const { logType, pageNumberParam, tsParam, from } = getLogsParams(url)

  invariant(typeof accountId === "string", "AccountId must be a set url parameter")

  try {
    const getUserAccountResponse = await portal.getUserAccount({
      accountID: accountId,
      accepted: true,
      sortOrder: SortOrder.Asc,
    })

    const apps = getUserAccountResponse.getUserAccount.portalApps as PortalApp[]

    let getD2LogsDataResponse
    const appId = appIdParam ? appIdParam : apps![0]?.id
    if (appId) {
      getD2LogsDataResponse = await portal.getD2LogsData({
        params: {
          from,
          to: tsParam,
          logType,
          accountID: accountId,
          applicationID: appId,
          page: pageNumberParam,
          pageSize: LOGS_PAGE_SIZE,
          payloadSize: true,
        },
      })
    }

    return json<AccountLogsData>({
      apps,
      logs: (getD2LogsDataResponse?.getD2LogsData?.data as D2Log[]) ?? [],
      meta: getD2LogsDataResponse?.getD2LogsData?.meta,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AccountLogs() {
  const { apps, logs, meta } = useLoaderData<AccountLogsData>()
  const { blockchains, userRole } = useOutletContext<AccountIdLoaderData>()
  return (
    <AccountLogsView
      apps={apps}
      blockchains={blockchains}
      logs={logs}
      meta={meta}
      userRole={userRole}
    />
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
