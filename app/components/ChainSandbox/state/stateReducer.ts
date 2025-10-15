import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { PortalApp } from "~/models/portal/sdk"
import { KeyValuePair } from "~/types/global"
import { isEvmService } from "~/utils/chainUtils"
export const DEFAULT_EVM_METHOD = "eth_blockNumber"
export type HttpMethod = "POST" | "GET"
export type ChainSandboxStateType = {
  selectedMethod?: string
  includeSecretKey: boolean
  selectedService: ServiceWithEndpoints | null
  selectedApp: PortalApp | null
  responseData: any
  chainRestPath: string
  chainUrl: string
  requestPayload: string
  requestHeaders: KeyValuePair<string>
  httpMethod: HttpMethod
}

export type ChainSandboxActionType =
  | { type: "SET_SELECTED_METHOD"; payload: string | undefined }
  | { type: "SET_INCLUDE_SECRET_KEY"; payload: boolean }
  | { type: "SET_SELECTED_SERVICE"; payload: ServiceWithEndpoints | null }
  | { type: "SET_SELECTED_APP"; payload: PortalApp }
  | { type: "SET_RESPONSE_DATA"; payload: any }
  | { type: "SET_CHAIN_REST_PATH"; payload: string }
  | { type: "SET_CHAIN_URL"; payload: string }
  | { type: "SET_REQUEST_HEADERS"; payload: KeyValuePair<string> }
  | { type: "SET_REQUEST_PAYLOAD"; payload: string }
  | { type: "SET_HTTP_METHOD"; payload: HttpMethod }
  | { type: "RESET_STATE" }

const reducer = (
  state: ChainSandboxStateType,
  action: ChainSandboxActionType,
): ChainSandboxStateType => {
  switch (action.type) {
    case "SET_SELECTED_METHOD":
      return { ...state, selectedMethod: action.payload }
    case "SET_INCLUDE_SECRET_KEY":
      return { ...state, includeSecretKey: action.payload }
    case "SET_SELECTED_SERVICE":
      return {
        ...state,
        selectedService: action.payload,
        selectedMethod: isEvmService(action.payload) ? DEFAULT_EVM_METHOD : undefined,
        chainRestPath: "",
        responseData: undefined,
        httpMethod: "POST",
      }
    case "SET_SELECTED_APP":
      return { ...state, selectedApp: action.payload }
    case "SET_RESPONSE_DATA":
      return { ...state, responseData: action.payload }
    case "SET_CHAIN_REST_PATH":
      return { ...state, chainRestPath: action.payload }
    case "SET_CHAIN_URL":
      return { ...state, chainUrl: action.payload }
    case "SET_REQUEST_HEADERS":
      return { ...state, requestHeaders: action.payload }
    case "SET_REQUEST_PAYLOAD":
      return { ...state, requestPayload: action.payload }
    case "SET_HTTP_METHOD":
      return { ...state, httpMethod: action.payload }
    case "RESET_STATE":
      return {
        ...state,
        chainUrl: "",
        chainRestPath: "",
        httpMethod: "POST",
        selectedService: null,
        responseData: undefined,
        selectedMethod: undefined,
        includeSecretKey: false,
      }
    default:
      return state
  }
}

export default reducer
