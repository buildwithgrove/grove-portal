import { Drawer } from "@mantine/core"
import React, { useEffect } from "react"
import ChainSandbox from "app/components/ChainSandbox"
import useChainSandboxContext from "~/components/ChainSandbox/state"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"

type ChainSandboxSideDrawerProps = {
  service?: ServiceWithEndpoints
  services: ServiceWithEndpoints[]
  onSideDrawerClose: () => void
}

const ChainSandboxSideDrawer = ({
  service,
  services,
  onSideDrawerClose,
}: ChainSandboxSideDrawerProps) => {
  const { dispatch } = useChainSandboxContext()

  /*
    This is necessary because the blockchain prop can change over time, and without this, changes to the blockchain
    prop would not be reflected in the component after the initial render. The component is mounted only once, when
    route is loaded, since this is how Mantine Drawer works.
  */
  useEffect(() => {
    if (service) {
      dispatch({ type: "SET_SELECTED_SERVICE", payload: service })
    }
  }, [service, dispatch])

  const handleSideDrawerClose = () => {
    dispatch({ type: "RESET_STATE" })
    onSideDrawerClose()
  }

  return (
    <Drawer
      opened={!!service}
      padding="lg"
      position="right"
      size={800}
      onClose={handleSideDrawerClose}
    >
      <ChainSandbox services={services} />
    </Drawer>
  )
}

export default ChainSandboxSideDrawer
