import {
  ActionIcon,
  Box,
  Burger,
  Button,
  Flex,
  MantineProvider,
  useMantineColorScheme,
} from "@mantine/core"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { BookOpen, Contrast, LifeBuoy } from "lucide-react"
import { DISCORD_PATH, DOCS_PATH } from "~/utils/utils"

import { ColorScheme } from "~/root"
import { NovuNotificationPopover } from "~/components/AppHeader/NovuNotificationPopover"
import { User } from "~/models/portal/sdk"
import { useFetcher } from "@remix-run/react"

type HeaderProps = {
  user?: User
  opened: boolean
  toggle: () => void
}

export const AppHeader = ({ user, opened, toggle }: HeaderProps) => {
  const { colorScheme } = useMantineColorScheme()

  const colorSchemeFetcher = useFetcher({ key: "color-scheme-fetcher" })

  const handleColorSchemeToggle = () => {
    colorSchemeFetcher.submit(
      {
        "color-scheme": colorScheme === "dark" ? "light" : "dark",
      },
      {
        method: "post",
        action: "/api/set-color-scheme",
      },
    )
  }

  return (
    <Flex align="center" h="100%" justify="space-between" px="md" py={40}>
      {/* Left side - Hamburger menu (mobile only) */}
      <Box>
        <MantineProvider forceColorScheme="dark">
          <ActionIcon
            hiddenFrom="sm"
            variant="filled"
            color="green.7"
            size={40}
            onClick={() => {
              toggle()
              trackEvent({
                category: AnalyticCategories.user,
                action: AnalyticActions.user_header_menu,
                label: `${opened ? "Close" : "Open"} menu`,
              })
            }}
            styles={{
              root: {
                color: "white",
              },
            }}
          >
            <Burger opened={opened} size="sm" />
          </ActionIcon>
        </MantineProvider>
      </Box>

      {/* Right side - Navigation buttons */}
      <Flex align="center" gap="sm">
        {/* Mobile: Circular ActionIcon, Desktop: Button with text */}
        <Box hiddenFrom="sm">
          <ActionIcon
            component="a"
            href={DOCS_PATH}
            target="_blank"
            rel="noreferrer"
            variant="filled"
            color="green.7"
            size={40}
            radius="xl"
            styles={{
              root: {
                color: "white",
              },
            }}
          >
            <BookOpen size={16} />
          </ActionIcon>
        </Box>
        <Box visibleFrom="sm">
          <Button
            component="a"
            href={DOCS_PATH}
            target="_blank"
            rel="noreferrer"
            variant="filled"
            color="green.7"
            size="sm"
            leftSection={<BookOpen size={16} />}
            styles={{
              root: {
                color: "white",
              },
            }}
          >
            Docs
          </Button>
        </Box>

        {/* Mobile: Circular ActionIcon, Desktop: Button with text */}
        <Box hiddenFrom="sm">
          <ActionIcon
            component="a"
            href={DISCORD_PATH}
            target="_blank"
            rel="noreferrer"
            variant="filled"
            color="green.7"
            size={40}
            radius="xl"
            styles={{
              root: {
                color: "white",
              },
            }}
          >
            <LifeBuoy size={16} />
          </ActionIcon>
        </Box>
        <Box visibleFrom="sm">
          <Button
            component="a"
            href={DISCORD_PATH}
            target="_blank"
            rel="noreferrer"
            variant="filled"
            color="green.7"
            size="sm"
            leftSection={<LifeBuoy size={16} />}
            styles={{
              root: {
                color: "white",
              },
            }}
          >
            Support
          </Button>
        </Box>
        <ActionIcon
          aria-label="toggle color scheme"
          variant="filled"
          color={colorScheme === "dark" ? "green.7" : "green.7"}
          size={40}
          radius="xl"
          onClick={handleColorSchemeToggle}
          styles={{
            root: {
              color: "white",
            },
          }}
        >
          <Contrast size={16} />
        </ActionIcon>
        {user && (
          <NovuNotificationPopover
            colorScheme={colorScheme as ColorScheme}
            subscriberId={user.portalUserID}
          />
        )}
      </Flex>
    </Flex>
  )
}

export default AppHeader
