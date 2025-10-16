import { Novu } from "@novu/api"
import { PayPlanType, RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"
import { TeamActionType } from "~/routes/account.$accountId.settings.members/action"
import { getRequiredServerEnvVar } from "~/utils/environment"
import { getPlanName } from "~/utils/planUtils"
import { capitalizeFirstLetter } from "~/utils/utils"

// New @novu/api initialization
export const novu = new Novu({
  secretKey: getRequiredServerEnvVar("NOVU_API_KEY"),
})

export const NOTIFICATIONS = { IN_APP_NOTIFICATION: "in-app-notification" }

// Topic recipients enum (may need to be defined manually now)
const TriggerRecipientsTypeEnum = {
  TOPIC: "Topic",
} as const

type NovuNotificationPayload = {
  message: string
  chatMsg?: string
  redirectTo?: string
  emailTitle?: string
  emailBody?: string
  withCta?: boolean
  ctaText?: string
  ctaLink?: string
}

type NotificationTarget = "actor" | "user" | "teamMembers"

type TriggerNotificationBaseProps = {
  actor: AuthPortalUser
  accountId: string
  accountName?: string
}

type TriggerTeamActionNotificationBaseProps = TriggerNotificationBaseProps & {
  targetedUserEmail: string
  targetedUserId: string
}

type TriggerTeamActionNotificationProps = TriggerTeamActionNotificationBaseProps &
  (
    | {
      type: Exclude<TeamActionType, "delete" | "leave">
      userRole: RoleName
    }
    | {
      type: "delete" | "leave"
      userRole?: RoleName
    }
  )

type TriggerSubscriptionActionNotificationProps = Omit<
  TriggerNotificationBaseProps,
  "actor"
> &
  (
    | {
      type: "cancel"
      actor: AuthPortalUser
      planType?: PayPlanType
    }
    | {
      type: "upgrade"
      actor?: AuthPortalUser
      planType: PayPlanType
    }
  )

type GetAccountNotificationPayloadProps = Omit<
  TriggerTeamActionNotificationProps,
  "targetedUserId"
> & {
  target: NotificationTarget
}

const getAccountNotificationPayload = ({
  actor,
  type,
  target,
  userRole,
  accountId,
  accountName,
  targetedUserEmail,
}: GetAccountNotificationPayloadProps): NovuNotificationPayload => {
  switch (type) {
    case "invite":
      if (target === "user") {
        return {
          message: `${actor.portal_user_email} has invited you to account ${accountName ?? accountId
            } as ${userRole === RoleName.Admin ? "an" : "a"} ${capitalizeFirstLetter(
              userRole as RoleName,
            )}`,
          redirectTo: "/user/accounts",
          emailTitle: "Account Invitation",
          emailBody: `${actor.portal_user_email} has invited you to account ${accountName ?? accountId
            } as ${userRole === RoleName.Admin ? "an" : "a"} ${capitalizeFirstLetter(
              userRole as RoleName,
            )}`,
          withCta: true,
          ctaText: "Accept Invitation",
          ctaLink: "https://portal.grove.city/user/accounts",
        }
      } else if (target === "actor") {
        return {
          message: `You have invited user ${targetedUserEmail} to account ${accountName ?? accountId
            }`,
          redirectTo: `/account/${accountId}/settings/members`,
        }
      } else if (target === "teamMembers") {
        return {
          message: `User ${actor.portal_user_email} has invited ${targetedUserEmail} to account ${accountName ?? accountId
            }`,
          redirectTo: `/account/${accountId}/settings/members`,
        }
      }
      break
    case "delete":
      if (target === "user") {
        return {
          message: `You have been removed from ${accountName ?? accountId} by ${actor.portal_user_email
            }".`,
          emailTitle: "Team access removed",
          emailBody: `You are receiving this email to inform that you have been removed from ${accountName ?? accountId
            }. You will not have access to the account anymore.`,
        }
      } else if (target === "actor") {
        return {
          message: `You removed ${targetedUserEmail} from ${accountName ?? accountId}`,
          redirectTo: `/account/${accountId}/settings/members`,
        }
      } else if (target === "teamMembers") {
        return {
          message: `${actor.portal_user_email} has removed ${targetedUserEmail} from ${accountName ?? accountId
            }`,
          redirectTo: `/account/${accountId}/settings/members`,
        }
      }
      break
    case "updateRole":
      if (target === "user") {
        return {
          message: `Your role has been updated on ${accountName ?? accountId
            } to ${capitalizeFirstLetter(userRole as RoleName)}.`,
          redirectTo: `/account/${accountId}/settings/members`,
        }
      } else if (target === "teamMembers") {
        return {
          message: `${targetedUserEmail}'s role on ${accountName ?? accountId
            } has been updated to ${capitalizeFirstLetter(userRole as RoleName)}.`,
          redirectTo: `/account/${accountId}/settings/members`,
        }
      }
      break
    case "resend":
      return {
        message: `${actor.portal_user_email} has invited you to account ${accountName ?? accountId
          } as ${userRole === RoleName.Admin ? "an" : "a"} ${capitalizeFirstLetter(
            userRole as RoleName,
          )}`,
        redirectTo: "/user/accounts",
        emailTitle: "Account Invitation",
        emailBody: `${actor.portal_user_email} has invited you to account ${accountName ?? accountId
          } as ${userRole === RoleName.Admin ? "an" : "a"} ${capitalizeFirstLetter(
            userRole as RoleName,
          )}`,
        withCta: true,
        ctaText: "Accept Invitation",
        ctaLink: "https://portal.grove.city/user/accounts",
      }
    case "leave":
      return {
        message: `You have left account ${accountName ?? accountId}`,
      }
  }

  return { message: "" }
}

export const triggerTeamActionNotification = async ({
  actor,
  type,
  userRole,
  accountId,
  accountName,
  targetedUserId,
  targetedUserEmail,
}: TriggerTeamActionNotificationProps) => {
  switch (type) {
    case "invite":
    case "delete":
      // New API: use triggerBulk with events wrapper
      return await novu.triggerBulk({
        events: [
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              subscriberId: targetedUserId,
              email: targetedUserEmail,
            },
            payload: getAccountNotificationPayload({
              target: "user",
              actor,
              type,
              userRole,
              accountId,
              accountName,
              targetedUserEmail,
            }) as NovuNotificationPayload,
          },
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              subscriberId: actor.portal_user_id,
            },
            payload: getAccountNotificationPayload({
              target: "actor",
              actor,
              type,
              userRole,
              accountId,
              accountName,
              targetedUserEmail,
            }) as NovuNotificationPayload,
          },
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              type: TriggerRecipientsTypeEnum.TOPIC,
              topicKey: accountId,
            },
            actor: { subscriberId: actor.portal_user_id },
            payload: getAccountNotificationPayload({
              target: "teamMembers",
              actor,
              type,
              userRole,
              accountId,
              accountName,
              targetedUserEmail,
            }) as NovuNotificationPayload,
          },
        ],
      })
    case "updateRole":
      return await novu.triggerBulk({
        events: [
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              subscriberId: targetedUserId,
            },
            payload: getAccountNotificationPayload({
              target: "user",
              actor,
              type,
              userRole,
              accountId,
              accountName,
              targetedUserEmail,
            }) as NovuNotificationPayload,
          },
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              type: TriggerRecipientsTypeEnum.TOPIC,
              topicKey: accountId,
            },
            actor: { subscriberId: targetedUserId },
            payload: getAccountNotificationPayload({
              target: "teamMembers",
              actor,
              type,
              userRole,
              accountId,
              accountName,
              targetedUserEmail,
            }) as NovuNotificationPayload,
          },
        ],
      })
    case "resend":
      // New API: workflowId instead of first parameter
      return await novu.trigger({
        workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
        to: {
          subscriberId: targetedUserId,
          email: targetedUserEmail,
        },
        payload: getAccountNotificationPayload({
          target: "user",
          actor,
          type,
          userRole,
          accountId,
          accountName,
          targetedUserEmail,
        }) as NovuNotificationPayload,
      })
    case "leave":
      return await novu.trigger({
        workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
        to: {
          subscriberId: targetedUserId,
        },
        payload: getAccountNotificationPayload({
          target: "user",
          actor,
          type,
          userRole,
          accountId,
          accountName,
          targetedUserEmail,
        }) as NovuNotificationPayload,
      })
  }
}

