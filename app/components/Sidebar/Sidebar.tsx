import { AppShell, Box, Burger, Divider, Group, ScrollArea, Text, Stack } from "@mantine/core"
import { Link, useParams, useFetcher } from "@remix-run/react"
import { Plus, User, TowerControl, LogOut } from "lucide-react"
import React, { useMemo, useState } from "react"
import AccountSelect from "~/components/AccountSelect"
import GroveLogo from "~/components/GroveLogo"
import Identicon from "~/components/Identicon"
import {
  InternalLink,
  SidebarApps,
  SidebarNavRoute,
  NavButton,
} from "~/components/Sidebar/components"
import { Account, PayPlanType, PortalApp, RoleName, User as UserType } from "~/models/portal/sdk"

type SidebarProps = {
  account: Account
  accounts: Account[]
  userRole: RoleName
  toggle: () => void
  user: UserType
}

const getAccountRoutes = (
  activeAccount: Account,
  userRole: RoleName,
): SidebarNavRoute[] => {
  const isFreeAccount = activeAccount?.planType === PayPlanType.PlanFree
  return [
    ...(isFreeAccount && userRole !== RoleName.Member
      ? [
          {
            to: `/account/${activeAccount?.id}/upgrade`,
            label: "Upgrade to Unlimited",
            end: true,
          },
        ]
      : []),
    {
      to: `/account/${activeAccount?.id}`,
      label: "Insights",
      end: true,
    },
    {
      to: `/account/${activeAccount?.id}/logs`,
      label: "Logs",
      end: true,
    },
    {
      to: `/account/${activeAccount?.id}/sandbox`,
      label: "Sandbox",
      end: true,
    },
    ...(!isFreeAccount && userRole !== RoleName.Member
      ? [
          {
            to: `/account/${activeAccount?.id}/billing`,
            label: "Billing",
          },
        ]
      : []),
    {
      to: `/account/${activeAccount?.id}/settings`,
      label: "Account Settings",
    },
  ]
}

export const Sidebar = ({ account, userRole, accounts, toggle, user }: SidebarProps) => {
  const { accountId } = useParams()
  const logoutFetcher = useFetcher()
  
  const accountRoutes = useMemo(() => {
    return getAccountRoutes(account, userRole)
  }, [account, userRole])

  const canCreateApps = userRole !== RoleName.Member
  const { portalApps: apps } = account

  const logout = () => {
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

  return (
    <AppShell.Navbar p={8} pt={18}>
      <Stack gap="md">
        <Group>
          <Burger
            opened
            hiddenFrom="sm"
            size="sm"
            onClick={() => {
              toggle()
            }}
          />
        </Group>
        
        {/* ACCOUNT HEADER */}
        <Stack gap="sm">
          <Text size="sm" fw={600} c="green.6" pl={8}>
            Account
          </Text>
          <AccountSelect accounts={accounts} />
        </Stack>
      </Stack>
      
      <ScrollArea h="100%" mt="lg">
        {/* ACCOUNT SECTION */}
        <AppShell.Section>
          {accountRoutes.map((route, index) => (
            <InternalLink key={`${route.label}-${index}`} route={route} />
          ))}
        </AppShell.Section>

        <Divider my="lg" />

        {/* APPLICATIONS SECTION */}
        <AppShell.Section>
          <Text size="sm" fw={600} c="green.6" mb="sm" ml={8}>
            Applications
          </Text>
          <Box>
            {apps && <SidebarApps apps={apps as PortalApp[]} />}
            {canCreateApps && (
              <Box mt="xs">
                <InternalLink
                  route={{
                    to: `/account/${accountId}/create`,
                    label: "New Application",
                    icon: Plus,
                    end: true,
                  }}
                />
              </Box>
            )}
          </Box>
        </AppShell.Section>

        <Divider my="lg" />

        {/* USER SECTION */}
        <AppShell.Section>
          <Text size="sm" fw={600} c="green.6" mb="sm" ml={8}>
            User
          </Text>
          <Stack gap={0}>
            <Box p={8} mb="xs">
              <Group gap="xs" align="center">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '4px',
                    backgroundColor: 'var(--mantine-color-blue-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Box>
                <Stack gap={2} flex={1} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={500} truncate>
                    {user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user?.email || 'No email'}
                  </Text>
                </Stack>
              </Group>
            </Box>
            <InternalLink
              route={{
                to: "/user",
                label: "My Profile",
                icon: User,
              }}
            />
            <InternalLink
              route={{
                to: "/user/accounts",
                label: "My Accounts",
                icon: TowerControl,
              }}
            />
            <NavButton
              icon={LogOut}
              label="Sign Out"
              onClick={logout}
            />
          </Stack>
        </AppShell.Section>
      </ScrollArea>
      <Box ml={10}>
        <Link to={`/account/${accountId}`}>
          <GroveLogo />
        </Link>
      </Box>
    </AppShell.Navbar>
  )
}

export default Sidebar
