import createClient from "openapi-fetch"
import type { paths } from "../../../../path/portal-db/sdk/typescript/types"
import { getRequiredClientEnvVar } from "~/utils/environment"

type Headers = {
    [key: string]: string
}

// TODO: Replace with actual JWT token retrieval
const HARDCODED_JWT = "your-jwt-token-here"

function initPortalDbClient(headers: Headers = {}) {
    const { token, ...rest } = headers

    return createClient<paths>({
        baseUrl: getRequiredClientEnvVar("PORTAL_DB_API_URL"),
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...rest,
        },
    })
}

export { initPortalDbClient }

