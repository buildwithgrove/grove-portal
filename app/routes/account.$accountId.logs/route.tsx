import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { initPortalDbClient } from "~/models/portal-db/portal-db.server"
import { D2Log, D2Meta, PortalApp, SortOrder } from "~/models/portal/sdk"
import type { PortalApplication } from "~/models/portal-db/types"
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
  apps: PortalApplication[]
  logs: D2Log[]
  meta?: D2Meta
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireUser(request)
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const url = new URL(request.url)
  const { accountId } = params
  const appIdParam = url.searchParams.get("app")

  const { logType, pageNumberParam, tsParam, from } = getLogsParams(url)

  invariant(typeof accountId === "string", "AccountId must be a set url parameter")

  try {
    // Get portal applications from parent route context
    const { portalApplications } = context as { portalApplications: PortalApplication[] }
    const apps = portalApplications

    let getD2LogsDataResponse
    const appId = appIdParam ? appIdParam : apps![0]?.portal_application_id
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
  const { services, userRole } = useOutletContext<AccountIdLoaderData>()
  return (
    <AccountLogsView
      apps={apps}
      services={services}
      logs={logs}
      meta={meta}
      userRole={userRole}
    />
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
