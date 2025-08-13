import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import { getBillingPeriodRelays } from "~/models/portal/dwh.server"
import { initPortalClient } from "~/models/portal/portal.server"
import { D2Stats } from "~/models/portal/sdk"
import { Stripe, stripe, STRIPE_RECORDS_LIMIT } from "~/models/stripe/stripe.server"
import { AccountBillingOutletContext } from "~/routes/account.$accountId.billing/route"
import AccountBillingView from "~/routes/account.$accountId.billing._index/view"
import { getErrorMessage } from "~/utils/catchError"
import { dayjs } from "~/utils/dayjs"
import { getRequiredServerEnvVar } from "~/utils/environment"
import { requireUser } from "~/utils/user.server"


//TODO: Implement historical usage graphs and more insights about overall billing utilization
export type AccountBillingLoaderData = {
  invoices: Stripe.Invoice[]
  currentMonthRelays: number
  upcomingInvoice?: Stripe.UpcomingInvoice
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { accountId } = params

  invariant(accountId, "account id not found")

  if (getRequiredServerEnvVar("FLAG_STRIPE_PAYMENT") === "false") {
    return redirect(`/account/${accountId}/settings`)
  }

  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  try {
    const getUserAccountStripeIdResponse = await portal.getUserAccountStripeId({
      accountID: accountId,
    })
    const accountStripeId =
      getUserAccountStripeIdResponse.getUserAccount.integrations?.stripeSubscriptionID
    let invoices: Stripe.Invoice[] = []
    let upcomingInvoice: Stripe.UpcomingInvoice | undefined

    if (accountStripeId) {
      const invoicesResponse = await stripe.invoices.list({
        subscription: String(accountStripeId),
        limit: STRIPE_RECORDS_LIMIT,
      })

      invoices = invoicesResponse?.data ?? []

      // Fetch upcoming invoice preview with discounts and line items
      try {
        upcomingInvoice = await stripe.invoices.createPreview({
          subscription: String(accountStripeId),
          expand: ["lines.data.price", "discounts", "subscription.discounts"],
        })
      } catch (error) {
        console.warn("Could not fetch upcoming invoice preview:", error)
      }
    }

    // Get current month relays for billing estimate
    const currentMonthStart = dayjs().utc().startOf("month").toDate()
    const now = dayjs().utc().toDate()

    let currentMonthRelays = 0
    try {
      const relayStats = await getBillingPeriodRelays({
        from: currentMonthStart,
        to: now,
        accountId,
        portalClient: portal,
      })

      // Sum total relays from all stats
      currentMonthRelays = relayStats.reduce(
        (total, stat) => total + (stat.totalCount || 0),
        0,
      )
    } catch (error) {
      console.warn("Could not fetch current month relay data:", error)
      currentMonthRelays = 0
    }

    return json<AccountBillingLoaderData>({
      invoices,
      currentMonthRelays,
      upcomingInvoice,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}
export default function AccountBilling() {
  const { userRole, usageRecords, subscription } =
    useOutletContext<AccountBillingOutletContext>()
  const { invoices, currentMonthRelays, upcomingInvoice } =
    useLoaderData<AccountBillingLoaderData>()

  return (
    <AccountBillingView
      invoices={invoices}
      usageRecords={usageRecords}
      userRole={userRole}
      currentMonthRelays={currentMonthRelays}
      subscription={subscription}
      upcomingInvoice={upcomingInvoice}
    />
  )
}
