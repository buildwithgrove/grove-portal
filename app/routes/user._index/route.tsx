import { ActionFunction, MetaFunction } from "@remix-run/node"
import { ActionPassword, actionPassword } from "./utils/actionPassword"
import { useActionData, useOutletContext } from "@remix-run/react"

import { ActionDataStruct } from "~/types/global"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import ProfileView from "./view"
import { UserAccountLoaderData } from "~/routes/user/route"
import invariant from "tiny-invariant"
import { seo_title_append } from "~/utils/seo"
import useActionNotification from "~/hooks/useActionNotification"

export const meta: MetaFunction = () => {
  return [
    {
      title: `User Profile ${seo_title_append}`,
    },
  ]
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get("email")
  invariant(typeof email === "string", "user email not found")
  return await actionPassword(email)
}

export default function Profile() {
  const { user } = useOutletContext<UserAccountLoaderData>()
  const actionData = useActionData() as ActionDataStruct<ActionPassword>

  useActionNotification(actionData)

  return <ProfileView user={user} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
