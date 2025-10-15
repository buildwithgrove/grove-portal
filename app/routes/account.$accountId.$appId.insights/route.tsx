import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import {
  getAggregateRelays,
  getRealtimeDataChains,
  getTotalRelays,
} from "~/models/portal/dwh.server"
import { initPortalClient } from "~/models/portal/portal.server"
import { D2Chain, D2Stats } from "~/models/portal/sdk"
import { AppIdOutletContext } from "~/routes/account.$accountId.$appId/route"
import ApplicationInsightsView from "~/routes/account.$accountId.$appId.insights/view"
import { getErrorMessage } from "~/utils/catchError"
import { byHourPeriods, getDwhParams, validatePeriod } from "~/utils/dwhUtils.server"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Application Insights ${seo_title_append}`,
    },
  ]
}

export type AppInsightsData = {
  total: D2Stats
  aggregate: D2Stats[]
  realtimeDataChains: D2Chain[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request)
  const url = new URL(request.url)
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })

  const { period, chainParam } = getDwhParams(url)
  // Prevent manually entering an invalid period
  validatePeriod({ period, url })

  // Pass chain name directly to API calls
  const chainName = chainParam && chainParam !== "all" ? chainParam : null

  try {
    const { appId, accountId } = params
    invariant(typeof appId === "string", "AppId must be a set url parameter")
    invariant(typeof accountId === "string", "AccountId must be a set url parameter")

    const getAggregateRelaysResponse = await getAggregateRelays({
      period: period,
      accountId,
      portalClient: portal,
      byHour: byHourPeriods.includes(period),
      applicationIDs: [appId],
      ...(chainName && { chainIDs: [chainName] }),
    })

    const getTotalRelaysResponse = await getTotalRelays({
      period: period,
      accountId,
      portalClient: portal,
      applicationIDs: [appId],
      ...(chainName && { chainIDs: [chainName] }),
    })

    const getRealtimeDataChainsResponse = await getRealtimeDataChains({
      period,
      accountId,
      portalClient: portal,
      applicationIDs: [appId],
    })

    return json<AppInsightsData>({
      realtimeDataChains: getRealtimeDataChainsResponse,
      total: getTotalRelaysResponse,
      aggregate: getAggregateRelaysResponse,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function ApplicationInsights() {
  const { total, aggregate, realtimeDataChains } = useLoaderData<typeof loader>()
  const { services } = useOutletContext<AppIdOutletContext>()

  return (
    <ApplicationInsightsView
      aggregate={aggregate}
      services={services}
      realtimeDataChains={realtimeDataChains}
      total={total}
    />
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
