import {
  Divider,
  Box,
  Button,
  Container,
  Grid,
  Group,
  LoadingOverlay,
  TextInput,
  CloseButton,
} from "@mantine/core"
import { useNavigation } from "@remix-run/react"
import React, { Dispatch, useState } from "react"
import { SecurityReducerActions } from "../../utils/stateReducer"
import Chain from "~/components/Chain"
import ChainsDropdown from "~/components/ChainsDropdown/ChainsDropdown"
import ModalHeader from "~/components/ModalHeader"
import PortalLoader from "~/components/PortalLoader"
import useModals from "~/hooks/useModals"
import { Blockchain } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import AddSettingsButton from "~/routes/account.$accountId.$appId.security/components/AddSettingsButton"
import { whitelistInfo } from "~/routes/account.$accountId.$appId.security/components/ChainWhitelist"
import ChainWhitelistTable from "~/routes/account.$accountId.$appId.security/components/ChainWhitelistTable"
import { BlockchainWhitelist } from "~/routes/account.$accountId.$appId.security/utils/utils"

type ChainWhitelistModalProps = {
  services: ServiceWithEndpoints[]
  dispatch: Dispatch<SecurityReducerActions>
  type: "contracts" | "methods"
}

const ChainWhitelistModal = ({
  services,
  dispatch,
  type,
}: ChainWhitelistModalProps) => {
  const { state } = useNavigation()
  const { closeAllModals } = useModals()

  const [selectedWhiteLists, setSelectedWhiteLists] = useState<BlockchainWhitelist[]>([])
  const [inputWhitelistValue, setInputWhitelistValue] = useState<string>("")
  const [dropdownSelectedChain, setDropdownSelectedChain] = useState<Blockchain>()

  const deleteSelectedChainWhitelist = (chainId: string) => {
    setSelectedWhiteLists((ids) =>
      ids.filter(({ blockchainID }) => chainId !== blockchainID),
    )
  }

  const addBlockchainWhiteList = () => {
    setSelectedWhiteLists((whitelists) => [
      ...whitelists,
      {
        blockchainID: dropdownSelectedChain?.id as string,
        whitelistValue: inputWhitelistValue,
      },
    ])
    setDropdownSelectedChain(undefined)
    setInputWhitelistValue("")
  }

  const handleSave = () => {
    dispatch({ type: `${type}-add`, payload: selectedWhiteLists })
    closeAllModals()
  }

  return (
    <>
      {state === "idle" ? (
        <Container>
          <ModalHeader
            subtitle={whitelistInfo[type].subtitle}
            title={whitelistInfo[type].title}
            onDiscard={closeAllModals}
          />

          <Box>
            <Grid px={8} py={24}>
              <Grid.Col span="content">
                {dropdownSelectedChain ? (
                  <Group pos="relative" w={250}>
                    <Chain chain={dropdownSelectedChain} />
                    <CloseButton
                      aria-label="Deselect chain"
                      pos="absolute"
                      right={0}
                      top={-6}
                      onClick={() => setDropdownSelectedChain(undefined)}
                    />
                  </Group>
                ) : (
                  <ChainsDropdown
                    chains={blockchains}
                    width={250}
                    onChange={(val) => {
                      val &&
                        setDropdownSelectedChain(blockchains.find(({ id }) => id === val))
                    }}
                  />
                )}
              </Grid.Col>
              <Grid.Col px={20} span="auto">
                <TextInput
                  miw={300}
                  value={inputWhitelistValue}
                  onChange={(e) => setInputWhitelistValue(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span="content">
                <Box ta="center" w={105}>
                  <AddSettingsButton
                    disabled={!dropdownSelectedChain || !inputWhitelistValue}
                    onClick={addBlockchainWhiteList}
                  />
                </Box>
              </Grid.Col>
            </Grid>
          </Box>

          {selectedWhiteLists.length > 0 && (
            <ChainWhitelistTable
              blockchainWhitelist={selectedWhiteLists}
              blockchains={blockchains}
              onDelete={(chainId) => deleteSelectedChainWhitelist(chainId.blockchainID)}
            />
          )}

          <Divider my={32} />
          <Group justify="right">
            <Button
              color="gray"
              fw={400}
              fz="sm"
              type="button"
              variant="outline"
              w="156px"
              onClick={() => closeAllModals()}
            >
              Discard
            </Button>
            <Button
              disabled={selectedWhiteLists.length === 0}
              fw={400}
              fz="sm"
              px="xs"
              type="submit"
              w="156px"
              onClick={handleSave}
            >
              Save
            </Button>
          </Group>
        </Container>
      ) : (
        <LoadingOverlay
          visible
          loaderProps={{ children: <PortalLoader message="Adding approved chains..." /> }}
        />
      )}
    </>
  )
}

export default ChainWhitelistModal
