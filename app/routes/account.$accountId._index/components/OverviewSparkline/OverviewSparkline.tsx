import { Box, LoadingOverlay, Space, Text } from "@mantine/core"
import { type AxisDomain } from "recharts/types/util/types"
import chartLoaderAnimation from "./chart-loader.json"
import PortalLoader from "~/components/PortalLoader"
import Sparkline from "~/components/Sparkline"
import { ChartData } from "~/types/global"

type OverviewSparklineProps = {
  label?: string
  title?: string
  sparklineData: ChartData[]
  isLoading?: boolean
  customYAxisDomain?: AxisDomain
  commifyLabelValue?: boolean
}

export const OverviewSparkline = ({
  label = "relays",
  commifyLabelValue,
  title,
  sparklineData,
  isLoading,
  customYAxisDomain,
}: OverviewSparklineProps) => {
  const height = 350
  return (
    <Box h={`${height}px`} pos="relative">
      {title ? (
        <Text fw="600" fz="md" mb="lg">
          {title}
        </Text>
      ) : (
        <Space mb="lg" />
      )}
      <LoadingOverlay
        loaderProps={{
          children: <PortalLoader loaderAnimation={chartLoaderAnimation} />,
        }}
        overlayProps={{ opacity: 0.01 }}
        visible={!!isLoading}
      />
      {!isLoading ? (
        <Sparkline
          commifyLabelValue={commifyLabelValue}
          customYAxisDomain={customYAxisDomain}
          data={sparklineData}
          height={height}
          label={label}
          xAxisDataKey="date"
          yAxisDataKey="val"
        />
      ) : null}
    </Box>
  )
}

export default OverviewSparkline
