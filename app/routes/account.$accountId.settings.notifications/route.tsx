import { ActionFunction, MetaFunction, json } from "@remix-run/node"
import { NotificationEventEnum, NotificationType, RoleName } from "~/models/portal/sdk"

import { AccountIdLoaderData } from "~/routes/account.$accountId/route"
import AccountNotificationsView from "~/routes/account.$accountId.settings.notifications/view"
import { ActionDataStruct } from "~/types/global"
import { getErrorMessage } from "~/utils/catchError"
import { initPortalClient } from "~/models/portal/portal.server"
import invariant from "tiny-invariant"
import { requireUser } from "~/utils/user.server"
import { seo_title_append } from "~/utils/seo"
import { useOutletContext } from "@remix-run/react"

// TODO_TECHDEBT: Ensure that notifications respect the rate limits set in Envoy
// and make this more apparent to the end user
export const meta: MetaFunction = () => {
  return [{ title: `Account Notifications ${seo_title_append}` }]
}

export type AccountNotificationsActionData = {
  success: boolean
}

export const action: ActionFunction = async ({ request, params }) => {
  const { accountId } = params
  invariant(accountId, "account id not found")
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })

  const formData = await request.formData()

  const events = Array.from(formData.keys()).filter(
    (key) => formData.get(key) === "on",
  ) as NotificationEventEnum[]

  try {
    await portal.updateUserAccount({
      input: {
        accountID: accountId,
        notificationSettings: [
          {
            active: true,
            notificationType: NotificationType.Email,
            events: events,
          },
        ],
      },
    })

    return json<ActionDataStruct<AccountNotificationsActionData>>({
      data: {
        success: true,
      },
      error: false,
      message: "Notification setting updated",
    })
  } catch (error) {
    console.error(error)
    return json<ActionDataStruct<AccountNotificationsActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export default function AccountNotifications() {
  const { account } = useOutletContext<AccountIdLoaderData>()

  return <AccountNotificationsView account={account} userRole={RoleName.Admin} />
}
