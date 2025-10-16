import { Avatar, Flex, Group, Select, Text } from "@mantine/core"
import { DataTable } from "~/components/DataTable"
import Identicon from "~/components/Identicon"
import { RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser, PortalAccount, PortalAccountRbac } from "~/models/portal-db/types"
import TeamMemberAction from "~/routes/account.$accountId.settings.members/components/TeamMemberAction"
import useTeamModals from "~/routes/account.$accountId.settings.members/hooks/useTeamModals"
import { capitalizeFirstLetter } from "~/utils/utils"

type TeamMembersTableProps = {
  account: PortalAccount
  userRole: RoleName | null
  user?: AuthPortalUser
  rbac: PortalAccountRbac[]
}

const TeamMembersTable = ({ account, userRole, user, rbac }: TeamMembersTableProps) => {
  const { openChangeRoleModal } = useTeamModals({ account })

  // TODO_IN_THIS_PR(@commoddity): determine how to fetch user emails for account
  // Map RBAC data to expected format with placeholder email
  const teamData = rbac.map((r) => ({
    id: r.portal_user_id,
    email: "dev@placeholder.com",
    roleName: r.role_name as RoleName,
    accepted: r.user_joined_account ?? false,
  })).sort(
    (a, b) => Number(b.roleName === "OWNER") - Number(a.roleName === "OWNER"),
  )

  return (
    <DataTable
      columns={["Member", "Roles", "Status", ""]}
      data={teamData.map(({ email, roleName, accepted, id }, index) => {
        return {
          member: {
            element: (
              <Group>
                <Avatar radius="xl">
                  <Identicon
                    alt={`${id} profile picture`}
                    seed={id}
                    size="md"
                    type="user"
                  />
                </Avatar>
                <Text> {email} </Text>
              </Group>
            ),
          },
          role: {
            element:
              roleName === RoleName.Owner ? (
                <Text> Owner </Text>
              ) : userRole !== RoleName.Member ? (
                <Flex>
                  <Select
                    data={[
                      {
                        value: RoleName.Member,
                        label: "Member",
                      },
                      {
                        value: RoleName.Admin,
                        label: "Admin",
                      },
                    ]}
                    disabled={!accepted}
                    value={roleName}
                    onChange={(value) => {
                      if (value !== roleName) {
                        openChangeRoleModal({ email, id, roleName: value as RoleName })
                      }
                    }}
                  />
                </Flex>
              ) : (
                <Text> {capitalizeFirstLetter(roleName)} </Text>
              ),
          },
          status: {
            element: (
              <Text
                c={
                  roleName === RoleName.Owner
                    ? "var(--text-color)"
                    : accepted
                      ? "var(--mantine-color-green-7)"
                      : "var(--mantine-color-yellow-7)"
                }
              >
                {roleName === RoleName.Owner ? "-" : accepted ? "Accepted" : "Pending"}
              </Text>
            ),
          },
          action: {
            element: roleName !== RoleName.Owner && (
              <TeamMemberAction
                account={account}
                status={accepted}
                teamMember={teamData[index]}
                user={user}
                userRole={userRole}
              />
            ),
          },
        }
      })}
      paginate={teamData.length > 10 ? { perPage: 10 } : false}
    />
  )
}

export default TeamMembersTable
