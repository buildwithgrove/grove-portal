import { Box, Button, Divider, Stack, Text } from "@mantine/core"
import { Form } from "@remix-run/react"
import { Identicon } from "~/components/Identicon"
import type { AuthPortalUser } from "~/models/portal-db/types"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

type ProfileViewProps = {
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
}

export const ProfileView = ({ user }: ProfileViewProps) => {
  return (
    <Stack gap="xs">
      <Box py={20}>
        <Identicon
          avatar
          alt={`${user.portal_user_id ?? "user"} profile picture`}
          seed={user.portal_user_id ?? "user default"}
          size="lg"
          type="user"
        />
        <Text fw={600} mt="xl">
          Avatar
        </Text>
        <Text pt={5}>
          This is a unique profile image generated based on your unique user ID.{" "}
        </Text>
      </Box>
      <Divider />
      <Stack py={20}>
        <Box>
          <Text fw={600}>Password</Text>
          <Text pt={5}>
            To change your password, you will receive an email from Auth0.
          </Text>
        </Box>
        <Form method="post">
          <Button
            color="gray"
            name="email"
            type="submit"
            value={user.portal_user_email}
            variant="outline"
            onClick={() => {
              trackEvent({
                category: AnalyticCategories.user,
                action: AnalyticActions.user_profile_change_password,
              })
            }}
          >
            Change password
          </Button>
        </Form>
      </Stack>
    </Stack>
  )
}

export default ProfileView