export const triggerAcceptInvitationNotification = async ({
  actor,
  accountName,
  accountId,
  userRole,
  accepted,
}: TriggerNotificationBaseProps & {
  userRole: RoleName
  accepted: boolean
}) => {
  return accepted
    ? await novu.triggerBulk({
      events: [
        {
          workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
          to: {
            subscriberId: actor.portal_user_id,
          },
          payload: {
            message: `You have joined ${accountName ?? accountId} as ${userRole === RoleName.Admin ? "an" : "a"
              } ${capitalizeFirstLetter(userRole)}`,
            redirectTo: `/account/${accountId}`,
          },
        },
        {
          workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
          to: {
            type: TriggerRecipientsTypeEnum.TOPIC,
            topicKey: accountId,
          },
          actor: { subscriberId: actor.portal_user_id },
          payload: {
            message: `${actor.portal_user_email} has joined ${accountName ?? accountId} as ${userRole === RoleName.Admin ? "an" : "a"
              } ${capitalizeFirstLetter(userRole)}`,
            redirectTo: `/account/${accountId}/settings/members`,
          },
        },
      ],
    })
    : await novu.trigger({
      workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
      to: {
        subscriberId: actor.portal_user_id,
      },
      payload: {
        message: `You have declined the invitation to join ${accountName ?? accountId
          } as ${userRole === RoleName.Admin ? "an" : "a"} ${capitalizeFirstLetter(
            userRole,
          )}`,
      },
    })
}

