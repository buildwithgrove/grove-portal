import { useLocation, useParams } from "@remix-run/react"
import { useEffect, useMemo } from "react"
import { AuthPortalUser } from "~/models/portal-db/types"
import { trackPage } from "~/utils/analytics"

type useRootProps = {
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
}

export const useRoot = ({ user }: useRootProps) => {
  const { pathname } = useLocation()
  const { accountId } = useParams()

  const isLanding = useMemo(() => pathname === "/", [pathname])
  const hideSidebar = useMemo(
    () =>
      pathname === `/account/${accountId}/create` ||
      pathname === `/account/${accountId}/app-limit-exceeded` ||
      pathname === `/user` ||
      pathname === `/user/accounts` ||
      pathname === `/user/invites`,
    [accountId, pathname],
  )

  useEffect(() => {
    trackPage(pathname, document.title)
  }, [pathname])

  return { isLanding, hideSidebar }
}
