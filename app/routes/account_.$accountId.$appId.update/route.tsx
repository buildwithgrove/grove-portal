import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import RouteModal from "~/components/RouteModal"
import useActionNotification, {
  ActionNotificationData,
} from "~/hooks/useActionNotification"
import { initPortalClient } from "~/models/portal/portal.server"
import { PortalApp, RoleName, UpdatePortalApp } from "~/models/portal/sdk"
import AppForm from "~/routes/account_.$accountId.create/components/AppForm"
import { getUserAccountRole } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Update Application ${seo_title_append}`,
    },
  ]
}

type UpdateAppLoaderData = {
  app: PortalApp
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const { accountId, appId } = params

  invariant(appId, "AppId must be set")
  invariant(accountId, "AccountId must be set")

  try {
    const getUserPortalAppResponse = await portal.getUserPortalApp({
      portalAppID: appId,
      accountID: accountId,
    })

    if (!getUserPortalAppResponse) {
      return redirect(`/account/${accountId}`)
    }

    const getUserAccountResponse = await portal.getUserAccount({
      accountID: accountId,
      accepted: true,
    })

    if (!getUserAccountResponse) {
      return redirect(`/account/${params.accountId}`)
    }

    const userRole = getUserAccountRole(
      getUserAccountResponse.getUserAccount.users,
      user.user.portal_user_id,
    )

    if (!userRole || userRole === RoleName.Member) {
      return redirect(`/account/${params.accountId}/${appId}`)
    }

    return json<UpdateAppLoaderData>({
      app: getUserPortalAppResponse.getUserPortalApp as PortalApp,
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
  const name = formData.get("app-name")
  const description = formData.get("app-description")
  const appEmoji = formData.get("app-emoji")
  const { accountId, appId } = params

  try {
    invariant(name && typeof name === "string", "app name not found")
    invariant(typeof accountId === "string", "accountId not found")
    invariant(typeof appId === "string", "appId not found")

    const input: UpdatePortalApp = {
      appID: appId,
      accountID: accountId,
      name,
    }

    if (typeof description === "string") {
      input.description = description
    }
    if (typeof appEmoji === "string") {
      input.appEmoji = appEmoji
    }

    const updateUserPortalAppResponse = await portal
      .updateUserPortalApp({
        input,
      })
      .catch((err) => {
        console.log(err)
        throw new Error("portal api could not create new endpoint")
      })

    if (!updateUserPortalAppResponse.updateUserPortalApp) {
      throw new Error("portal api could not update new endpoint")
    }

    return redirect(
      `/account/${accountId}/${updateUserPortalAppResponse.updateUserPortalApp.id}`,
    )
  } catch (error) {
    return json({
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export default function UpdateApp() {
  const fetcher = useFetcher()
  const { app } = useLoaderData<UpdateAppLoaderData>()
  const fetcherData = fetcher.data as ActionNotificationData

  useActionNotification(fetcherData)

  return (
    <RouteModal loaderMessage="Updating your application..." state={fetcher.state}>
      <AppForm
        app={app}
        onSubmit={(formData) =>
          fetcher.submit(formData, {
            method: "POST",
          })
        }
      />
    </RouteModal>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
