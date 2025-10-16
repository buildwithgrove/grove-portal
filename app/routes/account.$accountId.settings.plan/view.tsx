import { Box } from "@mantine/core"
import EnterpriseAccountOverviewCard from "./components/EnterpriseAccountOverviewCard"
import FreeAccountPlan from "./components/FreeAccountPlan"
import UnlimitedPlanOverviewCard from "./components/UnlimitedAccountOverviewCard"
import { AccountPlanLoaderData } from "./route"
import { RoleName } from "~/models/portal/sdk"
import { toPayPlanType } from "~/utils/planUtils"
import { PayPlanType } from "~/models/portal-db/types"

export type AccountPlanViewProps = AccountPlanLoaderData & { userRole: RoleName }

export const AccountPlanView = ({
  accountData,
  subscription,
  userRole,
}: AccountPlanViewProps) => {
  const account = accountData.account
  const accountPlanType = toPayPlanType(account.portal_plan_type)

  // TODO_IN_THIS_PR(@commoddity): These components still expect GraphQL Account type
  // Need to update FreeAccountPlan, UnlimitedPlanOverviewCard, EnterpriseAccountOverviewCard
  // to accept PortalAccount instead of Account
  return (
    <Box py={20}>
      {accountPlanType === PayPlanType.PlanFree && <FreeAccountPlan account={account} />}

      {accountPlanType === PayPlanType.PlanUnlimited && (
        <UnlimitedPlanOverviewCard
          account={account}
          subscription={subscription}
          userRole={userRole}
        />
      )}

      {accountPlanType === PayPlanType.Enterprise && (
        <EnterpriseAccountOverviewCard account={account} />
      )}
    </Box>
  )
}

export default AccountPlanView
