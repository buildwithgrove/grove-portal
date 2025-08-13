import { Alert, NumberFormatter, Stack, Text, Title } from "@mantine/core"
import { formatStripeDate, getStripeAmount } from "~/utils/billingUtils"

import { Info } from "lucide-react"
import { Stripe } from "~/models/stripe/stripe.server"
import TitledCard from "~/components/TitledCard/TitledCard"
import { dayjs } from "~/utils/dayjs"

export type BillingEstimateCardProps = {
  totalRelays: number
  subscription?: Stripe.Subscription
  upcomingInvoice?: Stripe.UpcomingInvoice
  isLoading?: boolean
}

export const BillingEstimateCard = ({
  totalRelays,
  subscription,
  upcomingInvoice,
  isLoading = false,
}: BillingEstimateCardProps) => {
  // Get real pricing data from subscription or use fallback
  const getUnitPrice = () => {
    if (subscription?.items?.data?.[0]?.price) {
      const price = subscription.items.data[0].price
      // Stripe prices are in cents, convert to dollars
      return price.unit_amount ? price.unit_amount / 100 : 5
    }
    return 5 // Fallback price
  }

  // Calculate billing estimate using real pricing
  const units = Math.floor(totalRelays / 1_000_000) + 1
  const unitPrice = getUnitPrice()
  let estimatedCost = units * unitPrice

  // Apply any discounts from subscription or upcoming invoice
  let discountAmount = 0
  let discountText = ""

  if (upcomingInvoice?.discounts && upcomingInvoice.discounts.length > 0) {
    const discount = upcomingInvoice.discounts[0]
    if (
      typeof discount === "object" &&
      discount &&
      "coupon" in discount &&
      discount.coupon
    ) {
      if (discount.coupon.percent_off) {
        discountAmount = (estimatedCost * discount.coupon.percent_off) / 100
        discountText = `${discount.coupon.percent_off}% discount applied`
      } else if (discount.coupon.amount_off) {
        discountAmount = discount.coupon.amount_off / 100 // Convert cents to dollars
        discountText = `$${getStripeAmount(discount.coupon.amount_off)} discount applied`
      }
    }
  } else if (subscription?.discounts && subscription.discounts.length > 0) {
    const subscriptionDiscount = subscription.discounts[0]
    if (
      typeof subscriptionDiscount === "object" &&
      subscriptionDiscount &&
      "coupon" in subscriptionDiscount &&
      subscriptionDiscount.coupon
    ) {
      if (subscriptionDiscount.coupon.percent_off) {
        discountAmount = (estimatedCost * subscriptionDiscount.coupon.percent_off) / 100
        discountText = `${subscriptionDiscount.coupon.percent_off}% discount applied`
      } else if (subscriptionDiscount.coupon.amount_off) {
        discountAmount = subscriptionDiscount.coupon.amount_off / 100 // Convert cents to dollars
        discountText = `$${getStripeAmount(
          subscriptionDiscount.coupon.amount_off,
        )} discount applied`
      }
    }
  }

  const finalCost = Math.max(0, estimatedCost - discountAmount)

  // Get next billing date from subscription or use fallback
  const getNextBillingDate = () => {
    if (upcomingInvoice?.period_end) {
      return formatStripeDate(upcomingInvoice.period_end, "Do MMM")
    } else if (
      subscription &&
      "current_period_end" in subscription &&
      subscription.current_period_end
    ) {
      return formatStripeDate(subscription.current_period_end as number, "Do MMM")
    } else {
      return `1st ${dayjs().add(1, "month").format("MMM")}`
    }
  }

  const currentMonth = dayjs().format("MMMM")
  const nextBillingDate = getNextBillingDate()

  const headerComponent = () => <Title order={4}>{currentMonth} Billing Estimate</Title>

  return (
    <TitledCard header={headerComponent}>
      <Stack gap={4} pt={12}>
        <Title order={3}>
          <NumberFormatter
            thousandSeparator
            prefix="$"
            value={isLoading ? 0 : finalCost}
          />
        </Title>

        <Text c="dimmed" size="sm">
          Based on {new Intl.NumberFormat().format(totalRelays)} relays this month (
          {units} units × ${unitPrice}/unit)
        </Text>

        {discountText && (
          <Text c="green" size="sm" fw={500}>
            {discountText}
          </Text>
        )}

        <Text>Your next invoice will be billed on {nextBillingDate}</Text>

        <Alert variant="light" color="blue" icon={<Info size="1rem" />} mt="xs">
          <Text size="sm">
            This is an estimate based on current usage from the first of the month to
            today. Actual billing may vary based on final usage and any applicable taxes.
          </Text>
        </Alert>
      </Stack>
    </TitledCard>
  )
}

export default BillingEstimateCard
