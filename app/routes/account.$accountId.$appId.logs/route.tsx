import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { D2Log, D2Meta } from "~/models/portal/sdk"
import { AppIdOutletContext } from "~/routes/account.$accountId.$appId/route"
import AppLogs from "~/routes/account.$accountId.$appId.logs/view"
import { getErrorMessage } from "~/utils/catchError"
import { getLogsParams, LOGS_PAGE_SIZE } from "~/utils/dwhUtils.server"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Application Logs ${seo_title_append}`,
    },
  ]
}

export type AppLogsData = {
  logs: D2Log[]
  meta: D2Meta
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request)
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const url = new URL(request.url)
  const { accountId, appId } = params

  const { logType, pageNumberParam, tsParam, from } = getLogsParams(url)

  invariant(typeof accountId === "string", "AccountId must be a set url parameter")
  invariant(typeof appId === "string", "AppId must be a set url parameter")

  try {
    const getD2LogsDataResponse = await portal.getD2LogsData({
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

    return json<AppLogsData>({
      logs: getD2LogsDataResponse?.getD2LogsData?.data as D2Log[],
      meta: getD2LogsDataResponse.getD2LogsData.meta,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AppInsights() {
  const { logs, meta } = useLoaderData<AppLogsData>()
  const { blockchains } = useOutletContext<AppIdOutletContext>()
  return <AppLogs blockchains={blockchains} logs={logs} meta={meta} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
