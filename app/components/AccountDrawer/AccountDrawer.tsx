import {
  Divider,
  Drawer,
  Group,
  NavLink,
  NavLinkProps,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core"
import { Link, LinkProps, useFetcher } from "@remix-run/react"
import {
  BookOpen,
  Leaf,
  LifeBuoy,
  Smile,
  TowerControl,
  User,
  MessageCircleMore,
} from "lucide-react"
import React, { useState } from "react"
import classes from "./AccountDrawer.module.css"
import Identicon from "~/components/Identicon"
import type { User as UserType } from "~/models/portal/sdk"
import { DISCORD_PATH, DOCS_PATH } from "~/utils/utils"
type AccountDrawerProps = {
  user?: UserType
}

type DrawerLinkProps = NavLinkProps &
  LinkProps & {
    external?: boolean
    setIsDrawerOpen: (isOpen: boolean) => void
  }

const DrawerLink = ({ setIsDrawerOpen, external, ...props }: DrawerLinkProps) => {
  const externalProps = external ? { rel: "noreferrer", target: "_blank" } : {}
  return (
    <NavLink
      aria-label={String(props.label)}
      component={Link}
      label={props.label}
      p={8}
      prefetch="intent"
      {...props}
      {...externalProps}
      className={classes.drawerLink}
      onClick={() => setIsDrawerOpen(false)}
    />
  )
}

const drawerExternalLinks = [
  {
    label: "Feedback",
    to: DISCORD_PATH,
    icon: <Smile size={18} />,
    withDivider: true,
  },
  { label: "About Grove", to: "https://grove.city/", icon: <Leaf size={18} /> },
  {
    label: "Join the conversation",
    to: DISCORD_PATH,
    icon: <MessageCircleMore size={18} />,
    withDivider: true,
  },
]

const AccountDrawer = ({ user }: AccountDrawerProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const logoutFetcher = useFetcher()

  const logout = () => {
    setIsDrawerOpen(false)
    logoutFetcher.submit(
      {
        logout: "true",
      },
      {
        method: "post",
        action: "/api/auth/auth0",
      },
    )
  }

  return user ? (
    <>
      <Drawer
        opened={isDrawerOpen}
        padding="sm"
        position="right"
        title={
          <Group pt={4} w={252} wrap="nowrap">
            <Identicon
              avatar
              alt={`${user.portalUserID ?? "user"} profile picture`}
              seed={user.portalUserID ?? "user default"}
              type="user"
            />
            <Text truncate fz={12}>
              {user?.email}
            </Text>
          </Group>
        }
        onClose={() => setIsDrawerOpen(false)}
      >
        <Stack gap={0}>
          {drawerExternalLinks.map(({ label, to, icon, withDivider }, index) => (
            <React.Fragment key={`${label}-${index}`}>
              <DrawerLink
                external
                label={label}
                leftSection={icon}
                setIsDrawerOpen={setIsDrawerOpen}
                to={to}
              />
              {withDivider && <Divider my={8} />}
            </React.Fragment>
          ))}
        </Stack>
      </Drawer>
      <UnstyledButton onClick={() => setIsDrawerOpen(true)}>
        <Identicon
          avatar
          alt={`${user.portalUserID ?? "user"} profile picture`}
          seed={user.portalUserID ?? "user default"}
          type="user"
        />
      </UnstyledButton>
    </>
  ) : null
}

export default AccountDrawer
