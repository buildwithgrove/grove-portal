import { Stack, Switch, Text } from "@mantine/core"
import { Form, useParams, useSubmit } from "@remix-run/react"
import { useState } from "react"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

type PrivateSecretKeyProps = {
  secretKeyRequired: boolean
  readOnly: boolean
}

const PrivateSecretKey = ({ secretKeyRequired, readOnly }: PrivateSecretKeyProps) => {
  const submit = useSubmit()
  const { appId } = useParams()
  const [checked, setChecked] = useState(Boolean(secretKeyRequired))

  return (
    <Stack py={32}>
      <Text fw={600}>Secret Key Required</Text>
      <Text>
        To maximize the security of your application, you should activate the private
        secret key for all requests and enable the use of whitelisted user-agents and
        origins.
      </Text>
      <Form method="post" onChange={(event) => submit(event.currentTarget)}>
        <input hidden readOnly name="secretKeyRequired" value={checked ? "off" : "on"} />
        <Switch
          aria-label="Private Secret Key Required"
          checked={checked}
          color="green.7"
          disabled={readOnly}
          id="secretRequired"
          onChange={(event) => {
            setChecked(event.currentTarget.checked)
            trackEvent({
              category: AnalyticCategories.app,
              action: AnalyticActions.app_settings_update,
              label: appId,
            })
          }}
        />
      </Form>
    </Stack>
  )
}

export default PrivateSecretKey
