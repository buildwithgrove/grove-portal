import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import { AccountPlanView } from "./view"
import ErrorBoundaryView from "~/components/ErrorBoundaryView/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account, D2Stats, PortalApp } from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"
import { Stripe, stripe } from "~/models/stripe/stripe.server"
import { AppIdOutletContext } from "~/routes/account.$accountId.$appId/route"
import { getErrorMessage } from "~/utils/catchError"
import { getRequiredServerEnvVar } from "~/utils/environment"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Account Plan ${seo_title_append}`,
    },
  ]
}

export type AccountAppRelays = Pick<D2Stats, "totalCount"> &
  Pick<PortalApp, "name" | "appEmoji">

export type AccountPlanLoaderData = {
  account: Account
  subscription?: Stripe.Subscription
  accountAppsRelays: AccountAppRelays[]
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
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
    let subscription
    let account
    const accountAppsRelays: AccountAppRelays[] = []

    account = await portal.getUserAccount({ accountID: accountId, accepted: true })

    if (account.getUserAccount.integrations?.stripeSubscriptionID) {
      subscription = await stripe.subscriptions.retrieve(
        account.getUserAccount.integrations.stripeSubscriptionID,
      )
    }

    return json<AccountPlanLoaderData>({
      account: account.getUserAccount as Account,
      subscription,
      accountAppsRelays,
      user: user.user,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AccountPlanDetails() {
  const data = useLoaderData<AccountPlanLoaderData>()
  const { userRole } = useOutletContext<AppIdOutletContext>()

  return <AccountPlanView {...data} userRole={userRole} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
