import { Stack, Text, Title } from "@mantine/core"
import { AccountBillingOutletContext } from "~/routes/account.$accountId.billing/route"
import InvoiceHeader from "~/routes/account.$accountId.billing.$invoiceId/components/InvoiceHeader"
import InvoicePaymentMethod from "~/routes/account.$accountId.billing.$invoiceId/components/InvoicePaymentMethod"
import InvoicePaymentOverview from "~/routes/account.$accountId.billing.$invoiceId/components/InvoicePaymentOverview"
import BillingCycleUsageDataTable from "~/routes/account.$accountId.billing.$invoiceId/components/InvoiceUsageDataTable"
import { InvoiceLoaderData } from "~/routes/account.$accountId.billing.$invoiceId/route"
import { InvoiceUsageData } from "~/types/stripe-custom"

export type InvoiceViewProps = Pick<
  AccountBillingOutletContext,
  "account" | "blockchains" | "usageRecords"
> &
  InvoiceLoaderData

export const InvoiceView = ({
  account,
  blockchains,
  charge,
  invoice,
  usageRecords,
  invoiceUsageStats,
}: InvoiceViewProps) => {
  return (
    <Stack gap={54}>
      <InvoiceHeader charge={charge} invoice={invoice} />
      {charge ? <InvoicePaymentMethod charge={charge} /> : null}
      {invoice ? (
        <InvoicePaymentOverview
          invoice={invoice}
          planType={account.planType}
          usageRecords={usageRecords}
        />
      ) : null}

      {invoiceUsageStats && invoiceUsageStats.length > 0 ? (
        <Stack>
          <Stack gap={5}>
            <Title order={6}>Total Billing Cycle Usage</Title>
            <Text c="dimmed">This includes billed and free relays.</Text>
          </Stack>
          <BillingCycleUsageDataTable
            account={account}
            blockchains={blockchains}
            invoiceUsageStats={invoiceUsageStats}
          />
        </Stack>
      ) : null}
    </Stack>
  )
}

export default InvoiceView
