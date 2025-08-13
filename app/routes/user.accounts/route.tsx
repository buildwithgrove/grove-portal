import { ActionFunction, json, MetaFunction } from "@remix-run/node"
import { useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import UserAccounts from "./view"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { RoleName } from "~/models/portal/sdk"
import { UserAccountLoaderData } from "~/routes/user/route"
import { ActionDataStruct } from "~/types/global"
import { getErrorMessage } from "~/utils/catchError"
import { triggerAcceptInvitationNotification } from "~/utils/notifications.server"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `User Accounts ${seo_title_append}`,
    },
  ]
}

export type UserInvitedAccountsActionData = {
  success: boolean
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  let message = ""
  const formData = await request.formData()

  try {
    const invite_response = formData.get("invite_response")

    const res = false
    if (invite_response) {
      const accountId = formData.get("accountId")
      const invitedAccountName = formData.get("accountName")
      const invitedUserRole = formData.get("role")
      invariant(typeof accountId === "string", "accountId must be set")
      invariant(typeof invitedAccountName === "string", "invitedAccountName must be set")
      invariant(typeof invitedUserRole === "string", "invitedUserRole must be set")

      const updateUserResponse = await portal.updateUserAcceptAccount({
        accountID: accountId,
        accepted: invite_response === "accept",
      })
      const accepted = updateUserResponse.updateUserAcceptAccount

      message = `Invite has been ${accepted ? "accepted" : "declined"}.`
      await triggerAcceptInvitationNotification({
        accountId,
        accepted,
        actor: user.user,
        accountName: invitedAccountName,
        userRole: invitedUserRole as RoleName,
      }).catch((error) => {
        // Silently handle error - user will see error state
        message =
          message + " however something went wrong while sending the notification."
      })
    }

    return json<ActionDataStruct<UserInvitedAccountsActionData>>({
      data: {
        success: res,
      },
      error: false,
      message,
    })
  } catch (error) {
    return json<ActionDataStruct<UserInvitedAccountsActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export default function Accounts() {
  const { accounts, pendingAccounts, user } = useOutletContext<UserAccountLoaderData>()
  return (
    <UserAccounts accounts={accounts} pendingAccounts={pendingAccounts} user={user} />
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
