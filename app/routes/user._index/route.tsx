import { ActionFunction, MetaFunction } from "@remix-run/node"
import { ActionPassword, actionPassword } from "./utils/actionPassword"
import { useActionData, useOutletContext } from "@remix-run/react"
import { useActionData, useOutletContext } from "@remix-run/react"
import React from "react"
import invariant from "tiny-invariant"
import { ActionPassword, actionPassword } from "./utils/actionPassword"
import { ActionUser } from "./utils/actionUser"
import ProfileView from "./view"
import ErrorBoundaryView from "~/components/ErrorBoundaryView"
import useActionNotification from "~/hooks/useActionNotification"
import { User } from "~/models/portal/sdk"
import { UserAccountLoaderData } from "~/routes/user/route"
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
  const actionData = useActionData() as ActionDataStruct<ActionUser | ActionPassword>

  useActionNotification(actionData)

  return <ProfileView user={user} />
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
