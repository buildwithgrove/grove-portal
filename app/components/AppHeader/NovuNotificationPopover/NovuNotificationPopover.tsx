import { ActionIcon, Indicator, useMantineTheme } from "@mantine/core"
import { Inbox } from "@novu/react"
import { useNavigate } from "@remix-run/react"
import { Bell } from "lucide-react"
import { useState } from "react"
import { ColorScheme } from "~/root"
import { getRequiredClientEnvVar } from "~/utils/environment"

const NOVU_APP_IDENTIFIER = getRequiredClientEnvVar("NOVU_APP_IDENTIFIER")

type NovuNotificationPopoverProps = {
  subscriberId: string
  colorScheme: ColorScheme
}

export const NovuNotificationPopover = ({
  subscriberId,
  colorScheme,
}: NovuNotificationPopoverProps) => {
  const navigate = useNavigate()
  const theme = useMantineTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Handle notification clicks
  const handleNotificationClick = (notification: any) => {
    const { payload } = notification
    const redirectUrl = payload.redirectTo
    if (redirectUrl) {
      navigate(redirectUrl)
    }
  }

  return (
    <div>
      <Inbox
        applicationIdentifier={NOVU_APP_IDENTIFIER}
        subscriberId={subscriberId}
        open={isOpen}
        onNotificationClick={handleNotificationClick}
        appearance={
          {
            elements: {
              bellIcon: {
                // Hide the default bell since we're using a custom one
                display: "none",
              },
              popover: {
                background: "var(--mantine-color-body)",
                border: "1px solid var(--app-shell-border-color)",
                boxShadow: "none",
              },
              popoverArrow: {
                display: "none",
              },
              notificationItem: {
                color: "var(--mantine-color-text)",
                ...(colorScheme === "dark"
                  ? { backgroundColor: theme.colors.dark[7] }
                  : {}),
              },
              notificationItemRead: {
                ...(colorScheme === "dark"
                  ? { backgroundColor: theme.colors.gray[9] }
                  : {}),
              },
              notificationItemUnread: {
                ...(colorScheme === "dark"
                  ? { backgroundColor: theme.colors.dark[7] }
                  : {}),
                borderLeft: "4px solid",
                borderLeftColor: theme.colors.green[6],
              },
              unseenBadge: {
                background:
                  "linear-gradient(0deg, rgba(56,159,88,1) 20%, rgba(70,189,107,1) 80%)",
              },
            },
          } as any
        }
        renderBell={(unreadCount: number) => (
          <Indicator
            inline
            processing
            color="red"
            disabled={!unreadCount}
            offset={6}
            size={8}
          >
            <ActionIcon
              aria-label={`${
                unreadCount ? unreadCount : "No"
              } unread notifications. Click to open notifications popover.`}
              variant="default"
              color="gray"
              radius="xl"
              size={40}
              onClick={() => setIsOpen(!isOpen)}
              styles={(theme) => ({
                root: {
                  boxShadow: `inset 0 0 0 1px ${
                    colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
                  }`,
                  color:
                    colorScheme === "dark" ? theme.colors.gray[2] : theme.colors.dark[6],
                  backgroundColor:
                    colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
                  padding: "15px",
                  backgroundClip: "content-box",

                  "&:hover": {
                    backgroundColor:
                      colorScheme === "dark"
                        ? theme.colors.dark[6]
                        : theme.colors.gray[0],
                  },
                },
              })}
            >
              <Bell size={18} />
            </ActionIcon>
          </Indicator>
        )}
      />
    </div>
  )
}

export default NovuNotificationPopover
