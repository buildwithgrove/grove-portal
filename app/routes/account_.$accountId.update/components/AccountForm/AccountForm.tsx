import { Button, Divider, Group, Stack, NumberInput, TextInput } from "@mantine/core"
import { Form, NavLink, useParams } from "@remix-run/react"
import { useState } from "react"
import RouteModal from "~/components/RouteModal"
import { Account } from "~/models/portal/sdk"
import type { PayPlanType, PortalAccount } from "~/models/portal-db/types"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { commify } from "~/utils/formattingUtils"
import { isUnlimitedPlan, toPayPlanType } from "~/utils/planUtils"

type AccountFormProps = {
  account: PortalAccount
  redirectTo: string | null
  onSubmit: (formData: FormData) => void
}

function EnableUpdate(name: string, monthlyRelayLimit: number, account: PortalAccount) {
  return (
    (name !== "" && name !== account.user_account_name) ||
    monthlyRelayLimit !== account.portal_account_user_limit
  )
}

const AccountForm = ({ account, redirectTo, onSubmit }: AccountFormProps) => {
  const { accountId } = useParams()
  const closeButtonRedirect = redirectTo ?? `/account/${accountId}/settings`
  const [name, setName] = useState(account?.user_account_name ?? "")
  const [monthlyRelayLimit, setMonthlyRelayLimit] = useState(
    account?.portal_account_user_limit ?? 0,
  )

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(formData)
  }

  return (
    <Stack>
      <Form method="post" onSubmit={handleSubmit}>
        <RouteModal.Header
          closeButtonLink={closeButtonRedirect}
          description="An accurate account name helps team members identify their workspace. Ensure
          it's current and relevant by updating it here."
          title="Account Name"
        />
        <Stack gap="md" mt="sm">
          <TextInput
            required
            defaultValue={name}
            description="Required"
            fw={600}
            label="Name"
            maxLength={20}
            name="account_name"
            w="200px"
            onChange={(e) => setName(e.target.value)}
          />
        </Stack>
        <Divider mb="md" mt="xl" />
        {isUnlimitedPlan(toPayPlanType(account.portal_plan_type)) && (
          <>
            <RouteModal.Header
              closeButtonLink={closeButtonRedirect}
              description={`Set a monthly relay limit to avoid extra charges. Your account will stop working once you hit this limit and will resume at the start of the next calendar month. The limit must be set in multiples of 1,000,000. ${account.portal_account_user_limit! > 0
                ? `Your current limit is ${commify(
                  account.portal_account_user_limit!,
                )} relays per month.`
                : ""
                }`}
              title="Monthly Relay Limit"
            />
            <Stack gap="md" mt="sm">
              <NumberInput
                allowDecimal={false}
                allowNegative={false}
                defaultValue={monthlyRelayLimit}
                description="Optional"
                fw={600}
                label="Monthly Relay Limit"
                name="monthly_relay_limit"
                step={1000000}
                thousandSeparator=","
                w="200px"
                onChange={(value) => setMonthlyRelayLimit(Number(value))}
              />
            </Stack>
            <Divider my={32} />
          </>
        )}
        <Group justify="right">
          <Button
            color="gray"
            component={NavLink}
            fw={400}
            fz="sm"
            to={closeButtonRedirect}
            type="button"
            variant="outline"
            w="156px"
          >
            Discard
          </Button>
          <Button
            disabled={!EnableUpdate(name, monthlyRelayLimit, account)}
            fw={400}
            fz="sm"
            px="xs"
            type="submit"
            w="156px"
            onClick={() => {
              trackEvent({
                category: AnalyticCategories.app,
                action: AnalyticActions.account_update,
                label: account.portal_account_id,
              })
            }}
          >
            Update
          </Button>
        </Group>
      </Form>
    </Stack>
  )
}

export default AccountForm
