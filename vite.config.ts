import { vitePlugin as remix } from "@remix-run/dev"
import { installGlobals } from "@remix-run/node"
import { vercelPreset } from "@vercel/remix/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

installGlobals()

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome115',
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'EVAL' && warning.id?.includes('lottie-web')) {
          return
        }
        defaultHandler(warning)
      },
    },
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ["@uiw/codemirror-theme-xcode", "@uiw/codemirror-themes"],
  },
  optimizeDeps: {
    include: ["@uiw/codemirror-theme-xcode", "@uiw/codemirror-themes"],
  },
})
