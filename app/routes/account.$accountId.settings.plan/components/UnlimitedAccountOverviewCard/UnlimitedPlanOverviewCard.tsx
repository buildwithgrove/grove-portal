import { Divider, Button, Group, Text, Stack, Box, Grid, SimpleGrid } from "@mantine/core"
import { Form, useLocation } from "@remix-run/react"
import { ArrowUpRight, Circle } from "lucide-react"
import { TitledCard } from "~/components/TitledCard"
import { Account, RoleName } from "~/models/portal/sdk"
import { Stripe } from "~/models/stripe/stripe.server"
import useSubscriptionModals from "~/routes/account.$accountId.settings.plan/hooks/useSubscriptionModals"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { formatTimestampShort } from "~/utils/dayjs"
import { getPlanName } from "~/utils/planUtils"
import { capitalizeFirstLetter } from "~/utils/utils"

interface UnlimitedPlanOverviewCardProps {
  account: Account
  userRole: RoleName
  subscription?: Stripe.Subscription
}

export default function UnlimitedPlanOverviewCard({
  account,
  userRole,
  subscription,
}: UnlimitedPlanOverviewCardProps) {
  const location = useLocation()
  const { openStopSubscriptionModal } = useSubscriptionModals()

  const accountPlanType = account.planType

  return (
    <TitledCard header={() => <Text fw={600}>Current plan</Text>}>
      <Stack pt={22} px={20}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={40}>
          <Stack gap={12}>
            <Group justify="space-between">
              <Text>Plan Type</Text> <Text>{getPlanName(accountPlanType)}</Text>
            </Group>
            <Divider />
            {subscription && (
              <>
                <Group justify="space-between">
                  <Text>Subscription</Text> <Text>{subscription.id}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text>Start date</Text>
                  <Text>{formatTimestampShort(subscription.start_date)}</Text>
                </Group>
                <Divider />
              </>
            )}
          </Stack>

          <Stack gap={12}>
            <Group justify="space-between">
              <Text>Your role</Text> <Text>{capitalizeFirstLetter(userRole)}</Text>
            </Group>
            <Divider />
            <Group justify="space-between">
              <Text>Free Monthly Relays</Text> <Text>1,000,000</Text>
            </Group>
            <Divider />
          </Stack>
        </SimpleGrid>

        {userRole !== RoleName.Member && (
          <Box mt="auto">
            <Form action={`/api/stripe/portal-session/${account.id}`} method="post">
              <input hidden defaultValue={location.pathname} name="return-path" />
              {subscription && (
                <input hidden defaultValue={subscription.id} name="subscription-id" />
              )}
              <Grid gutter="sm" justify="flex-end">
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Button
                    fullWidth
                    color="gray"
                    rightSection={<Circle size={18} />}
                    type="button"
                    variant="outline"
                    onClick={() => openStopSubscriptionModal(account)}
                  >
                    Stop subscription
                  </Button>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Button
                    fullWidth
                    color="green.7"
                    rightSection={<ArrowUpRight size={18} />}
                    type="submit"
                    onClick={() => {
                      trackEvent({
                        category: AnalyticCategories.account,
                        action: AnalyticActions.account_plan_manage,
                        label: account.id,
                      })
                    }}
                  >
                    Manage in Stripe
                  </Button>
                </Grid.Col>
              </Grid>
            </Form>
          </Box>
        )}
      </Stack>
    </TitledCard>
  )
}
