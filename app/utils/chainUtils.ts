import { getRequiredClientEnvVar } from "./environment"
import { Blockchain } from "~/models/portal/sdk"
import { KeyValuePair } from "~/types/global"

export const CHAIN_DOCS_URL: KeyValuePair<string> = {
  "arbitrum-one": "arbitrum-one-api/intro",
  "arbitrum-sepolia-testnet": "arbitrum-one-api/intro",
  avax: "avalanche-api/intro",
  "avax-dfk": "avalanche-api/intro",
  base: "base-api/intro",
  "base-testnet": "base-api/intro",
  berachain: "berachain-api/intro",
  blast: "blastchain-api/intro",
  boba: "boba-api/intro",
  bsc: "binance-smart-chain-api/intro",
  celo: "celo-api/intro",
  eth: "ethereum-api/intro",
  "eth-holesky-testnet": "ethereum-api/intro",
  "eth-sepolia-testnet": "ethereum-api/intro",
  evmos: "evmos-api/intro",
  fantom: "fantom-api/intro",
  fraxtal: "fraxtal-api/intro",
  fuse: "fuse-api/intro",
  gnosis: "gnosis-api/intro",
  harmony: "harmony-shard-0-api/intro",
  ink: "ink-api/intro",
  iotex: "iotex-api/intro",
  kaia: "kaia-api/intro",
  kava: "kava-api/intro",
  linea: "linea-api/intro",
  mantle: "mantle-api/intro",
  metis: "metis-api/intro",
  moonbeam: "moonbeam-api/intro",
  moonriver: "moonriver-api/intro",
  near: "near-api/intro",
  oasys: "oasys-api/intro",
  opbnb: "opbnb-api/intro",
  optimism: "optimism-api/intro",
  "optimism-sepolia-testnet": "optimism-api/intro",
  osmosis: "osmosis-api/intro",
  pocket: "pocket-api/intro",
  polygon: "polygon-api/intro",
  "polygon-amoy-testnet": "polygon-api/intro",
  "polygon-zkevm": "polygon-api/intro",
  radix: "radix-api/intro",
  scroll: "scroll-api/intro",
  sei: "sei-api/intro",
  solana: "solana-api/intro",
  sonic: "sonic-api/intro",
  sui: "sui-api/intro",
  taiko: "taiko-api/intro",
  "taiko-hekla-testnet": "taiko-api/intro",
  tron: "tron-api/intro",
  xrplevm: "xrpl-api/intro",
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

// Blockchain name to hex chainID mapping
// Maps blockchain names to hex chainIDs for API filtering
export const BLOCKCHAIN_NAME_TO_HEX_CHAIN_ID: KeyValuePair<string> = {
  "arb-one": "F001",
  "arb-sepolia-testnet": "F002", 
  "avax": "F003",
  "avax-dfk": "F004",
  "base": "F005",
  "base-sepolia-testnet": "F006",
  "bera": "F035",
  "bitcoin": "F007",
  "blast": "F008",
  "boba": "F009",
  "bsc": "F00A",
  "celo": "F00B",
  "eth": "F00C",
  "eth-holesky-testnet": "F00D",
  "eth-sepolia-testnet": "F00E",
  "evmos": "F00F",
  "fantom": "F010",
  "fraxtal": "F011",
  "fuse": "F012",
  "gnosis": "F013",
  "harmony": "F014",
  "ink": "F032",
  "iotex": "F015",
  "kaia": "F016",
  "kava": "F017",
  "linea": "F030",
  "mantle": "F033",
  "metis": "F018",
  "moonbeam": "F019",
  "moonriver": "F01A",
  "near": "F01B",
  "oasys": "F01C",
  "op": "F01F",
  "op-sepolia-testnet": "F01D",
  "opbnb": "F01E",
  "osmosis": "F020",
  "pocket": "F000",
  "poly": "F021",
  "poly-amoy-testnet": "F022",
  "poly-zkevm": "F029",
  "radix": "F023",
  "scroll": "F024",
  "sei": "F034",
  "solana": "F025",
  "sonic": "F02D",
  "sui": "F026",
  "taiko": "F027",
  "taiko-hekla-testnet": "F028",
  "tron": "F02E",
  "xrplevm": "1234",
  "xrplevm-testnet": "F02C",
  "zklink-nova": "F02A",
  "zksync-era": "F02B",
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

// Helper function to match legacy chainID format with blockchain entries
export const matchLegacyChainIdToBlockchain = (
  legacyChainId: string | null | undefined,
  blockchains: Blockchain[]
): Blockchain | undefined => {
  if (!legacyChainId) return undefined

  // Try to find blockchain by matching hex chainID from legacy chainID
  // First reverse lookup from hex chainID to blockchain name
  const hexChainId = Object.keys(BLOCKCHAIN_NAME_TO_HEX_CHAIN_ID).find(
    (blockchainName) => BLOCKCHAIN_NAME_TO_HEX_CHAIN_ID[blockchainName] === legacyChainId
  )
  
  if (hexChainId) {
    return blockchains.find((chain) => chain.blockchain === hexChainId)
  }

  // Fallback: try direct blockchain name match
  return blockchains.find((chain) => chain.blockchain === legacyChainId)
}

// Helper function to convert blockchain name to hex chainID for API calls
export const blockchainNameToHexChainId = (blockchainName: string): string => {
  // Direct lookup in the mapping
  const hexChainId = BLOCKCHAIN_NAME_TO_HEX_CHAIN_ID[blockchainName]
  
  if (hexChainId) {
    return hexChainId
  }
  
  // Fallback: return the blockchain name as-is if not found in mapping
  return blockchainName
}
