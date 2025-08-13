import { Button, Divider, Group, Stack, Text, Title } from "@mantine/core"
import { NavLink, useParams } from "@remix-run/react"
import { ArrowLeft } from "lucide-react"
import { Stripe } from "~/models/stripe/stripe.server"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { formatStripeDate } from "~/utils/billingUtils"

type InvoiceHeaderProps = {
  invoice: Stripe.Invoice
  charge?: Stripe.Charge
}
const InvoiceHeader = ({ invoice, charge }: InvoiceHeaderProps) => {
  const { accountId } = useParams()

  return (
    <Stack gap="xl" justify="center">
      <Button
        color="gray"
        component={NavLink}
        leftSection={<ArrowLeft size={18} />}
        ml={-8}
        mr="auto"
        size="compact-sm"
        to=".."
        variant="subtle"
      >
        Back to Billing
      </Button>
      <Group justify="space-between">
        <Stack gap={5}>
          <Title order={2}>Invoice {invoice?.number} </Title>
          <Text>
            {formatStripeDate(invoice.period_start)} -{" "}
            {formatStripeDate(invoice.period_end, "Do MMM YYYY")}
          </Text>
        </Stack>
        <Group
          gap={0}
          style={{
            border: "1px solid var(--app-shell-border-color)",
            borderRadius: 4,
          }}
        >
          <Button
            color="gray"
            component="a"
            href={invoice?.invoice_pdf ?? ""}
            rel="noreferrer"
            target="_blank"
            variant="subtle"
            onClick={() => {
              trackEvent({
                category: AnalyticCategories.account,
                action: AnalyticActions.account_billing_invoice_download,
                label: `Account: ${accountId} / Invoice: ${invoice.id}`,
              })
            }}
          >
            Download
          </Button>
          {invoice.status !== "paid" ? (
            <>
              <Divider orientation="vertical" />
              <Button
                color="gray"
                component="a"
                href={invoice?.hosted_invoice_url ?? ""}
                rel="noreferrer"
                target="_blank"
                variant="subtle"
                onClick={() => {
                  trackEvent({
                    category: AnalyticCategories.account,
                    action: AnalyticActions.account_billing_invoice_pay,
                    label: `Account: ${accountId} / Invoice: ${invoice.id}`,
                  })
                }}
              >
                Pay Invoice
              </Button>
            </>
          ) : null}
          {charge?.receipt_url ? (
            <>
              <Divider orientation="vertical" />
              <Button
                color="gray"
                component="a"
                href={charge?.receipt_url ?? ""}
                rel="noreferrer"
                target="_blank"
                variant="subtle"
                onClick={() => {
                  trackEvent({
                    category: AnalyticCategories.account,
                    action: AnalyticActions.account_billing_receipt_view,
                    label: `Account: ${accountId} / Invoice: ${invoice.id}`,
                  })
                }}
              >
                View Receipt
              </Button>
            </>
          ) : null}
        </Group>
      </Group>
    </Stack>
  )
}

export default InvoiceHeader
