import { json, LoaderFunction, MetaFunction } from "@remix-run/node"
import { useOutletContext } from "@remix-run/react"
import { action } from "./action"
import MembersView from "./view"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import type { AuthPortalUser } from "~/models/portal-db/types"
import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Account Members ${seo_title_append}`,
    },
  ]
}

export type TeamLoaderData = {
  profile: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
  accessToken: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  return json<TeamLoaderData>({
    profile: user.user,
    accessToken: user.accessToken,
  })
}

export { action }

export default function AccountMembers() {
  const { userRole, portalAccount, user, accountRbac } = useOutletContext<AccountIdLoaderData>()
  return <MembersView account={portalAccount} user={user} userRole={userRole} rbac={accountRbac} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
