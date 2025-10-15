import { Avatar, Flex, Stack, Text } from "@mantine/core"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"

type ChainProps = {
  chain: ServiceWithEndpoints
  variant?: "default" | "compact"
}
const Chain = ({ chain, variant = "default" }: ChainProps) => {
  return (
    <Flex align="center" gap="sm">
      <Avatar
        radius={40}
        size={variant === "compact" ? 18 : 40}
        src={`/chain-logos/${chain.service_id}.svg`}
      />
      <Stack gap={0} w={200}>
        <Text
          truncate
          fw={variant === "compact" ? 400 : 600}
          fz={variant === "compact" ? 14 : 16}
        >
          {chain?.service_name}
        </Text>
        {variant === "default" ? (
          <Text c="dimmed" fz="xs">
            {chain?.service_id}
          </Text>
        ) : null}
      </Stack>
    </Flex>
  )
}

export default Chain
