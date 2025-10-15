import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { PortalApp, RoleName } from "~/models/portal/sdk"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import SandboxView from "~/routes/account.$accountId.sandbox/view"
import { getUserAccountRole } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Sandbox ${seo_title_append}`,
    },
  ]
}

type SandboxLoaderData = {
  accountApps: PortalApp[]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })

  const { accountId } = params
  invariant(accountId, "account id not found")

  try {
    const getUserAccountUsersResponse = await portal.getUserAccountUsers({
      accountID: accountId,
      accepted: true,
    })

    const userRole = getUserAccountRole(
      getUserAccountUsersResponse.getUserAccount.users,
      user.user.portalUserID,
    )

    const getUserAccountPortalAppsResponse =
      userRole === RoleName.Member
        ? await portal.getMemberUserAccountPortalApps({
          accountID: accountId,
          accepted: true,
        })
        : await portal.getUserAccountPortalApps({ accountID: accountId, accepted: true })

    return json<SandboxLoaderData>({
      accountApps: getUserAccountPortalAppsResponse.getUserAccount
        .portalApps as PortalApp[],
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export default function Sandbox() {
  const { services, userRole } = useOutletContext<AccountIdLoaderData>()
  const { accountApps } = useLoaderData<SandboxLoaderData>()

  return (
    <SandboxView
      services={services}
      portalApps={accountApps as PortalApp[]}
      userRole={userRole}
    />
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
