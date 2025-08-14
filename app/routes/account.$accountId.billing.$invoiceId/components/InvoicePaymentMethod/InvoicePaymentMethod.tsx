import { Stack, Text, Title, Tooltip } from "@mantine/core"
import { DataTable } from "mantine-datatable"
import { Stripe } from "~/models/stripe/stripe.server"
import { CHARGE_STATUS_COLOR } from "~/utils/billingUtils"

const InvoicePaymentMethod = ({ charge }: { charge: Stripe.Charge }) => {
  return charge.payment_method_details?.type === "us_bank_account" ||
    charge.payment_method_details?.type === "card" ? (
    <Stack>
      <Title order={6}>Payment Method</Title>
      <DataTable
        columns={[
          {
            accessor: "payment_method_details.type",
            render: ({ payment_method_details }) =>
              payment_method_details?.type === "us_bank_account" ? (
                <Text tt="capitalize">
                  {payment_method_details?.us_bank_account?.bank_name ??
                    "US Bank Account"}
                </Text>
              ) : (
                <Text tt="capitalize">
                  {payment_method_details?.type} ({payment_method_details?.card?.brand})
                </Text>
              ),
            title: "Type",
          },
          {
            accessor: "payment_method_details.card.last4",
            render: ({ payment_method_details }) =>
              `---- ${
                payment_method_details?.type === "us_bank_account"
                  ? payment_method_details?.us_bank_account?.last4
                  : payment_method_details?.card?.last4
              }`,
            title: "Number",
          },
          ...(charge?.payment_method_details?.type === "us_bank_account"
            ? [
                {
                  accessor: "payment_method_details.us_bank_account.fingerprint",
                  render: ({
                    payment_method_details,
                  }: {
                    payment_method_details: Stripe.Charge.PaymentMethodDetails | null
                  }) => `${payment_method_details?.us_bank_account?.fingerprint}`,
                  title: "Fingerprint",
                },
                {
                  accessor: "payment_method_details.us_bank_account.payment_reference",
                  render: ({
                    payment_method_details,
                  }: {
                    payment_method_details: Stripe.Charge.PaymentMethodDetails | null
                  }) => `${payment_method_details?.us_bank_account?.payment_reference}`,
                  title: "Payment reference",
                },
              ]
            : [
                {
                  accessor: "payment_method_details.card.exp_month",
                  render: ({
                    payment_method_details,
                  }: {
                    payment_method_details: Stripe.Charge.PaymentMethodDetails | null
                  }) =>
                    `${payment_method_details?.card?.exp_month} /
                    ${payment_method_details?.card?.exp_year}`,
                  title: "Expires",
                },
              ]),
          {
            accessor: "status",
            render: ({ status }) => (
              <Tooltip disabled={status !== "failed"} label={charge?.failure_message}>
                <Text
                  c={CHARGE_STATUS_COLOR[status]}
                  style={
                    status === "failed"
                      ? {
                          textDecoration: "underline",
                          textDecorationStyle: "dotted",
                        }
                      : {}
                  }
                  tt="capitalize"
                >
                  {status}
                </Text>
              </Tooltip>
            ),
            title: "Status",
          },
        ]}
        records={[charge]}
        verticalSpacing="sm"
      />
    </Stack>
  ) : null
}

export default InvoicePaymentMethod
