import React, { ReactNode, createContext, useContext, useReducer } from "react"
import reducer, {
  ChainSandboxActionType,
  ChainSandboxStateType,
} from "~/components/ChainSandbox/state/stateReducer"

const initialState: ChainSandboxStateType = {
  selectedApp: null,
  selectedMethod: undefined,
  includeSecretKey: false,
  selectedChain: null,
  responseData: undefined,
  chainRestPath: "",
  chainUrl: "",
  requestPayload: "{}",
  requestHeaders: {
    "Content-Type": "application/json",
  },
  httpMethod: "POST",
}

export const ChainSandboxContext = createContext<{
  state: ChainSandboxStateType
  dispatch: React.Dispatch<ChainSandboxActionType>
}>({
  state: initialState,
  dispatch: () => null,
})

export const ChainSandboxProvider = ({
  children,
  initialStateValue,
}: {
  children: ReactNode
  initialStateValue?: Partial<ChainSandboxStateType>
}) => {
  const [state, dispatch] = useReducer(reducer, { ...initialState, ...initialStateValue })

  return (
    <ChainSandboxContext.Provider value={{ state, dispatch }}>
      {children}
    </ChainSandboxContext.Provider>
  )
}

const useChainSandboxContext = () => useContext(ChainSandboxContext)

export default useChainSandboxContext
