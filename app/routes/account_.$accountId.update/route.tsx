import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node"
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import invariant from "tiny-invariant"
import AccountForm from "./components/AccountForm"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import RouteModal from "~/components/RouteModal"
import useActionNotification from "~/hooks/useActionNotification"
import { initPortalClient } from "~/models/portal/portal.server"
import {
  Account,
  UpdateAccount as UpdateAccountParams,
  RoleName,
} from "~/models/portal/sdk"
import { ActionDataStruct } from "~/types/global"
import { getUserAccountRole } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `Update Account ${seo_title_append}`,
    },
  ]
}

type AccountUpdateData = {
  account: Account
}

type AccountUpdateActionData = {
  success: boolean
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const portal = initPortalClient({ token: user.accessToken })
  const { accountId } = params
  invariant(accountId, "AccountId must be set")

  try {
    const getUserAccountResponse = await portal.getUserAccount({
      accountID: accountId,
      accepted: true,
    })

    if (!getUserAccountResponse) {
      return redirect(`/account/${params.accountId}`)
    }

    const userRole = getUserAccountRole(
      getUserAccountResponse.getUserAccount.users,
      user.user.portalUserID,
    )

    if (!userRole || userRole === RoleName.Member) {
      return redirect(`/account/${params.accountId}`)
    }

    return json<AccountUpdateData>({
      account: getUserAccountResponse.getUserAccount as Account,
    })
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const url = new URL(request.url)
  const portal = initPortalClient({ token: user.accessToken })
  const formData = await request.formData()
  const name = formData.get("account_name")
  const monthlyRelayLimit = formData.get("monthly_relay_limit")
  const { accountId } = params
  const redirectTo = url.searchParams.get("redirectTo")

  invariant(name && typeof name === "string", "account name not found")
  invariant(accountId && typeof accountId === "string", "accountId not found")

  const accountInput: UpdateAccountParams = {
    accountID: accountId,
  }
  if (name) {
    accountInput.name = name
  }
  if (monthlyRelayLimit && typeof monthlyRelayLimit === "string") {
    const sanitizedLimit = monthlyRelayLimit.replace(/,/g, "")
    accountInput.monthlyUserLimit = Number(sanitizedLimit)
  }

  try {
    const updateUserAccountResponse = await portal
      .updateUserAccount({ input: accountInput })
      .catch(() => {
        throw new Error("Unable to update account")
      })

    if (!updateUserAccountResponse.updateUserAccount) {
      throw new Error("Unable to update account")
    }

    return redirect(redirectTo ?? `/account/${accountId}/settings`)
  } catch (error) {
    console.error(error)
    return json<ActionDataStruct<AccountUpdateActionData>>({
      data: null,
      error: true,
      message: getErrorMessage(error),
    })
  }
}

export default function UpdateAccount() {
  const { account } = useLoaderData<AccountUpdateData>()
  const actionData = useActionData<typeof action>()
  const fetcher = useFetcher()
  const [params] = useSearchParams()
  const redirectTo = params.get("redirectTo")

  useActionNotification(actionData)

  return (
    <RouteModal loaderMessage="Updating your account..." state={fetcher.state}>
      <AccountForm
        account={account}
        redirectTo={redirectTo}
        onSubmit={(formData) =>
          fetcher.submit(formData, {
            method: "POST",
          })
        }
      />
    </RouteModal>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
