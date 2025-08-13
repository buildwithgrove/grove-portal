import { Divider, Box, CloseButton, Flex, Text, Tooltip } from "@mantine/core"

type ModalHeaderProps = {
  title: string
  subtitle: string
  onDiscard: () => void
}

const ModalHeader = ({ title, subtitle, onDiscard }: ModalHeaderProps) => {
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={12}>
        <Text fw={600} fz="21px">
          {title}
        </Text>
        <Tooltip withArrow label="Discard">
          <CloseButton aria-label="Discard button" onClick={onDiscard} />
        </Tooltip>
      </Flex>
      <Text>{subtitle}</Text>

      <Divider my={32} />
    </Box>
  )
}

export default ModalHeader
