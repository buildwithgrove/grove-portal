import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core"
import { Book } from "lucide-react"
import React, { useMemo } from "react"
import useChainSandboxContext from "~/components/ChainSandbox/state"
import { HttpMethod } from "~/components/ChainSandbox/state/stateReducer"
import ChainSelectItem from "~/components/ChainSelectItem"
import CopyTextButton from "~/components/CopyTextButton"
import FluidSelect from "~/components/FluidSelect"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { PortalApp } from "~/models/portal/sdk"
import { getAppNameWithEmoji } from "~/utils/accountUtils"
import {
  CHAIN_DOCS_URL,
  evmMethods,
  getAppEndpointUrl,
  isEvmService,
} from "~/utils/chainUtils"
import { DOCS_PATH } from "~/utils/utils"

type ChainSandboxInputsProps = {
  apps?: PortalApp[]
  services: ServiceWithEndpoints[]
  isLoading: boolean
  onSendRequest: () => void
}

type HttpMethodOption = { value: HttpMethod; label: HttpMethod }

const httpMethods: HttpMethodOption[] = [
  { value: "POST", label: "POST" },
  { value: "GET", label: "GET" },
]

// Utility function to check if service has JSON-RPC endpoints
const isRpcService = (service: ServiceWithEndpoints | null): boolean => {
  if (!service) return false
  return service.endpoints.some((endpoint) => endpoint.endpoint_type === "JSON-RPC")
}

const ChainSandboxInputs = ({
  apps,
  services,
  isLoading,
  onSendRequest,
}: ChainSandboxInputsProps) => {
  const { state, dispatch } = useChainSandboxContext()
  const { selectedService, selectedApp, selectedMethod, chainRestPath, httpMethod } = state
  const appId = selectedApp?.id
  const isRpc = isRpcService(selectedService)

  const servicesSelectItems = services?.map((service) => ({
    value: service.service_id,
    label: service.service_name ?? service.service_id,
    service,
  }))

  const appsSelectItems = [
    ...(apps && apps.length > 0
      ? apps.map((app) => ({
        value: app?.id ?? "",
        label: getAppNameWithEmoji(app),
      }))
      : []),
  ]

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((service) => service.service_id === serviceId)
    if (service) {
      dispatch({ type: "SET_SELECTED_SERVICE", payload: service })
    }
  }

  const handleAppSelect = (appId: string) => {
    const app = apps?.find((app) => app.id === appId)
    if (app) {
      dispatch({ type: "SET_SELECTED_APP", payload: app })
    }
  }

  const serviceMethods = useMemo(
    () =>
      isEvmService(selectedService)
        ? evmMethods.map((method) => ({ value: method, label: method }))
        : [],
    [selectedService],
  )

  return selectedService ? (
    <Stack gap="xl">
      <Group>
        <Group className="bordered-container" gap={0} pos="relative">
          {appsSelectItems.length > 0 ? (
            <>
              <FluidSelect
                items={appsSelectItems}
                placeholder="Select App"
                value={appId}
                onSelect={handleAppSelect}
              />
              <Divider orientation="vertical" />
            </>
          ) : null}
          <FluidSelect
            withSearch
            itemComponent={ChainSelectItem}
            items={servicesSelectItems}
            value={selectedService?.service_id}
            onSelect={handleServiceSelect}
          />
          <Divider orientation="vertical" />
          {isRpc ? (
            <Tooltip
              disabled={serviceMethods.length > 0}
              label="Currently, methods are only available for EVM chains. Enter a method in the body instead."
            >
              <FluidSelect
                withSearch
                disabled={serviceMethods.length === 0}
                items={serviceMethods}
                placeholder="Select Method"
                value={selectedMethod}
                onSelect={(method) =>
                  dispatch({ type: "SET_SELECTED_METHOD", payload: method })
                }
              />
            </Tooltip>
          ) : (
            <FluidSelect
              items={httpMethods}
              placeholder="Select HTTP Method"
              value={httpMethod}
              onSelect={(method) =>
                dispatch({ type: "SET_HTTP_METHOD", payload: method as HttpMethod })
              }
            />
          )}
        </Group>

        <Group gap="sm">
          <Button
            loading={isLoading}
            radius={4}
            size="sm"
            color="green.7"
            onClick={onSendRequest}
          >
            Send Request
          </Button>
          {selectedService && (
            <Tooltip withArrow label="View Documentation">
              <ActionIcon
                aria-label={`View documentation for ${selectedService.service_name}`}
                color="gray"
                radius="xl"
                size={36}
                variant="subtle"
                component="a"
                href={
                  selectedService.service_id && CHAIN_DOCS_URL[selectedService.service_id]
                    ? `${DOCS_PATH}/${CHAIN_DOCS_URL[selectedService.service_id]}`
                    : DOCS_PATH
                }
                target="_blank"
                rel="noreferrer"
              >
                <Book size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
      <Stack>
        <Stack>
          <Title order={6}>Endpoint URL</Title>
          <TextInput
            readOnly
            miw={300}
            rightSection={
              <CopyTextButton
                size={16}
                value={getAppEndpointUrl(selectedService, appId)}
                variant="transparent"
                width={28}
              />
            }
            value={getAppEndpointUrl(selectedService, appId)}
          />
        </Stack>
        {!isRpc ? (
          <Stack>
            <Title order={6}>Path</Title>
            <TextInput
              autoFocus
              placeholder="Path"
              style={{ flexGrow: 1 }}
              value={chainRestPath}
              onChange={(e) => {
                dispatch({ type: "SET_CHAIN_REST_PATH", payload: e.currentTarget.value })
              }}
              onFocus={() => {
                if (!chainRestPath)
                  dispatch({ type: "SET_CHAIN_REST_PATH", payload: "/" })
              }}
            />
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  ) : null
}

export default ChainSandboxInputs
