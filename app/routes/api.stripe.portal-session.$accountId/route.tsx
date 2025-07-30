import { ActionFunction, LoaderFunction, redirect, json } from "@remix-run/node"
import invariant from "tiny-invariant"
import { stripe } from "~/models/stripe/stripe.server"
import { requireUser } from "~/utils/user.server"

export const loader: LoaderFunction = async ({ params }) => {
  // Redirect GET requests to the account settings page
  return redirect(`/account/${params.accountId}/settings/plan`)
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUser(request)

  const url = new URL(request.url)
  const formData = await request.formData()
  const returnPathParam = formData.get("return-path") as string | null
  const subscriptionId = formData.get("subscription-id") as string | null
  const returnPath = returnPathParam ?? "/account"
  const returnUrl = `${url.origin}${returnPath}`

  invariant(subscriptionId, "subscription-id is required")

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer as string,
      return_url: returnUrl,
    })

    if (portalSession.url) {
      return redirect(portalSession.url)
    }

    return json({
      error: true,
      message: "Stripe portal session was not established",
    })
  } catch (error) {
    return json({
      error: true,
      message: "Unable to retrieve subscription or create portal session",
    })
  }
}
