import { Account, RoleName } from "~/models/portal/sdk"
import { Container, Stack, Title } from "@mantine/core"
import React, { useMemo } from "react"

import LinkTabs from "~/components/LinkTabs"

type AccountSettingsLayoutViewProps = {
  account: Account
  userRole: RoleName
  children: React.ReactNode
}

export default function AccountSettingsLayoutView({
  account,
  userRole,
  children,
}: AccountSettingsLayoutViewProps) {
  const routes = useMemo(() => {
    return [
      {
        to: "",
        label: "Account",
        end: true,
      },
      {
        to: "members",
        label: "Members",
      },
      ...(userRole === RoleName.Admin || userRole === RoleName.Owner
        ? [
            {
              to: "notifications",
              label: "Notifications",
            },
          ]
        : []),
    ]
  }, [userRole])

  return (
    <Container fluid px={0}>
      <Stack gap="xl">
        <Title order={2}>Settings & members</Title>
        <LinkTabs routes={routes} />
      </Stack>
      {children}
    </Container>
  )
}
