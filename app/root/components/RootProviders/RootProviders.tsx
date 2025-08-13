import { NavigationProgress, nprogress } from "@mantine/nprogress"
import React, { useEffect } from "react"

import { ColorScheme } from "~/root"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { portalTheme } from "~/root/portalTheme"
import { useNavigation } from "@remix-run/react"

const RootProviders = ({
  children,
  colorScheme,
}: {
  children: React.ReactNode
  colorScheme?: ColorScheme
}) => {
  const { state } = useNavigation()

  useEffect(() => {
    if (state === "loading") nprogress.start()
    if (state === "idle") nprogress.complete()
  }, [state])

  // Use the server-provided colorScheme directly.
  // Fallback to dark.
  const effectiveColorScheme = colorScheme ?? "dark"

  return (
    <MantineProvider forceColorScheme={effectiveColorScheme} theme={portalTheme}>
      <NavigationProgress />
      <Notifications position="bottom-center" />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  )
}

export default RootProviders
