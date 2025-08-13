import { Box, Text } from "@mantine/core"
import BarChart from "~/components/BarChart"
import { ChartData } from "~/types/global"

type OverviewBarChartProps = { title: string }

const sparklineData: ChartData[] = [
  {
    date: "Jul 15",
    val: 130,
  },
  {
    date: "Jul 16",
    val: 65,
  },
  {
    date: "Jul 17",
    val: 20,
  },
  {
    date: "Jul 18",
    val: 140,
  },
  {
    date: "Jul 19",
    val: 190,
  },
  {
    date: "Jul 20",
    val: 200,
  },
  {
    date: "Jul 21",
    val: 180,
  },
  {
    date: "Jul 22",
    val: 90,
  },
]

export const OverviewBarChart = ({ title }: OverviewBarChartProps) => {
  return (
    <Box h="350px" pt="xl">
      <Text fw="600" fz="md" mb="lg">
        {title}
      </Text>
      <BarChart data={sparklineData} xAxisDataKey="date" yAxisDataKey="val" />
    </Box>
  )
}

export default OverviewBarChart
