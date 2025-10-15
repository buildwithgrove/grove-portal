import { ActionIcon, Flex, TextInput } from "@mantine/core"
import { Trash2 } from "lucide-react"
import { useMemo } from "react"
import Chain from "~/components/Chain"
import CopyTextButton from "~/components/CopyTextButton"
import { DataTable } from "~/components/DataTable"
import { Blockchain } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { BlockchainWhitelist } from "~/routes/account.$accountId.$appId.security/utils/utils"

type ChainsTableProps = {
  services: ServiceWithEndpoints[]
  blockchainWhitelist: BlockchainWhitelist[]
  readOnly?: boolean
  onDelete: (val: BlockchainWhitelist) => void
}

const ChainWhitelistTable = ({
  services,
  blockchainWhitelist,
  readOnly,
  onDelete,
}: ChainsTableProps) => {
  const data = useMemo(
    () =>
      blockchainWhitelist.map(({ blockchainID, whitelistValue }) => {
        const blockchain = blockchains.find((c) => c?.id === blockchainID)

        return {
          ...blockchain,
          whitelistValue,
        }
      }),
    [blockchainWhitelist, blockchains],
  )

  return data && data.length > 0 ? (
    <DataTable
      data={data?.map((chain) => {
        return {
          chain: {
            element: <Chain chain={chain as Blockchain} />,
            value: `${chain?.description} ${chain?.blockchain}`,
            cellProps: {
              style: { minWidth: "250px" },
              width: "30%",
            },
          },
          endpointUrl: {
            element: <TextInput readOnly miw={300} value={chain.whitelistValue} />,
          },
          action: {
            element: (
              <Flex gap="lg" justify="flex-end">
                <CopyTextButton value={chain.whitelistValue} />
                {!readOnly && (
                  <ActionIcon
                    aria-label="Copy chain whitelist value"
                    radius="xl"
                    size={40}
                    variant="outline"
                    onClick={() =>
                      onDelete({
                        blockchainID: chain.id as string,
                        whitelistValue: chain.whitelistValue,
                      })
                    }
                  >
                    <Trash2 size={18} />
                  </ActionIcon>
                )}
              </Flex>
            ),
            cellProps: {
              style: { minWidth: "130px" },
              width: "130px",
            },
          },
        }
      })}
      paginate={false}
    />
  ) : null
}
export default ChainWhitelistTable
