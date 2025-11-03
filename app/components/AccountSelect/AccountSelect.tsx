import { Group, Menu, Stack, Text, UnstyledButton } from "@mantine/core"
import { NavLink, useParams } from "@remix-run/react"
import { Check, ChevronsUpDown } from "lucide-react"
import React, { useMemo } from "react"
import Identicon from "~/components/Identicon"
import { Account } from "~/models/portal/sdk"

type UserItemProps = {
  account: Account
  hasMultipleAccounts?: boolean
  iconOnly?: boolean
  selected?: boolean
}

type AccountSelectProps = {
  accounts: Account[]
  collapsed?: boolean
  style?: React.CSSProperties
}

const AccountItem = ({
  account,
  hasMultipleAccounts,
  iconOnly,
  selected,
}: UserItemProps) => (
  <Group>
    <Identicon
      alt={`${account.id} profile picture`}
      seed={account.id}
      size={32}
      type="account"
    />
    {!iconOnly && (
      <>
        <Stack gap={0}>
          <Text truncate fw={500} fz={15} lh="17px" maw={145}>
            {account.name ? account.name : account.id}
          </Text>
          <Text fz={11}>{`${
            account?.users?.length ?? 1
          } member${account?.users?.length > 1 ? "s" : ""}`}</Text>
        </Stack>
        {hasMultipleAccounts && (
          <ChevronsUpDown size={18} style={{ marginLeft: "auto", marginRight: 0 }} />
        )}
        {selected && <Check size={18} style={{ marginLeft: "auto", marginRight: 0 }} />}
      </>
    )}
  </Group>
)

const AccountSelect = ({ accounts, collapsed, style }: AccountSelectProps) => {
  const { accountId } = useParams()
  const hasMultipleAccounts = accounts.length > 1

  const activeAccount = useMemo(
    () => accounts.find(({ id }) => id === accountId),
    [accountId, accounts],
  )

  return (
    <Menu styles={{ dropdown: { minWidth: 260, marginLeft: 8 } }}>
      {activeAccount && (
        <Menu.Target>
          <UnstyledButton
            px={8}
            py={4}
            style={{ borderRadius: 4, ...(style ? style : {}) }}
          >
            <AccountItem
              account={activeAccount}
              hasMultipleAccounts={hasMultipleAccounts}
              iconOnly={!!collapsed}
            />
          </UnstyledButton>
        </Menu.Target>
      )}
      {accounts && accounts?.length > 0 && (
        <Menu.Dropdown px={8} py="md">
          {accounts
            .sort((a, b) => (a.id > b.id ? 1 : -1))
            .map((account, index) => (
              <Menu.Item
                key={account.id}
                disabled={account.id === accountId}
                mb={index === accounts.length - 1 ? 0 : 8}
                p={2}
              >
                <NavLink prefetch="intent" to={`/account/${account.id}`}>
                  <AccountItem account={account} selected={account.id === accountId} />
                </NavLink>
              </Menu.Item>
            ))}
        </Menu.Dropdown>
      )}
    </Menu>
  )
}

export default AccountSelect
