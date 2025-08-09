import { Avatar, Badge, Box, CopyButton, Group, Menu, Text, Tooltip } from "@mantine/core"
import { Link } from "@remix-run/react"
import { Emoji } from "emoji-picker-react"
import { Pencil } from "lucide-react"
import ContextMenuTarget from "~/components/ContextMenuTarget"
import { PortalApp, RoleName } from "~/models/portal/sdk"
import DeleteApplication from "~/routes/account.$accountId.$appId/components/DeleteApplication"
import { DEFAULT_APPMOJI } from "~/routes/account_.$accountId.create/components/AppmojiPicker"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

type ApplicationHeaderProps = {
  app: PortalApp
  userRole: RoleName
}

const ApplicationHeader = ({ app, userRole }: ApplicationHeaderProps) => {
  return (
    <Group justify="space-between" mb="lg">
      <Group gap="sm">
        <Avatar color="dark" radius="sm" size="lg">
          <Emoji
            size={32}
            unified={app.appEmoji !== "" ? app.appEmoji : DEFAULT_APPMOJI}
          />
        </Avatar>
        <Box>
          <Text fw={600} fz={24}>
            {app.name}
          </Text>
          <Group gap={4}>
            <Text>App ID</Text>
            <CopyButton value={app.id}>
              {({ copied, copy }) => (
                <Tooltip withArrow label={copied ? "Copied" : "Copy"}>
                  <Badge
                    color={copied ? "green.7" : "gray"}
                    data-outline-exclude={copied ? "true" : "false"}
                    px={6}
                    radius="sm"
                    style={{ cursor: "pointer" }}
                    tt="lowercase"
                    variant={"outline"}
                    onClick={() => {
                      copy()
                      trackEvent({
                        category: AnalyticCategories.app,
                        action: AnalyticActions.app_copy_id,
                        label: app.id,
                      })
                    }}
                  >
                    {app.id}
                  </Badge>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Box>
      </Group>

      {userRole !== "MEMBER" && (
        <Menu>
          <ContextMenuTarget />
          <Menu.Dropdown>
            <Menu.Item component={Link} leftSection={<Pencil size={18} />} to={`update`}>
              Edit information
            </Menu.Item>
            <DeleteApplication app={app} />
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  )
}

export default ApplicationHeader
