import { Button, Stack, Title } from "@mantine/core"
import { Link, useParams } from "@remix-run/react"
import { EmptyState } from "~/components/EmptyState"
import { PortalApp, RoleName } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { AnnouncementAlert } from "~/routes/account.$accountId._index/components/AnnouncementAlert"
import Insights from "~/routes/account.$accountId._index/components/Insights"
import { AccountInsightsData } from "~/routes/account.$accountId._index/route"
import { getRequiredClientEnvVar } from "~/utils/environment"

const ANNOUNCEMENT_ALERT = getRequiredClientEnvVar("FLAG_ANNOUNCEMENT_ALERT")

type AccountInsightsViewProps = Omit<AccountInsightsData, "account"> & {
  apps: PortalApp[]
  userRole: RoleName
  services: ServiceWithEndpoints[]
}

export const AccountInsightsView = ({
  apps,
  total,
  userRole,
  aggregate,
  services,
  realtimeDataChains,
}: AccountInsightsViewProps) => {
  const { accountId } = useParams()

  return (
    <>
      {ANNOUNCEMENT_ALERT === "true" && <AnnouncementAlert />}
      {apps.length === 0 ? (
        <EmptyState
          alt="Empty overview placeholder"
          callToAction={
            userRole !== RoleName.Member ? (
              <Button
                component={Link}
                mt="xs"
                prefetch="intent"
                to={`/account/${accountId}/create`}
                variant="filled"
              >
                New Application
              </Button>
            ) : null
          }
          imgHeight={205}
          imgSrc="/overview-empty-state.svg"
          imgWidth={122}
          subtitle={
            <>
              Applications connect your project to the blockchain. <br />
              Set up your first one now.
            </>
          }
          title="Create your first application"
        />
      ) : (
        <Stack gap="xl">
          <Title order={2}>Insights</Title>
          <Insights
            aggregate={aggregate}
            apps={apps}
            services={services}
            realtimeDataChains={realtimeDataChains}
            total={total}
          />
        </Stack>
      )}
    </>
  )
}

export default AccountInsightsView
