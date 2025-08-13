import { Divider, Button, Group, Text, Stack } from "@mantine/core"
import { Link } from "@remix-run/react"
import { ArrowUpRight } from "lucide-react"
import { TitledCard } from "~/components/TitledCard"
import { Account } from "~/models/portal/sdk"
import { commify } from "~/utils/formattingUtils"
import { getPlanName } from "~/utils/planUtils"
import { DISCORD_PATH } from "~/utils/utils"

interface EnterpriseAccountOverviewCardProps {
  account: Account
}

export default function EnterpriseAccountOverviewCard({
  account,
}: EnterpriseAccountOverviewCardProps) {
  const cardItems = [
    {
      label: "Plan Type",
      value: getPlanName(account.planType),
    },
    {
      label: "Custom Limit",
      value: commify(account.enterpriseLimit),
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
