import { json, LoaderFunction } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import { User } from "~/models/portal/sdk"
import { requireUser } from "~/utils/user.server"
export type AccountOutletContext = {
  user: User
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)

  return json<AccountOutletContext>({
    user: user.user,
  })
}

export default function Account() {
  const { user } = useLoaderData<AccountOutletContext>()
  return <Outlet context={user} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
