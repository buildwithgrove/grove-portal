import { Flex, Button, ScrollArea } from "@mantine/core"
import { NavLink } from "@remix-run/react"

import classes from "./LinkTabs.module.css"

export type TabRoute = {
  to: string
  label?: string
  icon?: React.ReactNode | (() => JSX.Element) | React.FunctionComponent
  end?: boolean
  external?: boolean
}

type LinkTabsProps = {
  routes: TabRoute[]
}

const LinkTabs = ({ routes }: LinkTabsProps) => {
  return (
    <ScrollArea mb={"-11px"}>
      <Flex className={classes.linkTabsContainer}>
        {routes.map((route, index) => (
          <Button
            key={`${route.to}-${index}`}
            className={classes.linkTab}
            color="gray"
            component={NavLink}
            end={route.end}
            prefetch="intent"
            px={4}
            radius={0}
            to={route.to}
            variant="subtle"
          >
            {route.label}
          </Button>
        ))}
      </Flex>
    </ScrollArea>
  )
}

export default LinkTabs
