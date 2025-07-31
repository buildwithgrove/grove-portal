import { getRequiredClientEnvVar } from "./environment"
import { Blockchain } from "~/models/portal/sdk"
import { KeyValuePair } from "~/types/global"

export const CHAIN_DOCS_URL: KeyValuePair<string> = {
  "arbitrum-one": "arbitrum-one-api/intro",
  "arbitrum-sepolia-testnet": "arbitrum-one-api/intro",
  "avax": "avalanche-api/intro",
  "avax-dfk": "avalanche-api/intro",
  "base": "base-api/intro",
  "base-testnet": "base-api/intro",
  "berachain": "berachain/intro",
  "blast": "blastchain-api/intro",
  "boba": "boba-api/intro",
  "bsc": "binance-smart-chain-api/intro",
  "celo": "celo-api/intro",
  "eth": "ethereum-api/intro",
  "eth-holesky-testnet": "ethereum-api/intro",
  "eth-sepolia-testnet": "ethereum-api/intro",
  "evmos": "evmos-api/intro",
  "fantom": "fantom-api/intro",
  "fraxtal": "fraxtal-api/intro",
  "fuse": "fuse-api/intro",
  "gnosis": "gnosis-api/intro",
  "harmony": "harmony-shard-0-api/intro",
  "ink": "ink-api/intro",
  "iotex": "iotex-api/intro",
  "kaia": "kaia-api/intro",
  "kava": "kava-api/intro",
  "linea": "linea-api/intro",
  "mantle": "mantle-api/intro",
  "metis": "metis-api/intro",
  "moonbeam": "moonbeam-api/intro",
  "moonriver": "moonriver-api/intro",
  "near": "near-api/intro",
  "oasys": "oasys-api/intro",
  "opbnb": "opbnb-api/intro",
  "optimism": "optimism-api/intro",
  "optimism-sepolia-testnet": "optimism-api/intro",
  "osmosis": "osmosis-api/intro",
  "pocket": "pocket-api/intro",
  "polygon": "polygon-api/intro",
  "polygon-amoy-testnet": "polygon-api/intro",
  "polygon-zkevm": "polygon-api/intro",
  "radix": "radix-api/intro",
  "scroll": "scroll-api/intro",
  "sei": "sei-api/intro",
  "solana": "solana-api/intro",
  "sonic": "sonic-api/intro",
  "sui": "sui-api/intro",
  "taiko": "taiko-api/intro",
  "taiko-hekla-testnet": "taiko-api/intro",
  "tron": "tron-api/intro",
  "xrplevm": "xrpl-api/intro",
  "xrpl-evm-testnet": "xrpl-api/intro",
  "zklink-nova": "zklink-nova-api/intro",
  "zksync-era": "zksync-era-api/intro",
}

// evmChains is an array of the relay chain IDs for EVM chains.
// It must be updated whenever a new EVM chain is added to the relay.
export const evmChains = [
  "1234", // xrplevm
  "F001", // arbitrum-one
  "F002", // arbitrum-sepolia-testnet
  "F003", // avax
  "F004", // avax-dfk
  "F005", // base
  "F006", // base-testnet
  "F008", // blast
  "F009", // bsc
  "F00A", // boba
  "F00B", // celo
  "F00C", // eth
  "F00D", // eth-holesky-testnet
  "F00E", // eth-sepolia-testnet
  "F00F", // evmos
  "F010", // fantom
  "F011", // fraxtal
  "F012", // fuse
  "F013", // gnosis
  "F014", // harmony
  "F015", // iotex
  "F016", // kaia
  "F017", // kava
  "F018", // metis
  "F019", // moonbeam
  "F01A", // moonriver
  "F01C", // oasys
  "F01D", // optimism
  "F01E", // optimism-sepolia-testnet
  "F01F", // opbnb
  "F021", // polygon
  "F022", // polygon-amoy-testnet
  "F024", // scroll
  "F027", // taiko
  "F028", // taiko-hekla-testnet
  "F029", // polygon-zkevm
  "F02A", // zklink
  "F02B", // zksync-era
  "F02C", // xrpl-evm-devnet
  "F02D", // sonic
  "F02E", // TRON
  "F030", // linea
  "F031", // berachain-bartio-testnet
  "F032", // ink
  "F033", // mantle
  "F034", // sei
  "F035", // berachain
]

export const evmMethods = [
  "eth_accounts",
  "eth_blockNumber",
  "eth_call",
  "eth_chainId",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_getBalance",
  "eth_getBlockByHash",
  "eth_getBlockByNumber",
  "eth_getBlockTransactionCountByHash",
  "eth_getBlockTransactionCountByNumber",
  "eth_getCode",
  "eth_getLogs",
  "eth_getStorageAt",
  "eth_getTransactionByBlockHashAndIndex",
  "eth_getTransactionByBlockNumberAndIndex",
  "eth_getTransactionByHash",
  "eth_getTransactionCount",
  "eth_getTransactionReceipt",
  "eth_getUncleByBlockHashAndIndex",
  "eth_getUncleByBlockNumberAndIndex",
  "eth_getUncleCountByBlockHash",
  "eth_getUncleCountByBlockNumber",
  "eth_getProof",
  "eth_getWork",
  "eth_hashrate",
  "eth_mining",
  "eth_protocolVersion",
  "eth_sendRawTransaction",
  "eth_submitWork",
  "eth_syncing",
]

// isEvmChain uses the relay chain IDs defined in the evmChains array in this file
// Using the chain ID is more reliable than using the blockchain alias as it is strictly
// one to one.
export const isEvmChain = (chain: Blockchain | null): boolean =>
  !!chain && evmChains.includes(chain.id)

export const getAppEndpointUrl = (
  chain: Blockchain | undefined | null,
  appId: string | undefined,
) => {
  let env = "city"

  return `https://${chain?.blockchain}.rpc.grove.${env}/v1/${appId}`
}

export const getAppWebSocketUrl = (
  chain: Blockchain | undefined | null,
  appId: string | undefined,
) => {
  let env = "city"

  return `wss://${chain?.blockchain}.rpc.grove.${env}/v1/${appId}`
}

export const getChainName = ({
  chainId,
  chains,
}: {
  chainId: string | undefined
  chains: Blockchain[]
}): string => {
  if (!chainId) {
    return ""
  }
  const chain = chains.find((chain) => chain.id === chainId)
  return chain?.blockchain ?? chainId
}
