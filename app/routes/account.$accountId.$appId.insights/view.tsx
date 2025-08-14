import { Box } from "@mantine/core"
import { Blockchain } from "~/models/portal/sdk"
import { AppInsightsData } from "~/routes/account.$accountId.$appId.insights/route"
import Insights from "~/routes/account.$accountId._index/components/Insights"

type ApplicationInsightsViewProps = AppInsightsData & {
  blockchains: Blockchain[]
}

export default function ApplicationInsightsView({
  total,
  aggregate,
  blockchains,
  realtimeDataChains,
}: ApplicationInsightsViewProps) {
  return (
    <Box mt="xl">
      <Insights
        aggregate={aggregate}
        blockchains={blockchains}
        realtimeDataChains={realtimeDataChains}
        total={total}
      />
    </Box>
  )
}
