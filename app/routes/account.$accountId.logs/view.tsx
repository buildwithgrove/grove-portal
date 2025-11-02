import { Box, Button, Stack, Text, Title } from "@mantine/core"
import { Link, useParams } from "@remix-run/react"
import { EmptyState } from "~/components/EmptyState"
import { Blockchain, PortalApp, RoleName } from "~/models/portal/sdk"

type AccountLogsViewProps = {
  apps: PortalApp[]
  blockchains: Blockchain[]
}

const AccountLogsView = ({ apps }: AccountLogsViewProps) => {
  const { accountId } = useParams()

  return apps.length > 0 ? (
    <Stack gap="lg">
      <Box>
        <Title order={2}>Logs</Title>
        <Text mt={8}>
          Logs functionality is currently unavailable.
        </Text>
      </Box>
    </Stack>
  ) : (
    <EmptyState
      alt="Empty logs placeholder"
      callToAction={
        <Button
          component={Link}
          mt="xs"
          prefetch="intent"
          to={`/account/${accountId}/create`}
          variant="filled"
        >
          New Application
        </Button>
      }
      imgHeight={205}
      imgSrc="/overview-empty-state.svg"
      imgWidth={122}
      subtitle={
        <>
          Applications connect your project to the blockchain. <br />
          Set up your first one now.
        </>
      }
      title="Create your first application"
    />
  )
}

export default AccountLogsView
