import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { NavigationProgress, nprogress } from "@mantine/nprogress"
import { useNavigation } from "@remix-run/react"
import React, { useEffect } from "react"
import { ColorScheme } from "~/root"
import { portalTheme } from "~/root/portalTheme"

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

  // Use the server-provided colorScheme directly, fallback to dark
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
