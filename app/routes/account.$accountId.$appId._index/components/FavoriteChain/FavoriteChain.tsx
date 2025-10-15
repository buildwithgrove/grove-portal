import { ActionIcon } from "@mantine/core"
import { Form } from "@remix-run/react"
import cx from "clsx"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import classes from "./FavoriteChain.module.css"
import { Maybe } from "~/models/portal/sdk"
import type { ServiceWithEndpoints } from "~/models/portal-db/types"
import { AnalyticActions, AnalyticCategories, trackEvent } from "~/utils/analytics"

type FavoriteChainProps = {
  service: ServiceWithEndpoints & {
    favorite: boolean
  }
  favoriteChains?: Maybe<string[]>
  readOnly: boolean
}

export const FavoriteChain = ({
  service,
  favoriteChains,
  readOnly,
}: FavoriteChainProps) => {
  const [isFavorite, setIsFavorite] = useState(service.favorite)

  useEffect(() => {
    if (favoriteChains?.includes(service.service_id)) {
      setIsFavorite(true)
    } else {
      setIsFavorite(false)
    }
  }, [service, favoriteChains])

  return (
    <Form method="post" style={{ cursor: readOnly ? "not-allowed" : "pointer" }}>
      <input hidden readOnly name="isFavorite" value={String(!service.favorite)} />
      <input hidden readOnly name="chainId" value={service.service_id} />
      <input
        hidden
        readOnly
        name="favoriteChains"
        value={JSON.stringify(favoriteChains) ?? "[]"}
      />
      <ActionIcon
        aria-label={`Set service ${service.service_id} as favorite`}
        className={cx(classes.favoriteChain, {
          [classes.isFavorite]: isFavorite,
        })}
        disabled={readOnly}
        size="xl"
        title={`Set service ${service.service_id} as favorite`}
        type="submit"
        variant={readOnly ? "transparent" : "subtle"}
        onClick={() => {
          setIsFavorite((s) => !s)
          trackEvent({
            category: AnalyticCategories.app,
            action: AnalyticActions.app_chain_favorite,
            label: `${service.favorite ? "Remove" : "Add"} favorite ${service.service_id}`,
          })
        }}
      >
        <Star fill={isFavorite ? "currentColor" : "none"} size={18} strokeWidth={1.5} />
      </ActionIcon>
    </Form>
  )
}

export default FavoriteChain
