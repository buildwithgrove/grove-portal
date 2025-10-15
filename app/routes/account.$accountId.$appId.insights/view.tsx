import { Box } from "@mantine/core"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { AppInsightsData } from "~/routes/account.$accountId.$appId.insights/route"
import Insights from "~/routes/account.$accountId._index/components/Insights"

type ApplicationInsightsViewProps = AppInsightsData & {
  services: ServiceWithEndpoints[]
}

export default function ApplicationInsightsView({
  total,
  aggregate,
  services,
  realtimeDataChains,
}: ApplicationInsightsViewProps) {
  return (
    <Box mt="xl">
      <Insights
        aggregate={aggregate}
        services={services}
        realtimeDataChains={realtimeDataChains}
        total={total}
      />
    </Box>
  )
}
