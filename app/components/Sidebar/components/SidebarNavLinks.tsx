import { Anchor, Flex, Group, Text, UnstyledButton } from "@mantine/core"
import { NavLink } from "@remix-run/react"
import { Emoji } from "emoji-picker-react"
import type { LucideIcon } from "lucide-react"
import classes from "./SidebarNavLinks.module.css"
import { DEFAULT_APPMOJI } from "~/routes/account_.$accountId.create/components/AppmojiPicker"

export type SidebarNavRoute = {
  to: string
  label: string
  icon?: LucideIcon | string
  imgSrc?: string
  end?: boolean
  external?: boolean
}

export type LinkLabelProps = Pick<SidebarNavRoute, "icon" | "label" | "imgSrc">

type LabelIconProps = Pick<LinkLabelProps, "icon" | "imgSrc" | "label">

type SidebarButtonProps = LinkLabelProps & { onClick?: () => void }

const LabelIcon = ({ icon: Icon, imgSrc, label }: LabelIconProps) => {
  const isEmoji = typeof Icon === "string"

  if (imgSrc) {
    return (
      <img
        alt={`icon for ${label}`}
        loading="lazy"
        src={imgSrc}
        style={{ height: "18px", objectFit: "contain" }}
      ></img>
    )
  }

  if (isEmoji) {
    return (
      <Flex justify="center" mx={1}>
        <Emoji size={16} unified={Icon !== "" ? Icon : DEFAULT_APPMOJI} />
      </Flex>
    )
  }

  return Icon ? <Icon size={18} /> : null
}

const LinkLabel = ({ icon, label, imgSrc }: LinkLabelProps) => (
  <Group>
    <LabelIcon icon={icon} imgSrc={imgSrc} label={label} />
    <Text truncate w={190}>
      {label}
    </Text>
  </Group>
)

export const ExternalLink = ({ route }: { route: SidebarNavRoute }) => (
  <Anchor
    className={classes.sidebarNavLink}
    href={route.to}
    rel="noreferrer"
    target="_blank"
    variant="text"
  >
    <LinkLabel icon={route.icon} imgSrc={route.imgSrc} label={route.label} />
  </Anchor>
)

export const InternalLink = ({ route }: { route: SidebarNavRoute }) => (
  <Anchor
    className={classes.sidebarNavLink}
    component={NavLink}
    end={route.end}
    prefetch="intent"
    to={route.to}
  >
    <LinkLabel icon={route.icon} imgSrc={route.imgSrc} label={route.label} />
  </Anchor>
)

export const NavButton = ({ icon, label, ...rest }: SidebarButtonProps) => (
  <UnstyledButton className={classes.sidebarNavLink} {...rest}>
    <LinkLabel icon={icon} label={label} />
  </UnstyledButton>
)
