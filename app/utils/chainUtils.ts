import { getRequiredClientEnvVar } from "./environment"
import { Blockchain } from "~/models/portal/sdk"
import { KeyValuePair } from "~/types/global"

export const CHAIN_DOCS_URL: KeyValuePair<string> = {
  "arbitrum-one": "arbitrum-one-api/intro",
  "avax-mainnet": "avalanche-api/intro",
  "avax-archival": "avalanche-api/intro",
  "base-mainnet": "base-api/intro",
  "base-testnet": "base-api/intro",
  "boba-mainnet": "boba-api/intro",
  "bsc-mainnet": "binance-smart-chain-api/intro",
  "bsc-archival": "binance-smart-chain-api/intro",
  "celo-mainnet": "celo-api/intro",
  "celestia-archival": "celestia-api/endpoints/celestia-archival",
  "avax-dfk": "avalanche-api/intro",
  "dogechain-mainnet": "dogechain-api/intro",
  "eth-mainnet": "ethereum-api/intro",
  "eth-archival": "ethereum-api/intro",
  "eth-trace": "ethereum-api/intro",
  "holesky-fullnode-testnet": "ethereum-api/intro",
  rinkeby: "ethereum-api/intro",
  "eth-goerli": "ethereum-api/intro",
  "goerli-archival": "ethereum-api/intro",
  "evmos-mainnet": "evmos-api/intro",
  "fantom-mainnet": "fantom-api/intro",
  "fuse-mainnet": "fuse-api/intro",
  "harmony-0": "harmony-shard-0-api/intro",
  "gnosischain-mainnet": "gnosis",
  "gnosischain-archival": "gnosis",
  "iotex-mainnet": "iotex-api/intro",
  "kava-mainnet": "kava-api/intro",
  "kava-mainnet-archival": "kava-api/intro",
  "klaytn-mainnet": "klaytn-api/intro",
  "metis-mainnet": "metis-api/intro",
  "moonbeam-mainnet": "moonbeam-api/intro",
  "moonriver-mainnet": "moonriver-api/intro",
  "near-mainnet": "near-api/intro",
  "oKc-mainnet": "okc-api/intro",
  "oasys-mainnet": "oasys-api/intro",
  "oasys-mainnet-archival": "oasys-api/intro",
  "optimism-mainnet": "optimism-api/intro",
  "optimism-archival": "optimism-api/intro",
  "osmosis-mainnet": "osmosis-api/intro",
  mainnet: "",
  "poly-mainnet": "polygon-api/intro",
  "poly-archival": "polygon-api/intro",
  "polygon-zkevm-mainnet": "polygon-api/intro",
  "polygon-mumbai": "polygon-api/intro",
  "radix-mainnet": "radix-api/intro",
  "solana-mainnet": "solana-api/intro",
  "solana-custom": "solana-api/intro",
  "sui-mainnet": "sui-api/intro",
  "scroll-mainnet": "scroll-api/intro",
  "scroll-testnet": "scroll-api/intro",
  "zksync-era-mainnet": "zksync-era-api/intro",
  "blast-archival": "blastchain-api/intro",
  "opbnb-archival": "binance-smart-chain-api/endpoints/opBNB-archival",
  "zklink-nova-archival": "zklink-nova-api/endpoints/zklink-nova-archival",
}

// evmChains is an array of the relay chain IDs for EVM chains.
// It must be updated whenever a new EVM chain is added to the relay.
//
// The current list of chain IDs on the protocol may be fetched with:
// pocket query params --remoteCLIURL https://pocket-rpc.liquify.com | tail -n +2 | jq '.pocket_params[] | select(.param_key == "pocketcore/SupportedBlockchains")'
export const evmChains = [
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
