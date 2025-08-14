import {
  Bar,
  CartesianGrid,
  Cell,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Box, Text, useMantineTheme } from "@mantine/core"
import React, { useState } from "react"

import { ChartData } from "~/types/global"

type BarChartProps = {
  data: ChartData[]
  xAxisDataKey: string
  yAxisDataKey: string
}

const BarChart = ({ data, xAxisDataKey, yAxisDataKey }: BarChartProps) => {
  const theme = useMantineTheme()
  const [focusedBar, setFocusedBar] = useState<number | null>()
  const [mouseLeave, setMouseLeave] = useState(true)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          p="sm"
          style={{
            backgroundColor: "var(--mantine-color-body)",
            border: "1px solid var(--app-shell-border-color)",
          }}
        >
          <Text className="label">Date: {label}</Text>
          <Text className="desc">{payload[0].value} relays</Text>
        </Box>
      )
    }

    return null
  }

  return (
    <ResponsiveContainer height="100%" width="100%">
      <RechartsBarChart
        data={data}
        height={350}
        margin={{ bottom: 100 }}
        onMouseLeave={() => {
          setMouseLeave(true)
          setFocusedBar(null)
        }}
        onMouseMove={(state) => {
          if (state.isTooltipActive) {
            setFocusedBar(state.activeTooltipIndex)
            setMouseLeave(false)
          }
        }}
      >
        {/* style={{ transform: "translate(-5px, -5px)" }} }} */}
        {/* tick={{ stroke: "red", strokeWidth: 2, x: 50, cx: 60, y: 100 }} */}
        <CartesianGrid
          strokeDasharray="3 3"
          strokeWidth={0.2}
          style={{ fill: theme.colors.gray[8] }}
          vertical={false}
        />
        <XAxis
          dataKey={xAxisDataKey}
          padding={{ left: 30, right: 30 }}
          stroke={theme.colors.gray[8]}
          tick={{ fill: theme.colors.gray[6] }}
          tickLine={false}
          tickMargin={35}
        />
        <YAxis
          axisLine={false}
          dataKey={yAxisDataKey}
          includeHidden={true}
          minTickGap={0}
          tick={{ fill: theme.colors.gray[6] }}
          tickFormatter={(val) => (val === 0 ? val : `${val}k`)}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar
          background={false}
          dataKey="val"
          fill={"none"}
          maxBarSize={15}
          stroke={theme.colors.blue[7]}
          strokeWidth={1}
        >
          {data.map((entry, index) => (
            <Cell
              key={`${entry.val}-${index}`}
              fill={focusedBar === index ? theme.colors.blue[7] : "none"}
              fillOpacity={focusedBar === index || mouseLeave ? 1 : 0.2}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart
