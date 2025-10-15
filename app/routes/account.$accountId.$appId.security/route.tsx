import { ActionFunction, json, MetaFunction } from "@remix-run/node"
import { useActionData, useOutletContext } from "@remix-run/react"
import invariant from "tiny-invariant"
import { AppIdOutletContext } from "../account.$accountId.$appId/route"
import SecurityView from "./view"
import useActionNotification from "~/hooks/useActionNotification"
import { initPortalClient } from "~/models/portal/portal.server"
import {
  PortalApp,
  UpdatePortalApp,
  Whitelists,
  WhitelistType,
} from "~/models/portal/sdk"
import { ActionDataStruct } from "~/types/global"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Application Security ${seo_title_append}`,
    },
  ]
}

export type SecurityActionData = {
  app: PortalApp
  length: number
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const formData = await request.formData()

  const { appId, accountId } = params
  invariant(typeof appId === "string", "appId must be set")
  invariant(typeof accountId === "string", "accountId must be set")

  const input: UpdatePortalApp = {
    appID: appId,
    accountID: accountId as string,
  }

  try {
    const secretKeyRequired = formData.get("secretKeyRequired")
    const whitelistJson = formData.get("whitelist")

    if (secretKeyRequired) {
      invariant(typeof secretKeyRequired === "string", "secretKeyRequired not found")

      input.appSettings = {
        secretKeyRequired: secretKeyRequired === "on",
      }
    }

    if (whitelistJson) {
      invariant(typeof whitelistJson === "string", "whitelist not found")
      const whitelist: Whitelists = JSON.parse(whitelistJson)
      input.whitelists = {
        appWhitelists: [
          {
            type: WhitelistType.Origins,
            values: whitelist.origins,
          },
          {
            type: WhitelistType.Blockchains,
            values: whitelist.blockchains,
          },
          {
            type: WhitelistType.UserAgents,
            values: whitelist.userAgents,
          },
        ],
        chainWhitelists: [
          {
            type: WhitelistType.Contracts,
            values: whitelist.contracts.map((contract) => ({
              chainID: contract?.blockchainID,
              values: contract?.contracts,
            })),
          },
          {
            type: WhitelistType.Methods,
            values: whitelist.methods.map((contract) => ({
              chainID: contract?.blockchainID,
              values: contract?.methods,
            })),
          },
        ],
      }
    }

    const response = await portal.updateUserPortalApp({ input }).catch((err) => {
      console.error(err)
      throw new Error(
        `portal api could not update app ${appId} with new security settings`,
      )
    })

    return json<ActionDataStruct<SecurityActionData>>({
      data: {
        app: response.updateUserPortalApp as PortalApp,
        length: JSON.stringify(response).length,
      },
      error: false,
      message: "Security setting successfully updated",
    })
  } catch (error) {
    return json<ActionDataStruct<SecurityActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export const AppSecurity = () => {
  const { app, services, userRole } = useOutletContext<AppIdOutletContext>()
  const actionData = useActionData() as ActionDataStruct<SecurityActionData>
  useActionNotification(actionData)
  return <SecurityView app={app} services={services} userRole={userRole} />
}

export default AppSecurity
