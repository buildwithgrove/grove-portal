import { ActionFunction, json } from "@remix-run/node"
import invariant from "tiny-invariant"
import { PayPlanType } from "~/models/portal/sdk"
import { stripe } from "~/models/stripe/stripe.server"
import { getErrorMessage } from "~/utils/catchError"
import { triggerSubscriptionActionNotification } from "~/utils/notifications.server"
import { updatePlan } from "~/utils/updatePlan.server"
import { requireUser } from "~/utils/user.server"

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request)
  invariant(user.user.auth0ID && user.user.portal_user_email, "user not found")
  const formData = await request.formData()
  const accountId = formData.get("account-id")
  const accountName = formData.get("account-name")
  const subscriptionId = formData.get("subscription-id")
  invariant(accountId, "account id not found")
  invariant(typeof subscriptionId === "string", "subscription id must be set")
  try {
    if (subscriptionId) {
      const updatedSubscription = await stripe.subscriptions.cancel(subscriptionId)

      if (updatedSubscription) {
        await updatePlan({
          id: accountId as string,
          type: PayPlanType.PlanFree,
        })

        await triggerSubscriptionActionNotification({
          actor: user.user,
          type: "cancel",
          accountName: (accountName as string) ?? accountId,
          accountId: accountId as string,
        })

        return json({
          error: false,
          subscription: updatedSubscription,
        })
      }
    }

    throw new Error("no subscription")
  } catch (error) {
    console.error(error)
    return json({
      error: true,
      message: getErrorMessage(error),
    })
  }
}
