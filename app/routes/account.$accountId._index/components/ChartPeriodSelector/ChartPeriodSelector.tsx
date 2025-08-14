import { Button, Group, Text, Tooltip, useMantineTheme } from "@mantine/core"
import { Form, useSearchParams } from "@remix-run/react"
import { Info } from "lucide-react"

export const ChartPeriodSelector = () => {
  const theme = useMantineTheme()
  const [searchParams] = useSearchParams()
  const daysParam = searchParams.get("days") ?? "7"

  return (
    <Form>
      <Group>
        <Tooltip label="Historical data updates every 24hrs">
          <Text c="dimmed" display="flex">
            <Info size={18} />
          </Text>
        </Tooltip>
        <Button.Group>
          <Button
            bg={daysParam === "7" ? theme.colors.dark[7] : theme.colors.dark[9]}
            name="days"
            radius="sm"
            size="xs"
            type="submit"
            value={7}
            variant="default"
          >
            7d
          </Button>
          <Button
            bg={daysParam === "30" ? theme.colors.dark[7] : theme.colors.dark[9]}
            name="days"
            radius="sm"
            size="xs"
            type="submit"
            value={30}
            variant="default"
          >
            30d
          </Button>
          <Button
            bg={daysParam === "60" ? theme.colors.dark[7] : theme.colors.dark[9]}
            name="days"
            radius="sm"
            size="xs"
            type="submit"
            value={60}
            variant="default"
          >
            60d
          </Button>
        </Button.Group>
      </Group>
    </Form>
  )
}

export default { ChartPeriodSelector }
