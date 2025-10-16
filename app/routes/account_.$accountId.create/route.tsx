import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import React, { useState } from "react"
import invariant from "tiny-invariant"
import AccountPlansContainer from "./components/AccountPlansContainer"
import AppForm from "./components/AppForm"
import { DEFAULT_APPMOJI } from "./components/AppmojiPicker"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import RouteModal from "~/components/RouteModal"
import useActionNotification, {
  ActionNotificationData,
} from "~/hooks/useActionNotification"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account, PayPlanType, RoleName } from "~/models/portal/sdk"
import { TeamActionData } from "~/routes/account.$accountId.settings.members/action"
import { ActionDataStruct } from "~/types/global"
import { getUserAccountRole, isAccountWithinAppLimit } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { triggerAppActionNotification } from "~/utils/notifications.server"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Create Application ${seo_title_append}`,
    },
  ]
}

type CreateAppLoaderData = {
  account: Account
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const { accountId } = params
  invariant(accountId, "AccountId must be set")

  try {
    const getUserAccountResponse = await portal.getUserAccount({
      accountID: accountId,
      accepted: true,
    })

    if (!getUserAccountResponse) {
      return redirect(`/account/${params.accountId}`)
    }

    const userAccount = getUserAccountResponse.getUserAccount as Account
    const userRole = getUserAccountRole(userAccount.users, user.user.portal_user_id)

    if (!userRole || userRole === RoleName.Member) {
      return redirect(`/account/${params.accountId}`)
    }
    const canCreateApp = isAccountWithinAppLimit(userAccount)

    // ensure only users who can create new apps are allowed on this page
    if (!canCreateApp) {
      return redirect(`/account/${params.accountId}/app-limit-exceeded`)
    }

    // TODO: Dynamically get the price
    //
    // const priceID = getRequiredServerEnvVar("STRIPE_PRICE_ID")
    // const price = await stripe.prices.retrieve(priceID).catch((error) => {
    //   console.log(error)
    // })

    // return json<LoaderData>(
    //   {
    //     price: price,
    //   },
    //   {
    //     headers: {
    //       "Cache-Control": `private, max-age=${
    //         process.env.NODE_ENV === "production" ? "3600" : "60"
    //       }`,
    //     },
    //   },
    // )

    return json<CreateAppLoaderData>({
      account: userAccount,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const formData = await request.formData()
  const subscription = formData.get("account-subscription")
  const name = formData.get("app-name")
  const referral = formData.get("referral-id")
  const description = formData.get("app-description")
  const appmoji = formData.get("app-emoji")
  const { accountId } = params

  invariant(name && typeof name === "string", "app name not found")
  invariant(accountId && typeof accountId === "string", "accountId not found")

  try {
    const createUserPortalAppResponse = await portal
      .createUserPortalApp({
        input: {
          name,
          accountID: accountId,
          description: typeof description === "string" ? description : undefined,
          appEmoji: typeof appmoji === "string" ? appmoji : DEFAULT_APPMOJI,
        },
      })
      .catch((err) => {
        console.log(err)
        throw new Error("portal api could not create new endpoint")
      })

    if (!createUserPortalAppResponse.createUserPortalApp) {
      throw new Error("portal api could not create new endpoint")
    }

    const newApp = createUserPortalAppResponse.createUserPortalApp

    await triggerAppActionNotification({
      actor: user.user,
      type: "create",
      appId: newApp.id,
      appName: newApp.name,
      appEmoji: newApp.appEmoji,
      accountId: accountId,
    })

    if (subscription) {
      invariant(
        subscription && typeof subscription === "string",
        "account subscription not found",
      )
      if (subscription === PayPlanType.PlanUnlimited) {
        return redirect(
          `/api/stripe/checkout-session?account-id=${accountId}&app-id=${newApp.id}&referral-id=${referral}`,
        )
      }
    }

    return redirect(`/account/${accountId}/${newApp.id}`)
  } catch (error) {
    console.error(error)
    return json<ActionDataStruct<TeamActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export default function CreateApp() {
  const { account } = useLoaderData<CreateAppLoaderData>()
  const fetcher = useFetcher()
  const [appFromData, setAppFromData] = useState<FormData>()
  const fetcherData = fetcher.data as ActionNotificationData
  useActionNotification(fetcherData)

  const handleFormSubmit = (formData: FormData) => {
    if (account.planType === PayPlanType.PlanFree) {
      setAppFromData(formData)
    } else {
      fetcher.submit(formData, {
        method: "POST",
      })
    }
  }

  return (
    <RouteModal loaderMessage="Creating your application..." state={fetcher.state}>
      {appFromData ? (
        <AccountPlansContainer
          onPlanSelected={(plan: PayPlanType) => {
            appFromData?.append("account-subscription", plan)
            fetcher.submit(appFromData, {
              method: "POST",
            })
          }}
        />
      ) : (
        <AppForm onSubmit={handleFormSubmit} />
      )}
    </RouteModal>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
