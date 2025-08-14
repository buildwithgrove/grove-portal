import { ColorScheme } from "~/root"
import { createCookieSessionStorage } from "@remix-run/node"

// const sessionSecret = ""
// if (!sessionSecret) {
//   throw new Error("SESSION_SECRET must be set")
// }

const colorSchemeStorage = createCookieSessionStorage({
  cookie: {
    name: "grove_color_scheme",
    secure: process.env.NODE_ENV === "production",
    // TODO_TECHDEBT: Sign the cookie with a secret
    // secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
})

async function getColorSchemeSession(request: Request) {
  const session = await colorSchemeStorage.getSession(request.headers.get("Cookie"))
  return {
    getColorScheme: (): ColorScheme => {
      return session.get("mantine-color-scheme")
    },
    setColorScheme: (colorScheme: ColorScheme) =>
      session.set("mantine-color-scheme", colorScheme),
    commit: () => colorSchemeStorage.commitSession(session),
  }
}

export { getColorSchemeSession }
