import { Select } from "@mantine/core"
import { Search } from "lucide-react"
import { useMemo, useRef } from "react"
import { BlockchainsQuery } from "~/models/portal/sdk"

type ChainsDropdownProps = {
  chains: BlockchainsQuery["blockchains"]
  onChange: (chain: string | null) => void
  width?: string | number
}

const ChainsDropdown = ({ chains, onChange, width }: ChainsDropdownProps) => {
  const addNewChainSelectRef = useRef<HTMLInputElement>(null)

  const selectChainData = useMemo(() => {
    return chains.map((chain) => ({
      label: chain?.description ?? "",
      value: chain?.id ?? "",
    }))
  }, [chains])

  return (
    <Select
      ref={addNewChainSelectRef}
      searchable
      aria-label="Add new"
      data={selectChainData}
      leftSection={<Search size={18} />}
      placeholder="Search Service"
      rightSection={<></>}
      rightSectionWidth={0}
      w={width}
      onChange={onChange}
    />
  )
}

export default ChainsDropdown
