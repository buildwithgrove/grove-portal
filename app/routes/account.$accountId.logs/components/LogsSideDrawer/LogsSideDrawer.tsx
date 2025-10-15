import { D2Log } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { Card, Divider, Drawer, Group, Stack, Text } from "@mantine/core"

import React from "react"
import { TitledCard } from "~/components/TitledCard"
import { dayjs } from "~/utils/dayjs"
import { getServiceName } from "~/utils/chainUtils"

type LogsSideDrawerProps = {
  services: ServiceWithEndpoints[]
  logsItem?: D2Log
  onSideDrawerClose: () => void
}

const LogsSideDrawer = ({
  logsItem,
  onSideDrawerClose,
  services,
}: LogsSideDrawerProps) => {
  const cardItems = [
    {
      label: "Date",
      value: dayjs(logsItem?.TS).format("D MMMM, YYYY"),
    },
    {
      label: "Time",
      value: dayjs(logsItem?.TS).format("H:mm:ss"),
    },
    {
      label: "Application ID",
      value: logsItem?.applicationID,
    },
    {
      label: "Chain ID",
      value: logsItem?.chainID,
    },
    {
      label: "Service",
      value: getServiceName({ chainId: logsItem?.chainID as string, services: services }),
    },
    {
      label: "Method",
      value: logsItem?.chainMethod ? logsItem.chainMethod : "-",
    },
    {
      label: "Round Trip Time:",
      value: `${logsItem?.relayRoundTripTime} ms`,
    },
  ]

  return (
    <Drawer
      opened={!!logsItem}
      padding="sm"
      position="right"
      size={800}
      onClose={onSideDrawerClose}
    >
      <Stack>
        <TitledCard header={() => <Text fw={600}>Summary</Text>}>
          <Card.Section p="md">
            <Stack gap={12}>
              {cardItems.map(({ label, value }, index) => (
                <React.Fragment key={`${label}-${index}`}>
                  <Group justify="space-between" px={12}>
                    <Text>{label}</Text> <Text>{value}</Text>
                  </Group>
                  {index !== cardItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Stack>
          </Card.Section>
        </TitledCard>

        {logsItem?.errorMessage ? (
          <TitledCard header={() => <Text fw={600}>Message</Text>}>
            <Card.Section p="md">
              <Text>{logsItem?.errorMessage}</Text>
            </Card.Section>
          </TitledCard>
        ) : null}
      </Stack>
    </Drawer>
  )
}

export default LogsSideDrawer
