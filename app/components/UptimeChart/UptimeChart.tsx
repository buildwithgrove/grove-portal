import { MantineTheme, useMantineTheme } from "@mantine/core"
import { ResponsiveContainer, BarChart, Bar, Cell } from "recharts"

type UptimeChartProps = {
  data: {
    [key: string]: string | number
  }[]
}

const getBarColor = ({
  theme,
  uptime,
}: {
  theme: MantineTheme
  uptime: number | string
}) => {
  if (Number(uptime) >= 0.9) return theme.colors.green[5]
  if (Number(uptime) >= 0.8) return theme.colors.yellow[7]
  return theme.colors.red[9]
}

const UptimeChart = ({ data }: UptimeChartProps) => {
  const theme = useMantineTheme()

  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart
        barCategoryGap={2}
        data={data}
        margin={{ left: 16, right: 16, bottom: 10 }}
      >
        <Bar background={false} dataKey="maxUptime" minPointSize={10}>
          {data.map(({ uptime }, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor({ theme, uptime })} />
          ))}
        </Bar>
        {/*<Tooltip*/}
        {/*  allowEscapeViewBox={{ x: true, y: true }}*/}
        {/*  cursor={{ fill: "transparent" }}*/}
        {/*  position={{ y: -75 }}*/}
        {/*/>*/}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default UptimeChart