export const triggerSubscriptionActionNotification = async ({
  type,
  accountName,
  accountId,
  actor,
  planType,
}: TriggerSubscriptionActionNotificationProps) => {
  switch (type) {
    case "cancel":
      return await novu.triggerBulk({
        events: [
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              subscriberId: actor.portal_user_id,
            },
            payload: {
              message: `You have cancelled  ${accountName ?? accountId
                } "Unlimited" subscription.`,
              redirectTo: `/account/${accountId}`,
            },
          },
          {
            workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
            to: {
              type: TriggerRecipientsTypeEnum.TOPIC,
              topicKey: accountId,
            },
            actor: { subscriberId: actor.portal_user_id },
            payload: {
              message: `${actor.portal_user_email} has cancelled ${accountName ?? accountId
                } "Unlimited" subscription.`,
              redirectTo: `/account/${accountId}/settings/members`,
            },
          },
        ],
      })
    case "upgrade":
      return await novu.trigger({
        workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
        to: {
          type: TriggerRecipientsTypeEnum.TOPIC,
          topicKey: accountId,
        },
        payload: {
          message: `${accountId} has been upgraded to ${getPlanName(planType)}`,
          redirectTo: `/account/${accountId}`,
        },
      })
  }
}

export const triggerAppActionNotification = async ({
  actor,
  accountName,
  accountId,
  appId,
  appName,
  appEmoji,
  type,
}: TriggerNotificationBaseProps & {
  appName: string
  appId: string
  appEmoji: string
  type: "create" | "delete"
}) => {
  return await novu.triggerBulk({
    events: [
      {
        workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
        to: {
          subscriberId: actor.portal_user_id,
        },
        payload: {
          message: `${String.fromCodePoint(parseInt(appEmoji, 16))} ${appName} has been ${type === "create" ? "created" : "deleted"
            }.`,
          redirectTo: type === "create" ? `/account/${accountId}/${appId}` : "",
        },
      },
      {
        workflowId: NOTIFICATIONS.IN_APP_NOTIFICATION,
        to: {
          type: TriggerRecipientsTypeEnum.TOPIC,
          topicKey: accountId,
        },
        actor: { subscriberId: actor.portal_user_id },
        payload: {
          message: `${actor.portal_user_email} has ${type === "create" ? "created" : "deleted"
            } ${String.fromCodePoint(parseInt(appEmoji, 16))} ${appName}`,
          redirectTo: type === "create" ? `/account/${accountId}/${appId}` : "",
        },
      },
    ],
  })
}
