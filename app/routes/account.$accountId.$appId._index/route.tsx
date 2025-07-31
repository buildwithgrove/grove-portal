import { Affix, Divider, Transition, Box, Flex, Input, Button } from "@mantine/core"
import { useDebouncedValue, useWindowScroll } from "@mantine/hooks"
import { ActionFunction, json, MetaFunction } from "@remix-run/node"
import { useActionData, useOutletContext } from "@remix-run/react"
import { ArrowUp, Search } from "lucide-react"
import { useState } from "react"
import invariant from "tiny-invariant"
import { AppIdOutletContext } from "../account.$accountId.$appId/route"
import useActionNotification from "~/hooks/useActionNotification"
import { initPortalClient } from "~/models/portal/portal.server"
import { PortalApp, PortalAppEnvironment } from "~/models/portal/sdk"
import AppEndpointsTable from "~/routes/account.$accountId.$appId._index/components/AppEndpointsTable"
import { ActionDataStruct } from "~/types/global"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Application Endpoints ${seo_title_append}`,
    },
  ]
}

export type AppIdActionData = {
  app: PortalApp
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const formData = await request.formData()
  const { accountId, appId } = params
  const isFavorite = formData.get("isFavorite")
  const chainId = formData.get("chainId")
  const favoriteChains = formData.get("favoriteChains")

  try {
    invariant(accountId && typeof accountId === "string", "accountId not found")
    invariant(appId && typeof appId === "string", "appId not found")
    invariant(isFavorite && typeof isFavorite === "string", "isFavorite not found")
    invariant(chainId && typeof chainId === "string", "chainId not found")
    invariant(
      favoriteChains && typeof favoriteChains === "string",
      "favoriteChains not found",
    )

    const oldFavs: string[] = JSON.parse(favoriteChains)
    const newFavs =
      isFavorite === "true"
        ? [...oldFavs, chainId]
        : oldFavs.filter((f: string) => f !== chainId)

    const updateUserPortalAppResponse = await portal
      .updateUserPortalApp({
        input: {
          appID: appId,
          accountID: accountId,
          appSettings: {
            favoritedChainIDs: newFavs,
            environment: PortalAppEnvironment.Production,
          },
        },
      })
      .catch((err) => {
        console.error(err)
        throw new Error(
          `portal api could not update app ${appId} with favoriteChain ${chainId}`,
        )
      })

    if (!updateUserPortalAppResponse.updateUserPortalApp) {
      throw new Error(
        `portal api could not update app ${appId} with favoriteChain ${chainId}`,
      )
    }

    return json<ActionDataStruct<AppIdActionData>>({
      data: {
        app: updateUserPortalAppResponse.updateUserPortalApp as PortalApp,
      },
      error: false,
      message: "Favorite chain updated",
    })
  } catch (error) {
    return json<ActionDataStruct<AppIdActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export const Application = () => {
  const { app, blockchains, userRole } = useOutletContext<AppIdOutletContext>()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 200)
  const [scroll, scrollTo] = useWindowScroll()
  const actionData = useActionData<typeof action>()
  useActionNotification(actionData)

  return (
    <Box mb={70}>
      <Flex align="center" justify="flex-end" my="xl">
        <Input
          leftSection={<Search />}
          placeholder="Search service"
          value={searchTerm}
          onChange={(event: any) => setSearchTerm(event.currentTarget.value)}
        />
      </Flex>
      <Divider />
      <AppEndpointsTable
        app={app}
        blockchains={blockchains}
        readOnly={userRole === "MEMBER"}
        searchTerm={debouncedSearchTerm}
      />
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition mounted={scroll.y > 20} transition="slide-up">
          {(transitionStyles) => (
            <Button
              bg="var(--mantine-color-dark-4)"
              leftSection={<ArrowUp size={16} />}
              size="sm"
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </Box>
  )
}

export default Application
