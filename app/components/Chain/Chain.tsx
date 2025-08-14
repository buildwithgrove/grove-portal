import { Avatar, Flex, Stack, Text } from "@mantine/core"
import { Blockchain } from "~/models/portal/sdk"

type ChainProps = {
  chain: Blockchain
  variant?: "default" | "compact"
}
const Chain = ({ chain, variant = "default" }: ChainProps) => {
  return (
    <Flex align="center" gap="sm">
      <Avatar
        radius={40}
        size={variant === "compact" ? 18 : 40}
        src={`/chain-logos/${chain.blockchain}.svg`}
      />
      <Stack gap={0} w={200}>
        <Text
          truncate
          fw={variant === "compact" ? 400 : 600}
          fz={variant === "compact" ? 14 : 16}
        >
          {chain?.description}
        </Text>
        {variant === "default" ? (
          <Text c="dimmed" fz="xs">
            {chain?.blockchain}
          </Text>
        ) : null}
      </Stack>
    </Flex>
  )
}

export default Chain
