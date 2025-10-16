import { Text } from "@mantine/core"
import { useFetcher } from "@remix-run/react"
import useModals from "~/hooks/useModals"
import { PortalAccount } from "~/models/portal-db/types"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

const useSubscriptionModals = () => {
  const fetcher = useFetcher()
  const { openConfirmationModal } = useModals()

  const stopSubscription = (account: PortalAccount) => {
    const subscriptionID = account.stripe_subscription_id
    fetcher.submit(
      {
        "account-id": account.portal_account_id,
        "account-name": account.user_account_name ?? account.portal_account_id,
        ...(subscriptionID && {
          "subscription-id": account.stripe_subscription_id,
        }),
      },
      {
        method: "POST",
        action: "/api/stripe/subscription-delete",
      },
    )
  }

  const openStopSubscriptionModal = (account: PortalAccount) =>
    openConfirmationModal({
      title: (
        <Text fw={600} fz={14}>
          Stop Subscription
        </Text>
      ),
      children: (
        <Text>
          Your plan will be changed to 'Free' effective immediately, and you will be
          invoiced at the end of your billing period. If you change your mind, you can
          renew your subscription until the end of your billing period.
        </Text>
      ),
      labels: { cancel: "Cancel", confirm: "Stop subscription" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        stopSubscription(account)
        trackEvent({
          category: AnalyticCategories.account,
          action: AnalyticActions.account_subscription_stop,
          label: account.portal_account_id,
        })
      },
    })

  return { openStopSubscriptionModal }
}

export default useSubscriptionModals
