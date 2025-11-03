import { Button, Stack, Title, Text } from "@mantine/core"
import { Link, useParams } from "@remix-run/react"
import { EmptyState } from "~/components/EmptyState"
import { Account, PortalApp, RoleName } from "~/models/portal/sdk"
import { AnnouncementAlert } from "~/routes/account.$accountId._index/components/AnnouncementAlert"
import { getRequiredClientEnvVar } from "~/utils/environment"

const ANNOUNCEMENT_ALERT = getRequiredClientEnvVar("FLAG_ANNOUNCEMENT_ALERT")

type AccountOverviewViewProps = {
  account: Account
  userRole: RoleName
}

export const AccountOverviewView = ({ account, userRole }: AccountOverviewViewProps) => {
  const { accountId } = useParams()
  const apps = (account?.portalApps as PortalApp[]) || []

  return (
    <>
      {ANNOUNCEMENT_ALERT === "true" && <AnnouncementAlert />}
      {apps.length === 0 ? (
        <EmptyState
          alt="Empty overview placeholder"
          callToAction={
            userRole !== RoleName.Member ? (
              <Button
                component={Link}
                mt="xs"
                prefetch="intent"
                to={`/account/${accountId}/create`}
                variant="filled"
              >
                New Application
              </Button>
            ) : null
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
      ) : (
        <Stack gap="xl">
          <Title order={2}>Overview</Title>
          <Text>
            You have {apps.length} application{apps.length !== 1 ? "s" : ""} in this account.
            View them in the sidebar or manage them in settings.
          </Text>
        </Stack>
      )}
    </>
  )
}

export default AccountOverviewView
