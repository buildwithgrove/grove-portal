import { AppShell, Container } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import React, { ReactNode } from "react"
import { AppHeader } from "~/components/AppHeader"
import { Sidebar } from "~/components/Sidebar"
import { Account, RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"
import { useRoot } from "~/root/hooks/useRoot"

type RootAppShellProps = {
  account?: Account
  accounts: Account[]
  children: ReactNode
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
  userRole?: RoleName
}

export const RootAppShell = ({
  user,
  account,
  children,
  accounts,
  userRole,
}: RootAppShellProps) => {
  const [opened, { toggle }] = useDisclosure()
  const { hideSidebar } = useRoot({ user })
  return (
    <AppShell
      header={{ height: 60 }}
      layout="alt"
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: hideSidebar || !opened, desktop: hideSidebar },
      }}
      padding="xs"
      pb={50}
    >
      <AppShell.Header withBorder={false}>
        <AppHeader opened={opened} toggle={toggle} user={user} />
      </AppShell.Header>
      {account && userRole && (
        <Sidebar
          account={account}
          accounts={accounts}
          toggle={toggle}
          userRole={userRole}
          user={user}
        />
      )}
      <AppShell.Main>
        <Container size="lg">{children}</Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default RootAppShell
