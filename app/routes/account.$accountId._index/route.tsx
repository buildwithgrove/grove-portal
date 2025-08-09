import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import React from "react"
import invariant from "tiny-invariant"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import {
  getAggregateRelays,
  getRealtimeDataChains,
  getTotalRelays,
} from "~/models/portal/dwh.server"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account, D2Chain, D2Stats, PortalApp } from "~/models/portal/sdk"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountInsightsView from "~/routes/account.$accountId._index/view"
import { getErrorMessage } from "~/utils/catchError"
import { byHourPeriods, getDwhParams, validatePeriod } from "~/utils/dwhUtils.server"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Account Insights ${seo_title_append}`,
    },
  ]
}

export type AccountInsightsData = {
  account: Account
  total: D2Stats
  aggregate: D2Stats[]
  realtimeDataChains: D2Chain[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const url = new URL(request.url)
  const { period, chainParam, appParam } = getDwhParams(url)
  // Prevent manually entering an invalid period
  validatePeriod({ period, url })

  // Pass chain name directly to API calls
  const chainName = chainParam && chainParam !== "all" ? chainParam : null

  try {
    const { accountId } = params
    invariant(typeof accountId === "string", "AccountId must be a set url parameter")

    const account = await portal.getUserAccount({ accountID: accountId, accepted: true })

    const getAggregateRelaysResponse = await getAggregateRelays({
      period,
      accountId,
      portalClient: portal,
      byHour: byHourPeriods.includes(period),
      ...(chainName && { chainIDs: [chainName] }),
      ...(appParam && appParam !== "all" && { applicationIDs: [appParam] }),
    })

    const getTotalRelaysResponse = await getTotalRelays({
      period,
      accountId,
      portalClient: portal,
      ...(chainName && { chainIDs: [chainName] }),
      ...(appParam && appParam !== "all" && { applicationIDs: [appParam] }),
    })

    const getRealtimeDataChainsResponse = await getRealtimeDataChains({
      period,
      accountId,
      portalClient: portal,
      ...(appParam && appParam !== "all" && { applicationIDs: [appParam] }),
    })

    return json<AccountInsightsData>({
      account: account.getUserAccount as Account,
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

export default function AccountInsights() {
  const { account, total, aggregate, realtimeDataChains } =
    useLoaderData() as AccountInsightsData
  const { blockchains, userRole } = useOutletContext<AccountIdLoaderData>()

  return (
    <AccountInsightsView
      aggregate={aggregate}
      apps={account?.portalApps as PortalApp[]}
      blockchains={blockchains}
      realtimeDataChains={realtimeDataChains}
      total={total}
      userRole={userRole}
    />
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
