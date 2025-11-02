import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { PortalApp } from "~/models/portal/sdk"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AppLogsView from "~/routes/account.$accountId.$appId.logs/view"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Logs ${seo_title_append}`,
    },
  ]
}

export type AppLogsData = {
  app: PortalApp
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const { accountId, appId } = params

  invariant(typeof accountId === "string", "AccountId must be a set url parameter")
  invariant(typeof appId === "string", "AppId must be a set url parameter")

  try {
    const getUserPortalAppResponse = await portal.getUserPortalApp({
      portalAppID: appId,
      accountID: accountId,
    })

    const app = getUserPortalAppResponse.getUserPortalApp as PortalApp

    return json<AppLogsData>({
      app,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function AppLogs() {
  const { app } = useLoaderData() as AppLogsData
  const { blockchains } = useOutletContext<AccountIdLoaderData>()

  return <AppLogsView app={app} blockchains={blockchains} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
