import { Container, Stack, Title } from "@mantine/core"
import React, { useMemo } from "react"
import LinkTabs from "~/components/LinkTabs"
import { Account, PayPlanType, RoleName } from "~/models/portal/sdk"

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
      ...[
        {
          to: "",
          label: "Account",
          end: true,
        },
        {
          to: "members",
          label: "Members",
        },
        {
          to: "plan",
          label: "Plan",
        },
      ],
      ...(account.planType === PayPlanType.PlanFree ||
      userRole === RoleName.Admin ||
      userRole === RoleName.Owner
        ? [
            {
              to: "notifications",
              label: "Notifications",
            },
          ]
        : []),
    ]
  }, [account, userRole])

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
