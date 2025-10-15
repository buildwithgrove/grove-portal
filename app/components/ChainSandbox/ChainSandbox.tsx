import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { PortalApp } from "~/models/portal/sdk"
import { Divider, Stack, Title } from "@mantine/core"
import { FetcherWithComponents, useFetcher } from "@remix-run/react"
import { useEffect, useMemo } from "react"

import ChainSandboxBody from "~/components/ChainSandbox/components/ChainSandboxBody"
import ChainSandboxHeaders from "~/components/ChainSandbox/components/ChainSandboxHeaders"
import ChainSandboxInputs from "~/components/ChainSandbox/components/ChainSandboxInputs"
import CodeEditor from "~/components/CodeEditor"
import { SandboxRequestData } from "~/routes/api.sandbox/route"
import { getAppEndpointUrl } from "~/utils/chainUtils"
import useChainSandboxContext from "~/components/ChainSandbox/state"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"

type ChainSandboxProps = {
  apps?: PortalApp[]
  services: ServiceWithEndpoints[]
}

const ChainSandbox = ({ apps, services }: ChainSandboxProps) => {
  const chainFetcher: FetcherWithComponents<SandboxRequestData> = useFetcher()
  const { state, dispatch } = useChainSandboxContext()
  const {
    selectedApp,
    includeSecretKey,
    selectedService,
    responseData,
    chainRestPath,
    requestPayload,
    requestHeaders,
    httpMethod,
  } = state

  const appId = selectedApp?.id
  const secretKey = selectedApp?.settings?.secretKey as string

  const chainUrl = useMemo(
    () => `${getAppEndpointUrl(selectedService, appId)}${chainRestPath || ""}`.trim(),
    [selectedService, appId, chainRestPath],
  )

  useEffect(() => {
    if (chainFetcher?.data?.data) {
      dispatch({ type: "SET_RESPONSE_DATA", payload: chainFetcher?.data?.data })
    }
  }, [chainFetcher?.data?.data, dispatch])
  const sendRequest = () => {
    trackEvent({
      category: AnalyticCategories.app,
      action: AnalyticActions.app_chain_sandbox_edit_body,
      label: `App ID: ${appId}, Service: ${selectedService?.service_id}`,
      value: requestPayload,
    })
    chainFetcher.submit(
      {
        payload: requestPayload,
        chainUrl,
        httpMethod,
        ...(includeSecretKey && { secretKey }),
      },
      {
        method: "POST",
        action: "/api/sandbox",
      },
    )
  }

  return selectedService ? (
    <Stack>
      <ChainSandboxInputs
        apps={apps}
        services={services}
        isLoading={chainFetcher.state === "submitting"}
        onSendRequest={sendRequest}
      />
      <Divider />
      <ChainSandboxHeaders />
      <Divider />
      <ChainSandboxBody chainUrl={chainUrl} requestHeaders={requestHeaders} />
      {responseData ? (
        <>
          <Divider />
          <Stack gap={12}>
            <Title order={6}>Response</Title>
            <CodeEditor
              readOnly
              lang="json"
              value={JSON.stringify(responseData, null, " ")}
            />
          </Stack>
        </>
      ) : null}
    </Stack>
  ) : null
}

export default ChainSandbox
