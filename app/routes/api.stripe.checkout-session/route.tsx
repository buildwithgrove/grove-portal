import { ActionFunction, redirect, json, LoaderFunction } from "@remix-run/node"
import invariant from "tiny-invariant"
import { stripe, Stripe } from "~/models/stripe/stripe.server"
import { authenticator } from "~/utils/auth.server"
import { getErrorMessage } from "~/utils/catchError"
import { getRequiredServerEnvVar } from "~/utils/environment"
import { getPoktId, requireUser } from "~/utils/user.server"

// getBillingCycleAnchorTimestamp gets the next billing cycle start date, which is
// 12:00 (noon) UTC of the first day of the next month. For example: if today is
// March 10th, the next billing cycle start date will be April 1st, 12:00 UTC.
function getBillingCycleAnchorTimestamp(): number {
  const now = new Date()
  const nextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 12, 0, 0),
  )
  return Math.floor(nextMonth.getTime() / 1000)
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  invariant(user.user.auth0ID && user.user.portal_user_email, "user not found")
  const userId = getPoktId(user.user.auth0ID)

  const url = new URL(request.url)
  const id = url.searchParams.get("account-id")
  const appId = url.searchParams.get("app-id")
  const referral = url.searchParams.get("referral-id")

  if (getRequiredServerEnvVar("FLAG_STRIPE_PAYMENT") === "false") {
    return redirect(`/account/${id}`)
  }

  try {
    // get pokemon relay price
    const priceID = getRequiredServerEnvVar("STRIPE_PRICE_ID")
    const price = await stripe.prices.retrieve(priceID, {
      expand: ["tiers"],
    })

    // check that customer exists or create a new one
    let customer: Stripe.Customer | null = null
    const userExists = await stripe.customers.list({
      email: user.user.portal_user_email,
    })
    if (userExists.data.length > 0) {
      customer = userExists.data.find((cust) => cust.metadata.user_id === userId) ?? null
    }
    if (!customer) {
      customer = await stripe.customers.create({
        email: user.user.portal_user_email,
        metadata: {
          user_id: userId,
        },
      })
    }

    // handle metadata that gets tied to the subscription
    const metadata: {} = {
      account_id: id,
      ...(referral ? { referral_id: referral } : {}),
    }

    // create stripe checkout session and redirect to stripe hosted checkout page
    // TODO: metadata doesnt seem to be sending here: https://stripe.com/docs/api/checkout/sessions/object
    const returnUrl = `${url.origin}/account/${id}${appId ? `/${appId}` : ""}`
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      billing_address_collection: "auto",
      line_items: [
        {
          price: price.id,
        },
      ],
      subscription_data: {
        billing_cycle_anchor: getBillingCycleAnchorTimestamp(),
      },
      mode: "subscription",
      metadata,
      allow_promotion_codes: true,
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?success=false`,
    })

    if (session.url) {
      return redirect(session.url)
    }
  } catch (error) {
    const params = new URLSearchParams({
      error: "true",
      message: getErrorMessage(error),
    })
    return redirect(`/account/${id}?${params}`)
  }
}

export const action: ActionFunction = async ({ request }) => {
  // ensure user is logged in
  const user = await authenticator.isAuthenticated(request)
  invariant(user, "user must be logged in")

  return json({
    error: true,
    message: "Stripe checkout session was not established",
  })
}
