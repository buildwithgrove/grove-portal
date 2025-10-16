import { ActionIcon, Button, Group, Menu, Text } from "@mantine/core"
import { Form, Link, useNavigation } from "@remix-run/react"
import { ArrowUpRight, Minus, Ellipsis, Pencil } from "lucide-react"
import { RoleName } from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"
import useTeamModals from "~/routes/account.$accountId.settings.members/hooks/useTeamModals"
import { TableUserAccount } from "~/routes/user.accounts/components/AccountsTable"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

type InvitedAccountActionProps = {
  account: TableUserAccount
  user: AuthPortalUser
}

const InvitedAccountAction = ({ account, user }: InvitedAccountActionProps) => {
  const navigation = useNavigation()
  const { accepted, role } = account

  const { openLeaveTeamModal } = useTeamModals({ account })

  return (
    <Group gap="md" grow={!accepted} justify="right">
      {accepted ? (
        <Menu>
          <Menu.Target>
            <ActionIcon
              aria-label="Open account actions menu"
              radius="xl"
              size={40}
              variant="outline"
            >
              <Ellipsis />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<ArrowUpRight size={18} />}>
              <Link to={`/account/${account.id}`}>
                <Text tt="capitalize">Go to account</Text>
              </Link>
            </Menu.Item>
            {role === RoleName.Owner ? (
              <Menu.Item leftSection={<Pencil size={18} />}>
                <Link to={`/account/${account.id}/update?redirectTo=/user/accounts`}>
                  <Text tt="capitalize">Change name</Text>
                </Link>
              </Menu.Item>
            ) : (
              <Menu.Item
                leftSection={<Minus size={18} />}
                onClick={() =>
                  openLeaveTeamModal({ email: user.portal_user_email, id: user.portal_user_id })
                }
              >
                <Text>Leave</Text>
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Form method="post">
          <input hidden name="accountId" value={account.id} />
          <input hidden name="accountName" value={account.name ?? ""} />
          <input hidden name="role" value={role} />
          <Group justify="right">
            <Button
              color="gray"
              disabled={navigation.state === "loading"}
              name="invite_response"
              type="submit"
              value="decline"
              variant="outline"
              onClick={() => {
                trackEvent({
                  category: AnalyticCategories.user,
                  action: AnalyticActions.user_invites_decline,
                  label: account.id,
                })
              }}
            >
              Decline
            </Button>
            <Button
              disabled={navigation.state === "loading"}
              name="invite_response"
              type="submit"
              value="accept"
              onClick={() => {
                trackEvent({
                  category: AnalyticCategories.user,
                  action: AnalyticActions.user_invites_accept,
                  label: account.id,
                })
              }}
            >
              Accept
            </Button>
          </Group>
        </Form>
      )}
    </Group>
  )
}

export default InvitedAccountAction
