import { Box, Stack, Text } from "@mantine/core"
import React, { Dispatch, useMemo } from "react"
import { SecurityReducerActions } from "../../utils/stateReducer"
import { BlockchainWhitelist } from "../../utils/utils"
import useModals from "~/hooks/useModals"
import { Blockchain, WhitelistContracts, WhitelistMethods } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import AddSettingsButton from "~/routes/account.$accountId.$appId.security/components/AddSettingsButton"
import ChainWhitelistModal from "~/routes/account.$accountId.$appId.security/components/ChainWhitelistModal"
import ChainWhitelistTable from "~/routes/account.$accountId.$appId.security/components/ChainWhitelistTable"

type ChainWhitelistProps = {
  dispatch: Dispatch<SecurityReducerActions>
  whitelists: WhitelistContracts[] | WhitelistMethods[]
  services: ServiceWithEndpoints[]
  type: "contracts" | "methods"
  readOnly: boolean
}

export const whitelistInfo = {
  contracts: {
    title: "Whitelist Contracts",
    subtitle: "Limits requests to the smart contract addresses specified.",
  },
  methods: {
    title: "Whitelist Methods",
    subtitle: "Limits requests to use specific RPC methods.",
  },
}

const ChainWhitelist = ({
  dispatch,
  whitelists,
  services,
  type,
  readOnly,
}: ChainWhitelistProps) => {
  const { openFullScreenModal } = useModals()
  const blockchainWhitelist: BlockchainWhitelist[] = useMemo(() => {
    return whitelists
      .map((list) => {
        // @ts-ignore
        return list[type].map((str: string) => ({
          blockchainID: list.blockchainID,
          whitelistValue: str,
        }))
      })
      .flat()
  }, [type, whitelists])

  return (
    <Box py={32}>
      <Stack align="flex-start">
        <Text fw={600}>{whitelistInfo[type].title}</Text>
        <Text>{whitelistInfo[type].subtitle}</Text>
        <AddSettingsButton
          disabled={readOnly}
          onClick={() =>
            openFullScreenModal({
              children: (
                <ChainWhitelistModal
                  blockchains={blockchains}
                  dispatch={dispatch}
                  type={type}
                />
              ),
            })
          }
        />
      </Stack>
      {whitelists.length > 0 && (
        <ChainWhitelistTable
          blockchainWhitelist={blockchainWhitelist}
          blockchains={blockchains}
          readOnly={readOnly}
          onDelete={(contract) => dispatch({ type: `${type}-remove`, payload: contract })}
        />
      )}
    </Box>
  )
}

export default ChainWhitelist
