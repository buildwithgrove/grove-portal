import { ActionIcon, Burger, Button, Flex, useMantineColorScheme } from "@mantine/core"
import { useFetcher } from "@remix-run/react"
import { BookOpen, Contrast, LifeBuoy } from "lucide-react"
import React from "react"
import AccountDrawer from "~/components/AccountDrawer"
import { NovuNotificationPopover } from "~/components/AppHeader/NovuNotificationPopover"
import { Account, User } from "~/models/portal/sdk"
import { ColorScheme } from "~/root"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { DISCORD_PATH, DOCS_PATH } from "~/utils/utils"

type HeaderProps = {
  user?: User
  accounts: Account[]
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
    <Flex align="center" gap="sm" h="100%" justify="flex-end" px="md" py={40}>
      <ActionIcon
        hiddenFrom="sm"
        variant="filled"
        color="green"
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
            color: 'white',
          }
        }}
      >
        <Burger opened={opened} size="sm" />
      </ActionIcon>
      <Button
        component="a"
        href={DOCS_PATH}
        target="_blank"
        rel="noreferrer"
        variant="filled"
        color="green"
        size="sm"
        leftSection={<BookOpen size={16} />}
        styles={{
          root: {
            color: 'white',
          }
        }}
      >
        Docs
      </Button>
      <Button
        component="a"
        href={DISCORD_PATH}
        target="_blank"
        rel="noreferrer"
        variant="filled"
        color="green"
        size="sm"
        leftSection={<LifeBuoy size={16} />}
        styles={{
          root: {
            color: 'white',
          }
        }}
      >
        Support
      </Button>
      <ActionIcon
        aria-label="toggle color scheme"
        variant="filled"
        color="green"
        size={40}
        radius="xl"
        onClick={handleColorSchemeToggle}
        styles={{
          root: {
            color: 'white',
          }
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
  )
}

export default AppHeader
