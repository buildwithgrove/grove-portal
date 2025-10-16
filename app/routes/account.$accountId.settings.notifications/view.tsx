import { Text, Switch, Group, Stack, Divider } from "@mantine/core"
import { useFetcher } from "@remix-run/react"
import React, { useCallback } from "react"
import useActionNotification, {
  ActionNotificationData,
} from "~/hooks/useActionNotification"
import { Account, RoleName } from "~/models/portal/sdk"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { formatNumberToSICompact } from "~/utils/formattingUtils"
import { FREE_TIER_MONTHLY_RELAY_LIMIT } from "~/utils/planUtils"
import { PortalAccount } from "~/models/portal-db/types"
import { AccountNotification } from "~/models/portal/sdk"

type NotificationLevel = "quarter" | "half" | "threeQuarters" | "full"

const NOTIFICATIONS_ALERT_LEVELS: NotificationLevel[] = [
  "quarter",
  "half",
  "threeQuarters",
  "full",
]

const DEFAULT_ALERT_PERCENTAGES = {
  quarter: false,
  half: false,
  threeQuarters: true,
  full: true,
}

function getUsagePercentage(usageLevel: string): string {
  if (usageLevel === "quarter") {
    return "25%"
  } else if (usageLevel === "half") {
    return "50%"
  } else if (usageLevel === "threeQuarters") {
    return "75%"
  } else {
    return "100%"
  }
}

type NotificationsAlertFormProps = {
  account: PortalAccount
  userRole: RoleName
}

export default function AccountNotificationsView({
  account,
  userRole,
}: NotificationsAlertFormProps) {
  // TODO_IN_THIS_PR(@commoddity): Get notifications from the new portal-db types once SDK regenerated
  // const { notifications } = account
  // For now, we'll use an empty array
  const notifications: AccountNotification[] = []

  const fetcher = useFetcher()
  const fetcherData = fetcher.data as ActionNotificationData
  useActionNotification(fetcherData)

  const notificationEvents = notifications[0]?.notificationSettings?.events

  const getNotificationCheckedState = useCallback(
    (level: NotificationLevel) =>
      Object.keys(notificationEvents).length > 0 &&
        notificationEvents.hasOwnProperty(level)
        ? (notificationEvents[level] as boolean)
        : DEFAULT_ALERT_PERCENTAGES[level],
    [notificationEvents],
  )

  const updateNotification = (level: string, value: string) => {
    const otherNotificationEventsValues = NOTIFICATIONS_ALERT_LEVELS.filter(
      (notificationLevel) => notificationLevel !== level,
    ).reduce(
      (result, notificationLevel) => ({
        ...result,
        [notificationLevel]: getNotificationCheckedState(notificationLevel)
          ? "on"
          : "off",
      }),
      {},
    )

    fetcher.submit(
      {
        [level]: value,
        ...otherNotificationEventsValues,
      },
      {
        method: "POST",
      },
    )
  }

  return (
    <Stack pt={36}>
      <Text pb={16}>
        Set up usage alerts to be warned when you are approaching your monthly relay
        limits. We will send an email when your usage crosses the thresholds specified
        below.
      </Text>
      <Stack gap={32} my={16}>
        {NOTIFICATIONS_ALERT_LEVELS.map((level, index) => (
          <React.Fragment key={level}>
            <Group justify="space-between" px={20}>
              <Text>
                {getUsagePercentage(level)} of{" "}
                {formatNumberToSICompact(FREE_TIER_MONTHLY_RELAY_LIMIT)} relays per month
              </Text>
              <Switch
                defaultChecked={getNotificationCheckedState(level)}
                disabled={userRole === "MEMBER" || fetcher.state !== "idle"}
                name={level}
                onChange={(event) => {
                  updateNotification(level, event.currentTarget.checked ? "on" : "off")
                  trackEvent({
                    category: AnalyticCategories.account,
                    action: AnalyticActions.account_notifications,
                    label: level,
                  })
                }}
              />
            </Group>
            {index !== NOTIFICATIONS_ALERT_LEVELS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Stack>
    </Stack>
  )
}
