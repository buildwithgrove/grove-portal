import { Stack, Text } from "@mantine/core"
import LogsControls from "app/routes/account.$accountId.logs/components/LogsControls"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { AppLogsData } from "~/routes/account.$accountId.$appId.logs/route"
import LogsTable from "~/routes/account.$accountId.logs/components/LogsTable"

type AppLogsProps = AppLogsData & {
  services: ServiceWithEndpoints[]
}

const AppLogs = ({ logs, meta, services }: AppLogsProps) => {
  return (
    <Stack mt={22}>
      <Text>
        Logs are updated every minute and can be filtered to any one-hour window from the
        past 24 hours.
      </Text>
      <LogsControls />
      <LogsTable services={services} logs={logs} meta={meta} />
    </Stack>
  )
}

export default AppLogs
