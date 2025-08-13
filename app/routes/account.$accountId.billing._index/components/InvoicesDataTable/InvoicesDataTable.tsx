import { Button, Menu, NumberFormatter, Text } from "@mantine/core"
import { useNavigate, useParams } from "@remix-run/react"
import { DataTable } from "mantine-datatable"
import ContextMenuTarget from "~/components/ContextMenuTarget"
import { Stripe } from "~/models/stripe/stripe.server"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import {
  formatStripeDate,
  getStripeAmount,
  INVOICE_STATUS_COLOR,
} from "~/utils/billingUtils"
import { InvoiceUsageData } from "~/types/stripe-custom"

type InvoicesDataTableProps = {
  invoices: Stripe.Invoice[]
  usageRecords?: InvoiceUsageData[]
}
const InvoicesDataTable = ({ invoices, usageRecords }: InvoicesDataTableProps) => {
  const navigate = useNavigate()
  const { accountId } = useParams()

  const invoicesWithUSage = invoices.map((invoice) => {
    const invoiceUsageRecord = usageRecords?.find(
      (usageRecord) => usageRecord.invoice === invoice.id,
    )

    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      total_usage: invoiceUsageRecord?.total_usage,
      charge: (invoice as any).charge,
      invoice_pdf: invoice.invoice_pdf,
    }
  })

  return (
    <DataTable
      highlightOnHover
      className="clickable-table"
      columns={[
        {
          accessor: "number",
          title: "Invoice ID",
        },
        {
          accessor: "status",
          render: ({ status }) => (
            <Text c={status ? INVOICE_STATUS_COLOR[status] : ""} tt="capitalize">
              {status}
            </Text>
          ),
          title: "Status",
        },
        {
          accessor: "total_usage",
          title: "Total Relays Billed",
          noWrap: true,
          render: ({ total_usage }) =>
            total_usage ? <NumberFormatter thousandSeparator value={total_usage} /> : "—",
        },
        {
          accessor: "amount_due",
          title: "Amount in USD",
          noWrap: true,
          render: ({ amount_due }) => (
            <NumberFormatter
              thousandSeparator
              prefix="USD $"
              value={getStripeAmount(amount_due)}
            />
          ),
        },
        {
          accessor: "period_start",
          title: "Start Date",
          render: ({ period_start }) =>
            formatStripeDate(period_start, "Do MMM YYYY, HH:mm"),
        },
        {
          accessor: "period_end",
          title: "End Date",
          render: ({ period_end }) => formatStripeDate(period_end, "Do MMM YYYY, HH:mm"),
        },
        {
          accessor: "action",
          title: "",
          render: ({ invoice_pdf, id }) => (
            <Menu>
              <ContextMenuTarget variant="subtle" />
              <Menu.Dropdown>
                <Menu.Item>
                  <Button
                    color="gray"
                    component="a"
                    href={invoice_pdf ?? ""}
                    rel="noreferrer"
                    size="compact-sm"
                    target="_blank"
                    variant="subtle"
                    onClick={() => {
                      trackEvent({
                        category: AnalyticCategories.account,
                        action: AnalyticActions.account_billing_invoice_download,
                        label: `Account: ${accountId} / Invoice: ${id}`,
                      })
                    }}
                  >
                    Download Invoice PDF
                  </Button>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ),
        },
      ]}
      minHeight={500}
      records={invoicesWithUSage}
      verticalSpacing={5}
      onRowClick={({ record }) => {
        trackEvent({
          category: AnalyticCategories.account,
          action: AnalyticActions.account_billing_invoice_view,
          label: `Account: ${accountId} / Invoice: ${record.id}`,
        })
        navigate(`${record.id}`)
      }}
    />
  )
}

export default InvoicesDataTable
