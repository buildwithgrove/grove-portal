import { Box, Button, Stack, Text, Title } from "@mantine/core"
import { Link, useParams } from "@remix-run/react"
import LogsControls from "app/routes/account.$accountId.logs/components/LogsControls"
import { EmptyState } from "~/components/EmptyState"
import { RoleName } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import LogsTable from "~/routes/account.$accountId.logs/components/LogsTable"
import { AccountLogsData } from "~/routes/account.$accountId.logs/route"

type AccountLogsViewProps = AccountLogsData & {
  services: ServiceWithEndpoints[]
  userRole: RoleName
}

const AccountLogsView = ({
  logs,
  meta,
  apps,
  services,
  userRole,
}: AccountLogsViewProps) => {
  const { accountId } = useParams()

  return apps.length > 0 ? (
    <Stack gap="lg">
      <Box>
        <Title order={2}>Logs</Title>
        <Text mt={8}>
          Logs are updated every minute and can be filtered to any one-hour window from
          the past 24 hours.
        </Text>
      </Box>
      <LogsControls apps={apps} />
      <LogsTable services={services} logs={logs} meta={meta} />
    </Stack>
  ) : (
    <EmptyState
      callToAction={
        userRole !== RoleName.Member ? (
          <Button
            component={Link}
            mt="xs"
            prefetch="intent"
            to={`/account/${accountId}/create`}
          >
            New Application
          </Button>
        ) : null
      }
      imgHeight={256}
      imgSrc="/logs-no-apps-empty-state.svg"
      imgWidth={256}
      subtitle="Logs provide real-time insight into your application's activities.
Create a new application and initiate transactions to see logs appear here."
      title="Relays Logs"
    />
  )
}

export default AccountLogsView
