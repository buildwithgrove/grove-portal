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
import { Blockchain, PortalApp } from "~/models/portal/sdk"
import ChainSandboxSideDrawer from "~/routes/account.$accountId.$appId._index/components/ChainSandboxSideDrawer"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { CHAIN_DOCS_URL, getAppEndpointUrl, getAppWebSocketUrl } from "~/utils/chainUtils"
import { DOCS_PATH } from "~/utils/utils"

type AppEndpointsProps = {
  app: PortalApp
  blockchains: Blockchain[]
  searchTerm: string
  readOnly: boolean
}

const AppEndpointsTable = ({
  app,
  blockchains,
  searchTerm,
  readOnly,
}: AppEndpointsProps) => {
  const { appId } = useParams()
  const fetcher = useFetcher()
  const fetcherData = fetcher.data as ActionNotificationData
  const navigation = useNavigation()
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain>()
  const favoriteChains = app.settings.favoritedChainIDs

  // handle notification for menu fetcher action
  useActionNotification(fetcherData)

  const chains = useMemo(() => {
    const fav = blockchains
      .filter((chain) => favoriteChains?.includes(chain.id))
      .map((c) => ({
        ...c,
        favorite: true,
      }))

    const other = blockchains
      .filter((chain) => !favoriteChains?.includes(chain.id))
      .map((c) => ({
        ...c,
        favorite: false,
      }))

    return [...fav, ...other]
  }, [favoriteChains, blockchains])

  return (
    <>
      <ChainSandboxProvider initialStateValue={{ selectedApp: app }}>
        <ChainSandboxSideDrawer
          blockchain={selectedBlockchain}
          chains={chains}
          onSideDrawerClose={() => setSelectedBlockchain(undefined)}
        />
      </ChainSandboxProvider>
      {blockchains && (
        <DataTable
          data={chains.map((chain) => {
            return {
              chain: {
                element: (
                  <Flex gap="sm">
                    <FavoriteChain
                      blockchain={chain}
                      favoriteChains={favoriteChains}
                      readOnly={navigation.state !== "idle"}
                    />
                    <Chain chain={chain} />
                  </Flex>
                ),
                value: `${chain.description} ${chain.blockchain}`,
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
                          value={getAppEndpointUrl(chain, appId)}
                          variant="transparent"
                          width={28}
                        />
                      }
                      value={getAppEndpointUrl(chain, appId)}
                    />
                    {chain.websocketsEnabled && (
                      <TextInput
                        readOnly
                        miw={300}
                        rightSection={
                          <CopyTextButton
                            size={16}
                            value={getAppWebSocketUrl(chain, appId)}
                            variant="transparent"
                            width={28}
                          />
                        }
                        value={getAppWebSocketUrl(chain, appId)}
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
                        aria-label={`Open Chain Sandbox for ${chain.description}`}
                        color="gray"
                        radius="xl"
                        size={40}
                        variant="subtle"
                        onClick={() => {
                          setSelectedBlockchain(chain)
                          trackEvent({
                            category: AnalyticCategories.app,
                            action: AnalyticActions.app_chain_sandbox_try,
                            label: `Blockchain: ${chain.blockchain}`,
                          })
                        }}
                      >
                        <Play size={18} style={{ position: "relative", left: 2 }} />
                      </ActionIcon>
                    </Tooltip>
                    <Menu>
                      <ContextMenuTarget variant="subtle" />
                      <Menu.Dropdown>
                        {chain.blockchain && CHAIN_DOCS_URL[chain.blockchain] && (
                          <Menu.Item leftSection={<Book size={18} />}>
                            <UnstyledButton
                              component="a"
                              fz="sm"
                              href={`${DOCS_PATH}/${CHAIN_DOCS_URL[chain.blockchain]}`}
                              rel="noreferrer"
                              target="_blank"
                              onClick={() => {
                                trackEvent({
                                  category: AnalyticCategories.app,
                                  action: AnalyticActions.app_chain_docs,
                                  label: chain.id,
                                })
                              }}
                            >
                              Documentation
                            </UnstyledButton>
                          </Menu.Item>
                        )}

                        {!readOnly && (
                          <Menu.Item
                            leftSection={
                              <Star
                                fill={chain.favorite ? "currentColor" : "none"}
                                size={18}
                              />
                            }
                            onClick={() => {
                              trackEvent({
                                category: AnalyticCategories.app,
                                action: AnalyticActions.app_chain_favorite,
                                label: `${chain.favorite ? "Remove" : "Add"} favorite ${
                                  chain.id
                                }`,
                              })
                              fetcher.submit(
                                {
                                  isFavorite: String(!chain.favorite),
                                  chainId: chain.id,
                                  favoriteChains: JSON.stringify(favoriteChains),
                                },
                                {
                                  method: "post",
                                },
                              )
                            }}
                          >
                            {chain.favorite ? "Remove favorite" : "Mark as favorite"}
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
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
