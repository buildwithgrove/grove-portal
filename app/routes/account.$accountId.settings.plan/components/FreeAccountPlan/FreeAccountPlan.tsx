import { SimpleGrid, Stack, Text, Title } from "@mantine/core"
import { useNavigate } from "@remix-run/react"
import { AccountPlan } from "~/components/AccountPlan"
import { PayPlanType } from "~/models/portal/sdk"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { getPlanName } from "~/utils/planUtils"
import { PortalAccount } from "~/models/portal-db/types"
import { toPayPlanType } from "~/utils/planUtils"

type FreeAccountPlanProps = {
  account: PortalAccount
}

const FreeAccountPlan = ({ account }: FreeAccountPlanProps) => {
  const navigate = useNavigate()

  return (
    <Stack align="center" mt={"xl"}>
      <Stack gap="xs" ta="center">
        <Title order={2}>Upgrade your plan</Title>
        <Text>
          Your current plan is {getPlanName(toPayPlanType(account.portal_plan_type))}. <br /> Upgrade now to
          Unlimited.
        </Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <AccountPlan disableFree type={PayPlanType.PlanFree} />
        <AccountPlan
          type={PayPlanType.PlanUnlimited}
          onContinue={() => {
            trackEvent({
              category: AnalyticCategories.account,
              action: AnalyticActions.account_plan_upgrade,
              label: account.portal_account_id,
            })
            navigate(`/api/stripe/checkout-session?account-id=${account.portal_account_id}`)
          }}
        />
      </SimpleGrid>
    </Stack>
  )
}

export default FreeAccountPlan
