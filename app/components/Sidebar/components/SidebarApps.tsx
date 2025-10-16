import { Button, Collapse, Stack } from "@mantine/core"
import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { InternalLink, SidebarNavRoute } from "~/components/Sidebar/components"
import type { PortalApplicationSummary } from "~/models/portal-db/types"

type SidebarAppsProps = {
  apps: PortalApplicationSummary[]
}

export const SidebarApps = ({ apps }: SidebarAppsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const appsRoutes = useMemo(() => {
    return apps
      .sort((a, b) => ((a.portal_application_name ?? '') > (b.portal_application_name ?? '') ? 1 : -1))
      .map((app) => ({
        to: app.portal_application_id,
        label: app.portal_application_name ?? app.portal_application_id,
        icon: app.emoji,
      })) as SidebarNavRoute[]
  }, [apps])

  const initialApps = appsRoutes.slice(0, 3)
  const remainingApps = appsRoutes.slice(3)
  const hasMoreApps = remainingApps.length > 0

  return (
    <Stack gap={0}>
      {/* Always show first 3 apps */}
      {initialApps.map((appRoute) => (
        <InternalLink key={appRoute.to} route={appRoute} />
      ))}

      {/* Collapsible section for remaining apps */}
      <Collapse in={isExpanded}>
        {remainingApps.map((appRoute) => (
          <InternalLink key={appRoute.to} route={appRoute} />
        ))}
      </Collapse>

      {/* Show expand/collapse button only if there are more apps */}
      {hasMoreApps && (
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          justify="flex-start"
          leftSection={
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          }
          onClick={() => setIsExpanded(!isExpanded)}
          styles={{
            root: {
              marginLeft: 8,
              marginTop: 4,
              height: 32,
              paddingLeft: 8,
              paddingRight: 8,
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--mantine-color-text)",
            },
            section: {
              marginRight: 4,
              color: "var(--mantine-color-text)",
            },
          }}
        >
          {isExpanded ? "Show Less" : `Show ${remainingApps.length} More`}
        </Button>
      )}
    </Stack>
  )
}

export default SidebarApps
