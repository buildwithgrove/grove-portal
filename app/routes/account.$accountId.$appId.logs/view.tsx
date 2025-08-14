import { Stack, Text } from "@mantine/core"
import LogsControls from "app/routes/account.$accountId.logs/components/LogsControls"
import { Blockchain } from "~/models/portal/sdk"
import { AppLogsData } from "~/routes/account.$accountId.$appId.logs/route"
import LogsTable from "~/routes/account.$accountId.logs/components/LogsTable"

type AppLogsProps = AppLogsData & {
  blockchains: Blockchain[]
}

const AppLogs = ({ logs, meta, blockchains }: AppLogsProps) => {
  return (
    <Stack mt={22}>
      <Text>
        Logs are updated every minute and can be filtered to any one-hour window from the
        past 24 hours.
      </Text>
      <LogsControls />
      <LogsTable blockchains={blockchains} logs={logs} meta={meta} />
    </Stack>
  )
}

export default AppLogs
