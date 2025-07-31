import { Divider, Button, Container, Group, LoadingOverlay, Box } from "@mantine/core"
import { useNavigation } from "@remix-run/react"
import React, { Dispatch, useMemo, useState } from "react"
import { SecurityReducerActions } from "../../utils/stateReducer"
import ChainsDropdown from "~/components/ChainsDropdown/ChainsDropdown"
import ModalHeader from "~/components/ModalHeader"
import PortalLoader from "~/components/PortalLoader"
import useModals from "~/hooks/useModals"
import { Blockchain } from "~/models/portal/sdk"
import ChainsTable from "~/routes/account.$accountId.$appId.security/components/ChainsTable"

type ApprovedChainsModalProps = {
  blockchains: Blockchain[]
  approvedChainsIds: string[]
  dispatch: Dispatch<SecurityReducerActions>
}

const ApprovedChainsModal = ({
  blockchains,
  approvedChainsIds,
  dispatch,
}: ApprovedChainsModalProps) => {
  const { state } = useNavigation()
  const { closeAllModals } = useModals()

  const [selectedBlockchainsIds, setSelectedBlockchainsIds] = useState<string[]>([])

  const dropdownChains = useMemo(
    () =>
      blockchains.filter(
        ({ id: blockchainID }) =>
          !selectedBlockchainsIds.some((id) => id === blockchainID) &&
          !approvedChainsIds.some((id) => id === blockchainID),
      ),
    [blockchains, selectedBlockchainsIds, approvedChainsIds],
  )

  const deleteSelectedChain = (chainId: string) => {
    setSelectedBlockchainsIds((ids) => ids.filter((id) => chainId !== id))
  }

  const handleSave = () => {
    dispatch({ type: "blockchains-add", payload: selectedBlockchainsIds })
    closeAllModals()
  }

  return (
    <>
      {state === "idle" ? (
        <Container>
          <ModalHeader
            subtitle="Limits the Endpoints to be used only with specific services."
            title="Whitelist Services"
            onDiscard={closeAllModals}
          />
          <Box px={8} py={24}>
            <ChainsDropdown
              chains={dropdownChains}
              width={300}
              onChange={(val) => {
                val && setSelectedBlockchainsIds((ids) => [...ids, val])
              }}
            />
          </Box>
          {selectedBlockchainsIds.length > 0 && (
            <ChainsTable
              blockchains={blockchains}
              selectedBlockchainsIds={selectedBlockchainsIds}
              onDeleteChain={(chainId) => deleteSelectedChain(chainId)}
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
              disabled={selectedBlockchainsIds.length === 0}
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
          loaderProps={{
            children: <PortalLoader message="Adding whitelist services..." />,
          }}
        />
      )}
    </>
  )
}

export default ApprovedChainsModal
