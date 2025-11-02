import { Indicator, Group, Text, Tooltip } from "@mantine/core"
import { Crown } from "lucide-react"
import { useMemo } from "react"
import { DataTable } from "~/components/DataTable"
import Identicon from "~/components/Identicon"
import { Account, RoleName, User } from "~/models/portal/sdk"
import InvitedAccountAction from "~/routes/user.accounts/components/InvitedAccountAction"
import { getAccountAcceptedValue, getUserAccountRole } from "~/utils/accountUtils"
import { capitalizeFirstLetter } from "~/utils/utils"

type AccountsTableProps = {
  accounts: Account[]
  pendingAccounts: Account[]
  user: User
}

export type TableUserAccount = Account & { accepted: boolean; role: RoleName }

const AccountsTable = ({ accounts, pendingAccounts, user }: AccountsTableProps) => {
  const sortedAcceptedAccounts = useMemo(() => {
    const ownedAccount = accounts.find((account) =>
      account?.users.find(
        (u) => u.id === user.portalUserID && u.roleName === RoleName.Owner,
      ),
    )
    const filteredAccounts = accounts.filter(({ id }) => id !== ownedAccount?.id)
    return [
      ownedAccount,
      ...filteredAccounts.sort((a, b) => (a.id > b.id ? 1 : -1)),
    ] as Account[]
  }, [accounts, user.portalUserID])

  const userAccounts = useMemo(() => {
    return [...pendingAccounts, ...sortedAcceptedAccounts].map((account) => ({
      ...account,
      accepted: getAccountAcceptedValue(account.users, user.portalUserID),
      role: getUserAccountRole(account.users, user.portalUserID),
    })) as TableUserAccount[]
  }, [pendingAccounts, sortedAcceptedAccounts, user.portalUserID])

  return userAccounts.length > 0 ? (
    <DataTable
      columns={[
        "Account",
        "No. Members",
        "No. Applications",
        "Role",
        "Status",
        "",
      ]}
      data={userAccounts.map((account) => {
        const isUserAccountOwner = account.role === RoleName.Owner
        return {
          account: {
            element: (
              <Group>
                <Tooltip disabled={!isUserAccountOwner} label="You are the account owner">
                  <Indicator disabled={!isUserAccountOwner} label={<Crown />} size={16}>
                    <Identicon
                      alt={`${account.id} profile picture`}
                      seed={account.id}
                      type="account"
                    />
                  </Indicator>
                </Tooltip>
                <Text fw={500} size="sm">
                  {account.name ? account.name : account.id}
                </Text>
              </Group>
            ),
          },
          members: {
            element: (
              <Text>
                {account?.users?.length} Member
                {account?.users?.length > 1 ? "s" : ""}
              </Text>
            ),
          },
          applications: {
            element: (
              <Text>
                {account?.portalApps?.length} Application
                {account?.portalApps && account?.portalApps?.length > 1 ? "s" : ""}
              </Text>
            ),
          },
          role: {
            element: <Text> {capitalizeFirstLetter(account.role)} </Text>,
          },
          status: {
            element: (
              <Text
                c={
                  account.accepted
                    ? "var(--mantine-color-green-7)"
                    : "var(--mantine-color-yellow-7)"
                }
              >
                {account.accepted ? "Accepted" : "Pending"}
              </Text>
            ),
          },
          action: {
            element: <InvitedAccountAction account={account} user={user} />,
          },
        }
      })}
      paginate={false}
    />
  ) : null
}

export default AccountsTable
