import { Button, Divider, Group, Stack, Text } from "@mantine/core"

import { Account } from "~/models/portal/sdk"
import { ArrowUpRight } from "lucide-react"
import { DISCORD_PATH } from "~/utils/utils"
import { Link } from "@remix-run/react"
import React from "react"
import { TitledCard } from "~/components/TitledCard"
import { commify } from "~/utils/formattingUtils"
import { getPlanName } from "~/utils/planUtils"
import { PortalAccount } from "~/models/portal-db/types"
import { toPayPlanType } from "~/utils/planUtils"

interface EnterpriseAccountOverviewCardProps {
  account: PortalAccount
}

export default function EnterpriseAccountOverviewCard({
  account,
}: EnterpriseAccountOverviewCardProps) {
  const cardItems = [
    {
      label: "Plan Type",
      value: getPlanName(toPayPlanType(account.portal_plan_type)),
    },
    {
      label: "Custom Limit",
      value: commify(account.portal_account_user_limit!),
    },
  ]

  return (
    <TitledCard header={() => <Text fw={600}>Current plan</Text>}>
      <Stack px={20} py={10}>
        {cardItems.map(({ label, value }, index) => (
          <React.Fragment key={`${label}-${index}`}>
            <Group justify="space-between" p={12}>
              <Text>{label}</Text> <Text>{value}</Text>
            </Group>
            <Divider />
          </React.Fragment>
        ))}
        <Group grow gap="md">
          <Button
            component={Link}
            rightSection={<ArrowUpRight size={18} />}
            target="_blank"
            to={DISCORD_PATH}
          >
            Discord Support
          </Button>
        </Group>
      </Stack>
    </TitledCard>
  )
}
