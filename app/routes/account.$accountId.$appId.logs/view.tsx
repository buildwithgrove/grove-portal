import { Box, Stack, Text, Title } from "@mantine/core"
import { Blockchain, PortalApp } from "~/models/portal/sdk"

type AppLogsProps = {
  app: PortalApp
  blockchains: Blockchain[]
}

const AppLogsView = ({ app }: AppLogsProps) => {
  return (
    <Stack gap="lg">
      <Box>
        <Title order={2}>Logs for {app.name}</Title>
        <Text mt={8}>
          Logs functionality is currently unavailable.
        </Text>
      </Box>
    </Stack>
  )
}

export default AppLogsView
