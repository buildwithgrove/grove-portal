import { toCsvSync } from "@iwsio/json-csv-node"
import { LoaderFunction } from "@remix-run/node"
import invariant from "tiny-invariant"
import { DwhPeriod, getAggregateRelays } from "~/models/portal/dwh.server"
import { initPortalClient } from "~/models/portal/portal.server"
import { dayjs } from "~/utils/dayjs"
import { byHourPeriods, getDwhParams, validatePeriod } from "~/utils/dwhUtils.server"
import { requireUser } from "~/utils/user.server"

const csvOptions = {
  fields: [
    {
      name: "dateTime",
      label: "Date",
    },
    {
      name: "totalCount",
      label: "Total Relays",
    },
    {
      name: "successRate",
      label: "Success Rate",
    },
    {
      name: "errorCount",
      label: "Error Rate",
    },
    {
      name: "avgLatency",
      label: "Average Latency",
    },
  ],
}

const getPeriodHumanReadable = (period: DwhPeriod) => {
  if (!period) {
    return "24 Hours"
  }
  switch (period) {
    case "24hr":
      return "Last 24 Hours"
    case "weekToDate":
      return "Week to Date"
    case "monthToDate":
      return "Month to Date"
    case 14:
      return "Last Two Weeks"
    default:
      return `Last ${period} Days`
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request)
  const url = new URL(request.url)
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })

  const { period, chainParam, appParam } = getDwhParams(url)
  // Prevent manually entering an invalid period
  validatePeriod({ period, url })

  // Pass chain name directly to API calls
  const chainName = chainParam && chainParam !== "all" 
    ? chainParam 
    : null

  try {
    const { accountId } = params
    invariant(typeof accountId === "string", "AccountId must be a set url parameter")

    const getAggregateRelaysResponse = await getAggregateRelays({
      period: period,
      accountId,
      portalClient: portal,
      byHour: byHourPeriods.includes(period),
      ...(appParam && appParam !== "all" && { applicationIDs: [appParam] }),
      ...(chainName && { chainIDs: [chainName] }),
    })

    const csv = toCsvSync(getAggregateRelaysResponse, csvOptions)
    const buffer = Buffer.from(csv, "utf-8")
    return new Response(buffer, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=Account:${accountId}-${
          appParam && appParam !== "all" ? `App:${appParam}-` : "".trim()
        }${dayjs(new Date()).format("DD MMM YYYY")}-${getPeriodHumanReadable(
          period,
        )}-Insights.csv`,
      },
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
