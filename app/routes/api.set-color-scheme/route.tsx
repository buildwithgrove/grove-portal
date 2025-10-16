import { ActionFunction, json } from "@remix-run/node"
import invariant from "tiny-invariant"
import { ColorScheme } from "~/root"
import { getErrorMessage } from "~/utils/catchError"
import { getColorSchemeSession } from "~/utils/colorScheme.server"
import { requireUser } from "~/utils/user.server"

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request)
  invariant(user.user.auth0ID && user.user.portal_user_email, "user not found")
  const formData = await request.formData()
  const colorScheme = formData.get("color-scheme") as ColorScheme
  const colorSchemeSession = await getColorSchemeSession(request)

  invariant(typeof colorScheme === "string", "theme value must be set")

  try {
    colorSchemeSession.setColorScheme(colorScheme)
    return json(
      { success: true },
      { headers: { "Set-Cookie": await colorSchemeSession.commit() } },
    )
  } catch (error) {
    console.error(error)
    return json({
      error: true,
      message: getErrorMessage(error),
    })
  }
}
