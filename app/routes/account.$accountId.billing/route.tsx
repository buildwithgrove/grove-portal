import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"
import React from "react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { PayPlanType, RoleName } from "~/models/portal/sdk"
import { Stripe, stripe, STRIPE_RECORDS_LIMIT } from "~/models/stripe/stripe.server"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountBillingLayoutView from "~/routes/account.$accountId.billing/view"
import { getUserAccountRole } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { getRequiredServerEnvVar } from "~/utils/environment"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"
import { UsageRecordSummary, InvoiceUsageData } from "~/types/stripe-custom"

//TODO: Figure out how to have anyone who has _ever_ had PLAN_UNLIMITED (has at least 1 invoice)
// always maintain access to the billing page.
export const meta: MetaFunction = () => {
  return [
    {
      title: `Account Billing ${seo_title_append}`,
    },
  ]
}

export type AccountBillingOutletLoaderData = {
  subscription?: Stripe.Subscription
  usageRecords?: InvoiceUsageData[]
}

export type AccountBillingOutletContext = AccountBillingOutletLoaderData &
  AccountIdLoaderData

export const loader: LoaderFunction = async ({ request, params }) => {
  const { accountId } = params

  invariant(accountId, "account id not found")

  if (getRequiredServerEnvVar("FLAG_STRIPE_PAYMENT") === "false") {
    return redirect(`/account/${accountId}/settings`)
  }

  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  try {
    let usageRecords: InvoiceUsageData[] = []
    let subscription: Stripe.Subscription | undefined

    const getBillingRouteAccountInfoResponse = await portal.getBillingRouteAccountInfo({
      accountID: accountId,
    })

    const account = getBillingRouteAccountInfoResponse.getUserAccount
    const accountStripeId = account.integrations?.stripeSubscriptionID
    const userRole = getUserAccountRole(account.users, user.user.portalUserID) as RoleName

    // Redirect to account page if user is a member or account is on Starter
    if (userRole === RoleName.Member || account.plan.type === PayPlanType.PlanFree) {
      return redirect(`/account/${accountId}`)
    }

    if (accountStripeId) {
      subscription = await stripe.subscriptions.retrieve(accountStripeId, {
        expand: ["items.data.price"],
      })

      // Try to get usage data using the new meters API
      try {
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          limit: 100, // Adjust as needed
        })
        const usageRecordSummaries: InvoiceUsageData[] = []

        // Process each invoice to extract usage from line items
        for (const invoice of invoices.data) {
          // Look through the invoice line items for usage-based items
          for (const lineItem of invoice.lines.data) {
            // Check if this is a subscription line item with usage
            if (lineItem.quantity && lineItem.quantity > 0) {
              const quantity = lineItem.quantity || 0
              const totalRelays = quantity * 1000000 // convert units to relays

              usageRecordSummaries.push({
                invoice: invoice.id ?? null,
                total_usage: totalRelays,
                subscription_item:
                  (lineItem as any).parent?.subscription_item_details
                    ?.subscription_item ?? "",
              })

              // Break after finding the first metered line item for this invoice
              break
            }
          }
        }
        usageRecords = usageRecordSummaries
      } catch (meterError) {
        console.warn("Could not process subscription data:", meterError)
        usageRecords = []
      }
    }

    return json<AccountBillingOutletLoaderData>({
      subscription,
      usageRecords: usageRecords ?? [],
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AccountBilling() {
  const outletData = useOutletContext<AccountIdLoaderData>()
  const { usageRecords } = useLoaderData<AccountBillingOutletLoaderData>()

  return (
    <AccountBillingLayoutView>
      <Outlet
        context={
          {
            ...outletData,
            usageRecords,
          } as AccountBillingOutletContext
        }
      />
    </AccountBillingLayoutView>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
