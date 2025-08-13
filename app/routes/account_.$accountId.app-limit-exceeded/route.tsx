import { Button, CloseButton, Stack } from "@mantine/core"
import { LoaderFunction, MetaFunction, redirect } from "@remix-run/node"
import { Link, NavLink, useParams } from "@remix-run/react"
import invariant from "tiny-invariant"
import { EmptyState } from "~/components/EmptyState"
import { ErrorBoundaryView } from "~/components/ErrorBoundaryView"
import { initPortalClient } from "~/models/portal/portal.server"
import { Account } from "~/models/portal/sdk"
import { isAccountWithinAppLimit } from "~/utils/accountUtils"
import { getErrorMessage } from "~/utils/catchError"
import { seo_title_append } from "~/utils/seo"
import { requireUser } from "~/utils/user.server"

export const meta: MetaFunction = () => {
  return [
    {
      title: `App Creation Limit Exceeded ${seo_title_append}`,
    },
  ]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const { accountId } = params

  const portal = initPortalClient({ token: user.accessToken })
  invariant(accountId, "AccountId must be set")
  try {
    const getUserAccountResponse = await portal.getUserAccount({
      accountID: accountId,
      accepted: true,
    })

    if (!getUserAccountResponse) {
      return redirect(`/account/${params.accountId}`)
    }
    const userAccount = getUserAccountResponse.getUserAccount as Account
    const canCreateApp = isAccountWithinAppLimit(userAccount)
    if (canCreateApp) {
      return redirect(`/account/${params.accountId}`)
    }
  } catch (error) {
    throw new Response(getErrorMessage(error), {
      status: 500,
    })
  }

  return null
}

export default function AppLimitExceeded() {
  const { accountId } = useParams()
  return (
    <Stack align="center" justify="center" m={42}>
      <CloseButton
        aria-label="Discard"
        component={NavLink}
        ml="auto"
        to={`/account/${accountId}`}
      />
      <EmptyState
        alt="App limit exceeded"
        callToAction={
          <Button
            color="gray"
            component={Link}
            mt="xs"
            prefetch="intent"
            size="lg"
            to={`/account/${accountId}`}
            variant="outline"
            w={156}
          >
            Discard
          </Button>
        }
        imgHeight={216}
        imgSrc="/app-limit-exceeded.svg"
        imgWidth={270}
        subtitle="At the moment, we're limiting users to two applications as we're gearing up for a major release that will bring exciting new features and improvements."
        title="Currently you are only able to create two applications."
      />
    </Stack>
  )
}

export function ErrorBoundary() {
  return <ErrorBoundaryView />
}
