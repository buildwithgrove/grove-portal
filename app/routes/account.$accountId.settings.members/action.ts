import { ActionFunction, json } from "@remix-run/node"
import { Ratelimit } from "@upstash/ratelimit"
import { kv } from "@vercel/kv"
import invariant from "tiny-invariant"
import { initPortalClient } from "~/models/portal/portal.server"
import { RoleName } from "~/models/portal/sdk"
import { ActionDataStruct } from "~/types/global"
import { getErrorMessage } from "~/utils/catchError"
import { getRequiredServerEnvVar } from "~/utils/environment"
import { triggerTeamActionNotification } from "~/utils/notifications.server"
import { requireUser } from "~/utils/user.server"

export type TeamActionData = {
  success: boolean
  type: TeamActionType
}

export type TeamActionType = "delete" | "invite" | "updateRole" | "resend" | "leave"

const kvURL = getRequiredServerEnvVar("KV_REST_API_URL")
const kvToken = getRequiredServerEnvVar("KV_REST_API_TOKEN")

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const formData = await request.formData()

  const { accountId } = params
  invariant(accountId, "account id not found")

  try {
    const user_invite = formData.get("user_invite")
    const user_delete = formData.get("user_delete")
    const user_leave = formData.get("user_leave")
    const user_update = formData.get("user_update")
    const user_resend = formData.get("user_resend")
    const account_name = formData.get("account_name") as string
    const invitedAccountName = account_name ? account_name : accountId

    let message = ""
    const type: TeamActionType = "invite"
    let res = false

    if (user_invite) {
      // invite user
      const user_email = formData.get("user_email")
      const user_role = formData.get("user_role")
      invariant(typeof user_email === "string", "user_email must be set")
      invariant(typeof user_role === "string", "user_role must be set")

      const createAccountUserResponse = await portal.createAccountUser({
        input: {
          accountID: accountId,
          email: user_email,
          roleName: user_role as RoleName,
        },
      })
      res = Boolean(createAccountUserResponse.createAccountUser)
      message = `User invite successfully sent to ${user_email}`
      if (!res) {
        throw new Error(
          `Error inviting user ${user_email} on account ${invitedAccountName}`,
        )
      }

      const invitedUserId = createAccountUserResponse.createAccountUser

      await triggerTeamActionNotification({
        accountId,
        type: "invite",
        actor: user.user,
        userRole: user_role as RoleName,
        accountName: invitedAccountName,
        targetedUserId: invitedUserId,
        targetedUserEmail: user_email,
      }).catch((error) => {
        // Handle error silently - user will see error message
        message =
          message + ", however something went wrong while sending the notification."
      })
    }

    if (user_delete) {
      const user_id = formData.get("user_id")
      const user_email = formData.get("user_email")
      invariant(typeof user_id === "string", "user_id must be set")
      invariant(typeof user_email === "string", "user_email must be set")

      const removeAccountUserResponse = await portal.removeAccountUser({
        input: {
          accountID: accountId,
          userID: user_id,
        },
      })

      res = removeAccountUserResponse.removeAccountUser
      message = `User ${user_id} was removed from account ${invitedAccountName}`
      if (!res) {
        throw new Error(
          `Error removing user ${user_id} from account ${invitedAccountName}`,
        )
      }

      await triggerTeamActionNotification({
        accountId,
        type: "delete",
        actor: user.user,
        accountName: invitedAccountName,
        targetedUserId: user_id,
        targetedUserEmail: user_email,
      }).catch((error) => {
        // Handle error silently - user will see error message
        message =
          message + ", however something went wrong while sending the notification."
      })
    }
    if (user_update) {
      const user_id = formData.get("user_id")
      const user_role = formData.get("user_role")
      const user_email = formData.get("user_email")
      invariant(typeof user_id === "string", "user_id must be set")
      invariant(typeof user_role === "string", "user_role must be set")
      invariant(typeof user_email === "string", "user_email must be set")

      const updateUserAccountRoleResponse = await portal.updateUserAccountRole({
        input: {
          accountID: accountId,
          userID: user_id,
          roleName: user_role as RoleName,
        },
      })

      res = updateUserAccountRoleResponse.updateUserAccountRole
      message = `User role was successfully updated to ${user_role}`
      if (!res) {
        throw new Error(`Error updating role ${user_role} for user ${user_id}`)
      }

      await triggerTeamActionNotification({
        accountId,
        type: "updateRole",
        actor: user.user,
        accountName: invitedAccountName,
        targetedUserId: user_id,
        targetedUserEmail: user_email,
        userRole: user_role as RoleName,
      }).catch((error) => {
        // Handle error silently - user will see error message
        message =
          message + ", however something went wrong while sending the notification."
      })
      // send update email?
    }
    if (user_resend) {
      const user_id = formData.get("user_id")
      const user_role = formData.get("user_role")
      const user_email = formData.get("user_email")
      invariant(typeof user_email === "string", "user_email must be set")
      invariant(typeof user_id === "string", "user_id must be set")
      invariant(typeof user_role === "string", "user_email must be set")

      if (kvToken && kvURL) {
        const ratelimit = new Ratelimit({
          redis: kv,
          // rate limit to 1 request per 10 seconds
          limiter: Ratelimit.slidingWindow(1, "10s"),
        })

        const { success } = await ratelimit.limit(`ratelimit_${user.user.portalUserID}`)

        if (!success) {
          throw new Error(`You have reached your request limit`)
        }
      } else {
        console.error(
          "KV_REST_API_URL and KV_REST_API_TOKEN env vars not found, not rate limiting...",
        )
      }

      await triggerTeamActionNotification({
        accountId,
        type: "resend",
        actor: user.user,
        accountName: invitedAccountName,
        targetedUserId: user_id,
        targetedUserEmail: user_email,
        userRole: user_role as RoleName,
      }).catch((error) => {
        // Handle error silently - user will see error message
        message =
          message + ", however something went wrong while sending the notification."
      })

      res = true
      message = `Invite email resent to user ${user_email}`
    }
    if (user_leave) {
      const user_id = formData.get("user_id")
      const user_email = formData.get("user_email")
      invariant(typeof user_id === "string", "user_id must be set")
      invariant(typeof user_email === "string", "user_email must be set")

      const removeAccountUserResponse = await portal.removeAccountUser({
        input: {
          accountID: accountId,
          userID: user_id,
        },
      })

      res = removeAccountUserResponse.removeAccountUser
      message = `You have left account ${invitedAccountName}`
      if (!res) {
        throw new Error(`Error leaving account ${invitedAccountName}`)
      }

      await triggerTeamActionNotification({
        accountId,
        type: "leave",
        actor: user.user,
        accountName: invitedAccountName,
        targetedUserId: user_id,
        targetedUserEmail: user_email,
      }).catch((error) => {
        // Handle error silently - user will see error message
        message =
          message + ", however something went wrong while sending the notification."
      })
    }

    return json<ActionDataStruct<TeamActionData>>({
      data: {
        success: res,
        type,
      },
      error: false,
      message,
    })
  } catch (error) {
    console.error(error)
    return json<ActionDataStruct<TeamActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}
