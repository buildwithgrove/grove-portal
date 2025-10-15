import React, { useMemo } from "react"
import { Divider, Box, Group, Text, Button } from "@mantine/core"
import { useParams, useSearchParams } from "@remix-run/react"
import ChainSelectItem from "~/components/ChainSelectItem"
import FluidSelect from "~/components/FluidSelect"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { PortalApp } from "~/models/portal/sdk"
import { getAppNameWithEmoji } from "~/utils/accountUtils"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

type InsightsControlsProps = {
  apps?: PortalApp[]
  services: ServiceWithEndpoints[]
}

export const DEFAULT_DWH_PERIOD = "24hr"

const getDownloadCsvUrl = ({
  searchParams,
  accountId,
  appId,
}: {
  searchParams: URLSearchParams
  accountId: string
  appId: string | undefined
}) => {
  return `/api/${accountId}/insights-csv${searchParams.toString().length > 0 ? `?${searchParams}` : ""
    }${appId ? `${searchParams.toString().length > 0 ? "&" : "?"}appId=${appId}` : ""
    }`.trim()
}

const InsightsControls = ({ apps, services }: InsightsControlsProps) => {
  const { accountId, appId } = useParams()
  const appsSelectItems = [
    { value: "all", label: "All Applications" },
    ...(apps && apps.length > 0
      ? apps.map((app) => ({
        value: app?.id ?? "",
        label: getAppNameWithEmoji(app),
      }))
      : []),
  ]

  const servicesSelectItems = useMemo(() => {
    return services.length > 0
      ? [
        { value: "all", label: "All Services" },
        ...(services.length > 0
          ? services.map((service) => ({
            value: service.service_id,
            label: service.service_name ?? service.service_id,
            service,
          }))
          : []),
      ]
      : []
  }, [services])

  const [searchParams, setSearchParams] = useSearchParams()
  const periodParam = searchParams.get("period") ?? DEFAULT_DWH_PERIOD
  const appParam = searchParams.get("app") ?? "all"
  const chainParam = searchParams.get("chain")
    ? (searchParams.get("chain") as string)
    : services.length > 0
      ? "all"
      : undefined

  const handleParamChange = ({
    param,
    paramKey,
  }: {
    param: string
    paramKey: string
  }) => {
    setSearchParams((searchParams) => {
      searchParams.set(paramKey, param)
      return searchParams
    })
  }

  const handleAppChange = (app: string) => {
    trackEvent({
      category: AnalyticCategories.account,
      action: AnalyticActions.account_insights_select_app,
      label: `Account: ${accountId} / App: ${app}`,
    })

    setSearchParams((searchParams) => {
      searchParams.delete("chain")
      searchParams.set("app", app)
      return searchParams
    })
  }

  return (
    <Group justify="space-between">
      <Group>
        <Group className="bordered-container" gap={0} pos="relative">
          {apps ? (
            <>
              <FluidSelect
                items={appsSelectItems}
                styles={{ label: { marginLeft: 12, marginRight: 12 } }}
                value={appParam}
                onSelect={handleAppChange}
              />
              <Divider orientation="vertical" />
            </>
          ) : null}
          <FluidSelect
            disabled={servicesSelectItems.length === 0}
            itemComponent={ChainSelectItem}
            items={servicesSelectItems}
            placeholder="No Services"
            value={chainParam}
            withSearch={servicesSelectItems.length > 7}
            onSelect={(chain: string) => {
              trackEvent({
                category: AnalyticCategories.account,
                action: AnalyticActions.account_insights_select_network,
                label: `Account: ${accountId} / Network: ${chain}`,
              })
              handleParamChange({ param: chain, paramKey: "chain" })
            }}
          />
        </Group>
        <Text>filtered over the past</Text>
        <Box className="bordered-container">
          <FluidSelect
            items={[
              { value: "24hr", label: "24 Hours" },
              { value: "3", label: "3 Days" },
              { value: "7", label: "7 Days" },
              { value: "14", label: "2 Weeks" },
              { value: "30", label: "30 Days" },
              { value: "60", label: "60 Days" },
              {
                value: "weekToDate",
                label: "Week to Date",
              },
              {
                value: "monthToDate",
                label: "Month to Date",
              },
            ]}
            value={periodParam}
            onSelect={(period: string) => {
              trackEvent({
                category: AnalyticCategories.account,
                action: AnalyticActions.account_insights_change_period,
                label: `Account: ${accountId} / Period: ${period}`,
              })
              handleParamChange({ param: period, paramKey: "period" })
            }}
          />
        </Box>
      </Group>
      {accountId ? (
        <Button
          color="gray"
          component="a"
          href={getDownloadCsvUrl({ searchParams, accountId, appId })}
          px={14}
          radius={4}
          variant="outline"
          onClick={() => {
            trackEvent({
              category: AnalyticCategories.account,
              action: AnalyticActions.account_insights_download_csv,
              label: `Account: ${accountId}`,
            })
          }}
        >
          Download CSV
        </Button>
      ) : null}
    </Group>
  )
}

export default InsightsControls
