import { Container, Stack } from "@mantine/core"
import ApplicationHeader from "./components/ApplicationHeader"
import LinkTabs from "~/components/LinkTabs"
import { PortalApp, RoleName } from "~/models/portal/sdk"

type AppIdLayoutViewProps = {
  app: PortalApp
  userRole: RoleName
  children: React.ReactNode
}

export type Route = {
  to: string
  label?: string
  icon?: React.ReactNode | (() => JSX.Element) | React.FunctionComponent
  end?: boolean
  external?: boolean
}

export default function AppIdLayoutView({
  app,
  userRole,
  children,
}: AppIdLayoutViewProps) {
  const routes = [
    {
      to: "",
      label: "Services",
      end: true,
    },
    {
      to: "insights",
      label: "Insights",
    },
    {
      to: "logs",
      label: "Logs",
    },
    {
      to: "security",
      label: "Security",
    },
    {
      to: "keys",
      label: "Keys",
    },
  ]

  return (
    <Container fluid px={0}>
      <Stack gap="xl">
        <ApplicationHeader app={app} userRole={userRole} />
        <LinkTabs routes={routes} />
      </Stack>
      {children}
    </Container>
  )
}
