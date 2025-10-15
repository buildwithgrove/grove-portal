import {
  ActionIcon,
  Flex,
  Menu,
  Stack,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core"
import { useFetcher, useNavigation, useParams } from "@remix-run/react"
import { Book, Play, Star } from "lucide-react"
import React, { useMemo, useState } from "react"
import FavoriteChain from "../FavoriteChain"
import Chain from "~/components/Chain"
import { ChainSandboxProvider } from "~/components/ChainSandbox/state"
import ContextMenuTarget from "~/components/ContextMenuTarget"
import CopyTextButton from "~/components/CopyTextButton"
import { DataTable } from "~/components/DataTable"
import useActionNotification, {
  ActionNotificationData,
} from "~/hooks/useActionNotification"
import { PortalApp } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import ChainSandboxSideDrawer from "~/routes/account.$accountId.$appId._index/components/ChainSandboxSideDrawer"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { CHAIN_DOCS_URL, getAppEndpointUrl, getAppWebSocketUrl } from "~/utils/chainUtils"
import { DOCS_PATH } from "~/utils/utils"

type AppEndpointsProps = {
  app: PortalApp
  services: ServiceWithEndpoints[]
  searchTerm: string
  readOnly: boolean
}

const AppEndpointsTable = ({
  app,
  services,
  searchTerm,
  readOnly,
}: AppEndpointsProps) => {
  const { appId } = useParams()
  const fetcher = useFetcher()
  const fetcherData = fetcher.data as ActionNotificationData
  const navigation = useNavigation()
  const [selectedService, setSelectedService] = useState<ServiceWithEndpoints>()
  const favoriteChains = app.settings.favoritedChainIDs

  // handle notification for menu fetcher action
  useActionNotification(fetcherData)

  const servicesWithFavorites = useMemo(() => {
    const fav = services
      .filter((service) => favoriteChains?.includes(service.service_id))
      .map((c) => ({
        ...c,
        favorite: true,
      }))

    const other = services
      .filter((service) => !favoriteChains?.includes(service.service_id))
      .map((c) => ({
        ...c,
        favorite: false,
      }))

    return [...fav, ...other]
  }, [favoriteChains, services])

  return (
    <>
      <ChainSandboxProvider initialStateValue={{ selectedApp: app }}>
        <ChainSandboxSideDrawer
          service={selectedService}
          services={servicesWithFavorites}
          onSideDrawerClose={() => setSelectedService(undefined)}
        />
      </ChainSandboxProvider>
      {services && (
        <DataTable
          data={servicesWithFavorites.map((service) => {
            return {
              chain: {
                element: (
                  <Flex gap="sm">
                    <FavoriteChain
                      service={service}
                      favoriteChains={favoriteChains}
                      readOnly={navigation.state !== "idle"}
                    />
                    <Chain chain={service} />
                  </Flex>
                ),
                value: `${service.service_name} ${service.service_id}`,
                cellProps: {
                  style: { minWidth: "340px" },
                  width: "35%",
                },
              },
              endpointUrl: {
                element: (
                  <Stack gap="xs">
                    <TextInput
                      readOnly
                      miw={300}
                      rightSection={
                        <CopyTextButton
                          size={16}
                          value={getAppEndpointUrl(service, appId)}
                          variant="transparent"
                          width={28}
                        />
                      }
                      value={getAppEndpointUrl(service, appId)}
                    />
                    {service.hasWebsocket && (
                      <TextInput
                        readOnly
                        miw={300}
                        rightSection={
                          <CopyTextButton
                            size={16}
                            value={getAppWebSocketUrl(service, appId)}
                            variant="transparent"
                            width={28}
                          />
                        }
                        value={getAppWebSocketUrl(service, appId)}
                      />
                    )}
                  </Stack>
                ),
              },
              action: {
                element: (
                  <Flex gap="lg" justify="flex-end">
                    <Tooltip withArrow label="Try in Sandbox">
                      <ActionIcon
                        aria-label={`Open Chain Sandbox for ${service.service_name}`}
                        color="gray"
                        radius="xl"
                        size={40}
                        variant="subtle"
                        onClick={() => {
                          setSelectedService(service)
                          trackEvent({
                            category: AnalyticCategories.app,
                            action: AnalyticActions.app_chain_sandbox_try,
                            label: `Service: ${service.service_id}`,
                          })
                        }}
                      >
                        <Play size={18} style={{ position: "relative", left: 2 }} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip withArrow label="Documentation">
                      <ActionIcon
                        aria-label={`View documentation for ${service.service_name}`}
                        color="gray"
                        radius="xl"
                        size={40}
                        variant="subtle"
                        component="a"
                        href={
                          service.service_id
                            ? `${DOCS_PATH}/service-apis/${service.service_id}-api`
                            : DOCS_PATH
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          trackEvent({
                            category: AnalyticCategories.app,
                            action: AnalyticActions.app_chain_docs,
                            label: service.service_id,
                          })
                        }}
                      >
                        <Book size={18} />
                      </ActionIcon>
                    </Tooltip>
                    {!readOnly && (
                      <Menu>
                        <ContextMenuTarget variant="subtle" />
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={
                              <Star
                                fill={service.favorite ? "currentColor" : "none"}
                                size={18}
                              />
                            }
                            onClick={() => {
                              trackEvent({
                                category: AnalyticCategories.app,
                                action: AnalyticActions.app_chain_favorite,
                                label: `${service.favorite ? "Remove" : "Add"} favorite ${service.service_id
                                  }`,
                              })
                              fetcher.submit(
                                {
                                  isFavorite: String(!service.favorite),
                                  chainId: service.service_id,
                                  favoriteChains: JSON.stringify(favoriteChains),
                                },
                                {
                                  method: "post",
                                },
                              )
                            }}
                          >
                            {service.favorite ? "Remove favorite" : "Mark as favorite"}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Flex>
                ),
                cellProps: {
                  style: { minWidth: "130px" },
                  width: "130px%",
                },
              },
            }
          })}
          paginate={false}
          searchTerm={searchTerm}
        />
      )}
    </>
  )
}

export default AppEndpointsTable
