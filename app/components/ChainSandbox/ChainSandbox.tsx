import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"
import { Blockchain, PortalApp } from "~/models/portal/sdk"
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

type ChainSandboxProps = {
  apps?: PortalApp[]
  chains: Blockchain[]
}

const ChainSandbox = ({ apps, chains }: ChainSandboxProps) => {
  const chainFetcher: FetcherWithComponents<SandboxRequestData> = useFetcher()
  const { state, dispatch } = useChainSandboxContext()
  const {
    selectedApp,
    includeSecretKey,
    selectedChain,
    responseData,
    chainRestPath,
    requestPayload,
    requestHeaders,
    httpMethod,
  } = state

  const appId = selectedApp?.id
  const secretKey = selectedApp?.settings?.secretKey as string

  const chainUrl = useMemo(
    () => `${getAppEndpointUrl(selectedChain, appId)}${chainRestPath || ""}`.trim(),
    [selectedChain, appId, chainRestPath],
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
      label: `App ID: ${appId}, Blockchain: ${selectedChain?.blockchain}`,
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

  return selectedChain ? (
    <Stack>
      <ChainSandboxInputs
        apps={apps}
        chains={chains}
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
