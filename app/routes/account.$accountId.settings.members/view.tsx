import { Divider, Box, Button, Flex } from "@mantine/core"
import useModals from "~/hooks/useModals"
import { Account, RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"
import InviteMemberFrom from "~/routes/account.$accountId.settings.members/components/InviteMemberForm"
import TeamMembersTable from "~/routes/account.$accountId.settings.members/components/TeamMembersTable"

type TeamViewProps = {
  account: Account
  userRole: RoleName
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
}

function MembersView({ account, userRole, user }: TeamViewProps) {
  const { openFullScreenModal } = useModals()
  const openInviteMemberModal = () =>
    openFullScreenModal({
      children: <InviteMemberFrom accountName={account.name} />,
    })

  return (
    <Box>
      <Flex align="center" justify="flex-end" my="xl">
        {userRole !== RoleName.Member && (
          <Button size="md" color="green.7" onClick={openInviteMemberModal}>
            Invite new member
          </Button>
        )}
      </Flex>
      <Divider />
      <TeamMembersTable account={account} user={user} userRole={userRole} />
    </Box>
  )
}

export default MembersView
