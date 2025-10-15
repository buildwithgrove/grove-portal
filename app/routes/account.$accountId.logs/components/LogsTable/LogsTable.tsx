import { Box, Group, Pagination, Text } from "@mantine/core"
import { useNavigation, useSearchParams } from "@remix-run/react"
import React, { useState } from "react"
import classes from "./LogsTable.module.css"
import { DataTable } from "~/components/DataTable"
import { EmptyState } from "~/components/EmptyState"
import { D2Log, D2Meta } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import LogsSideDrawer from "~/routes/account.$accountId.logs/components/LogsSideDrawer"
import { getServiceName } from "~/utils/chainUtils"
import { dayjs } from "~/utils/dayjs"

type LogsTableProps = {
  logs: D2Log[]
  meta?: D2Meta
  services: ServiceWithEndpoints[]
}

const LogsTable = ({ logs, meta, services }: LogsTableProps) => {
  const [selectedLogsItem, setSelectedLogsItem] = useState<D2Log | undefined>()
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage: number = Number(searchParams.get("page") ?? "1")
  const tsParam = searchParams.get("ts")
  const hasFilters = !!tsParam

  const isLoadingLogs =
    navigation.state === "loading" && navigation.location.pathname.endsWith("/logs")

  return (
    <Box>
      <LogsSideDrawer
        services={services}
        logsItem={selectedLogsItem}
        onSideDrawerClose={() => setSelectedLogsItem(undefined)}
      />
      <DataTable
        className={classes.logsTable}
        columns={["Timestamp", "Method", "Service", "Status"]}
        data={logs?.map((log) => {
          return {
            timestamp: {
              element: dayjs(log.TS).format("D MMMM YYYY, H:mm:ss"),
              value: log.TS,
            },
            method: {
              element: log?.chainMethod ? log?.chainMethod : "-",
              value: log?.chainMethod ? log?.chainMethod : "-",
            },
            service: {
              element: getServiceName({
                chainId: log.chainID as string,
                services: services,
              }),
              value: getServiceName({
                chainId: log.chainID as string,
                services: services,
              }),
            },
            status: {
              element: (
                <Text c={log.isError ? "red" : "green.7"} fz={12}>
                  {log.isError ? "Error" : "Success"}
                </Text>
              ),
              value: log.isError ? "Error" : "Success",
            },
            rowSelectData: log,
          }
        })}
        emptyState={
          <EmptyState
            imgHeight={256}
            imgSrc="/logs-empty-state.svg"
            imgWidth={256}
            subtitle={
              hasFilters
                ? "It looks like there are no logs matching your filter criteria. Try adjusting your filter settings."
                : "There's been no activity in the past hour."
            }
          />
        }
        isLoading={isLoadingLogs}
        paginate={false}
        verticalSpacing="xs"
        onRowClick={(logsItem) => setSelectedLogsItem(logsItem as unknown as D2Log)}
      />
      {meta ? (
        <Group gap="md" justify="center" mt="lg">
          <Pagination
            withEdges
            total={meta?.totalPages}
            value={currentPage}
            onChange={(page) => {
              setSearchParams((searchParams) => {
                searchParams.set("page", String(page))
                return searchParams
              })
            }}
          />
        </Group>
      ) : null}
    </Box>
  )
}

export default LogsTable
