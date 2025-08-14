import { ActionIcon, Menu } from "@mantine/core"
import { Ellipsis } from "lucide-react"

const ContextMenuTarget = ({
  variant = "outline",
}: {
  variant?: "outline" | "subtle"
}) => {
  return (
    <Menu.Target>
      <ActionIcon
        aria-label="Open context menu"
        color="gray"
        radius="xl"
        size={40}
        variant={variant}
        onClick={(e) => e.stopPropagation()}
      >
        <Ellipsis />
      </ActionIcon>
    </Menu.Target>
  )
}

export default ContextMenuTarget
