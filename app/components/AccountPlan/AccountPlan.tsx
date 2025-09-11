import {
  Card,
  Text,
  Button,
  Badge,
  List,
  Stack,
  Title,
  Box,
  MantineTheme,
} from "@mantine/core"
import { Check } from "lucide-react"
import { PayPlanType } from "~/models/portal/sdk"

type AccountPlanProps = {
  type: PayPlanType.Enterprise | PayPlanType.PlanUnlimited | PayPlanType.PlanFree
  onContinue?: () => void
  disableFree?: boolean
}
//TODO: After portaldb is live, replace with a fetched value from the DB
const UnlimitedList = () => {
  return (
    <List center icon={<Check size="18px" />} size="sm" spacing="xl">
      <List.Item>Unlimited relays per month</List.Item>
      <List.Item>First 1,000,000 relays per month free</List.Item>
      <List.Item>No throughput limit</List.Item>
      <List.Item>Community Discord support</List.Item>
      <List.Item>Access all supported chains</List.Item>
    </List>
  )
}

const FreeList = () => {
  return (
    <List center icon={<Check size="18px" />} size="sm" spacing="xl">
      <List.Item>1,000,000 relays free per month</List.Item>
      <List.Item>Cap at 5,000 Relays per day</List.Item>
      <List.Item>No throughput limit</List.Item>
      <List.Item>Community Discord support</List.Item>
      <List.Item>Access all supported chains</List.Item>
    </List>
  )
}

export const AccountPlan = ({
  type,
  onContinue,
  disableFree = false,
}: AccountPlanProps) => {
  const isUnlimited = type === PayPlanType.PlanUnlimited
  const isFree = type === PayPlanType.PlanFree

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      style={(theme: MantineTheme) => ({
        borderColor: isUnlimited
          ? theme.colors.green[7]
          : "var(--app-shell-border-color)",
      })}
    >
      <Stack align="center" gap="xl" mb="xl">
        <Badge color="gray" variant="outline">
          {isFree && "Free"}
          {isUnlimited && "Unlimited"}
        </Badge>
        <Title order={3}>
          {isFree && "Free"}
          {isUnlimited && "Unlimited"}
        </Title>
      </Stack>
      <Text py="lg" ta="center">
        {isFree &&
          "Enjoy 1,000,000 free relays a month with Grove on the Unstoppable Pocket Network."}
        {isUnlimited && "Unlimited relays with Grove on the Unstoppable Pocket Network."}
      </Text>

      {isFree && (
        <Button
          fullWidth
          color="gray"
          disabled={!!disableFree}
          radius="xl"
          variant={disableFree ? "default" : "outline"}
          onClick={onContinue}
        >
          {disableFree ? "Current plan" : "Continue with Free"}
        </Button>
      )}
      {isUnlimited && (
        <Button fullWidth radius="xl" color="green.7" onClick={onContinue}>
          Continue with Unlimited
        </Button>
      )}

      <Box mt="md">
        {isFree && <FreeList />}
        {isUnlimited && <UnlimitedList />}
      </Box>
    </Card>
  )
}

export default AccountPlan
