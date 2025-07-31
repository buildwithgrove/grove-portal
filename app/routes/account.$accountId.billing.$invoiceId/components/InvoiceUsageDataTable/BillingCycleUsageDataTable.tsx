import { Group, Text } from "@mantine/core"
import clsx from "clsx"
import { Emoji } from "emoji-picker-react"
import { ChevronRight } from "lucide-react"
import { DataTable } from "mantine-datatable"
import React, { useMemo, useState } from "react"
import classes from "./BillingCycleUsageDataTable.module.css"
import { D2Stats, PortalApp } from "~/models/portal/sdk"
import { AccountBillingOutletContext } from "~/routes/account.$accountId.billing/route"
import { getChainName } from "~/utils/chainUtils"

type ChainUsage = Pick<D2Stats, "totalCount" | "chainID">

export type BillingCycleAppsUsage = Pick<PortalApp, "name" | "appEmoji" | "id"> & {
  totalAppUsage: number
  chainsUsage: ChainUsage[]
}

type BillingCycleUsageDataTableProps = Pick<
  AccountBillingOutletContext,
  "account" | "blockchains"
> & {
  invoiceUsageStats: D2Stats[]
}
const getInvoiceAppsUsage = (
  apps: PortalApp[],
  totals: D2Stats[],
): BillingCycleAppsUsage[] => {
  return apps
    .map(({ id, name, appEmoji }) => {
      const appTotals = totals.filter(({ applicationID }) => applicationID === id)
      const usageData = appTotals.map(({ chainID, totalCount }) => ({
        chainID: chainID,
        totalCount: totalCount,
      })) as ChainUsage[]

      const totalAppUsage = usageData.reduce(
        (acc, curr) => acc + Number(curr?.totalCount),
        0,
      )

      return {
        id: id,
        name: name,
        appEmoji: appEmoji,
        chainsUsage: usageData,
        totalAppUsage: totalAppUsage,
      }
    })
    .filter(({ totalAppUsage }) => totalAppUsage > 0)
}

const BillingCycleUsageDataTable = ({
  invoiceUsageStats,
  account,
  blockchains,
}: BillingCycleUsageDataTableProps) => {
  const portalApps = account.portalApps as PortalApp[]
  const invoiceAppsUsageData = useMemo(
    () => getInvoiceAppsUsage(portalApps, invoiceUsageStats as D2Stats[]),
    [portalApps, invoiceUsageStats],
  )

  const [expandedAppIds, setExpandedAppIds] = useState<string[]>(
    portalApps?.length > 0 ? portalApps?.map((app) => app?.id) : [],
  )

  return (
    <DataTable
      columns={[
        {
          accessor: "name",
          title: "Application",
          noWrap: true,
          render: ({ name, appEmoji, id }) => (
            <Group gap={6}>
              <ChevronRight
                className={clsx(classes.icon, classes.expandIcon, {
                  [classes.expandIconRotated]: expandedAppIds.includes(id),
                })}
              />
              <Emoji size={14} unified={appEmoji} />
              <Text>{name}</Text>
            </Group>
          ),
        },
        {
          accessor: "usage",
          render: () => "All Services",
          title: "Service",
          width: 250,
        },
        { accessor: "totalAppUsage", title: "Total Relays", width: 250 },
      ]}
      records={invoiceAppsUsageData}
      rowExpansion={{
        allowMultiple: true,
        expanded: {
          recordIds: expandedAppIds,
          onRecordIdsChange: setExpandedAppIds,
        },
        content: ({ record: app }) => (
          <DataTable
            noHeader
            columns={[
              {
                accessor: "application",
                noWrap: true,
              },
              {
                accessor: "chainID",
                title: "Service",
                width: 250,
                render: ({ chainID }) =>
                  getChainName({ chainId: String(chainID), chains: blockchains }),
              },
              { accessor: "totalCount", title: "Total relays", width: 250 },
            ]}
            idAccessor={({ chainID, totalCount }) => `${chainID}:${totalCount}}`}
            records={
              invoiceAppsUsageData.find(({ id }) => id === app.id)?.chainsUsage ?? []
            }
            verticalSpacing="sm"
            withRowBorders={false}
          />
        ),
      }}
      verticalSpacing="sm"
      withRowBorders={false}
    />
  )
}

export default BillingCycleUsageDataTable
