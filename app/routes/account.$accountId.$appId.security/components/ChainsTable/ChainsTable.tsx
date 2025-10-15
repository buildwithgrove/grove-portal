import { ActionIcon, Flex, TextInput } from "@mantine/core"
import { useParams } from "@remix-run/react"
import { Trash2 } from "lucide-react"
import { useMemo } from "react"
import Chain from "~/components/Chain"
import CopyTextButton from "~/components/CopyTextButton"
import { DataTable } from "~/components/DataTable"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { getAppEndpointUrl } from "~/utils/chainUtils"

type ChainsTableProps = {
  services: ServiceWithEndpoints[]
  selectedBlockchainsIds: string[]
  onDeleteChain: (chainId: string) => void
  readOnly?: boolean
}

const ChainsTable = ({
  services,
  selectedBlockchainsIds,
  onDeleteChain,
  readOnly,
}: ChainsTableProps) => {
  const { appId } = useParams()

  const selectedServices = useMemo(
    () =>
      services.filter(({ service_id }) =>
        selectedBlockchainsIds.some((id) => service_id === id),
      ),
    [services, selectedBlockchainsIds],
  )

  return (
    selectedServices && (
      <DataTable
        data={selectedServices.map((service) => {
          return {
            chain: {
              element: <Chain chain={service} />,
              value: `${service?.service_name} ${service?.service_id}`,
              cellProps: {
                style: { minWidth: "250px" },
                width: "30%",
              },
            },
            endpointUrl: {
              element: (
                <TextInput readOnly miw={300} value={getAppEndpointUrl(service, appId)} />
              ),
            },
            action: {
              element: (
                <Flex gap="lg" justify="flex-end">
                  <CopyTextButton value={getAppEndpointUrl(service, appId)} />
                  {!readOnly && (
                    <ActionIcon
                      aria-label={`Delete ${service.service_name}`}
                      radius="xl"
                      size={40}
                      variant="outline"
                      onClick={() => onDeleteChain(service.service_id)}
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
    )
  )
}
export default ChainsTable
