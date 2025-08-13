import { Stack, Title } from "@mantine/core"
import React from "react"
import { AccountBillingOutletContext } from "~/routes/account.$accountId.billing/route"
import BillingEstimateCard from "~/routes/account.$accountId.billing._index/components/BillingEstimateCard"
import InvoicesDataTable from "~/routes/account.$accountId.billing._index/components/InvoicesDataTable"
import { AccountBillingLoaderData } from "~/routes/account.$accountId.billing._index/route"

export type AccountBillingViewProps = Pick<
  AccountBillingOutletContext,
  "usageRecords" | "userRole" | "subscription"
> &
  AccountBillingLoaderData

export const AccountBillingView = ({
  usageRecords,
  invoices,
  currentMonthRelays,
  subscription,
  upcomingInvoice,
}: AccountBillingViewProps) => {
  return (
    <Stack gap={32}>
      <Title order={2}>Billing</Title>

      <BillingEstimateCard 
        totalRelays={currentMonthRelays} 
        subscription={subscription}
        upcomingInvoice={upcomingInvoice}
      />

      <InvoicesDataTable invoices={invoices} usageRecords={usageRecords} />
    </Stack>
  )
}

export default AccountBillingView
