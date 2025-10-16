import { Divider, Box, Button, Flex } from "@mantine/core"
import useModals from "~/hooks/useModals"
import { RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser, PortalAccount, PortalAccountRbac } from "~/models/portal-db/types"
import InviteMemberFrom from "~/routes/account.$accountId.settings.members/components/InviteMemberForm"
import TeamMembersTable from "~/routes/account.$accountId.settings.members/components/TeamMembersTable"

type TeamViewProps = {
  account: PortalAccount
  userRole: RoleName
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
  rbac: PortalAccountRbac[]
}

function MembersView({ account, userRole, user, rbac }: TeamViewProps) {
  const { openFullScreenModal } = useModals()
  const openInviteMemberModal = () =>
    openFullScreenModal({
      children: <InviteMemberFrom accountName={account.user_account_name} />,
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
      <TeamMembersTable account={account} user={user} userRole={userRole} rbac={rbac} />
    </Box>
  )
}

export default MembersView
