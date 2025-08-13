import { LoaderFunction } from "@remix-run/node"
import ErrorBoundaryView from "~/components/ErrorBoundaryView/ErrorBoundaryView"
import { redirectToUserAccount, requireUser } from "~/utils/user.server"

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  return redirectToUserAccount(user)
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
