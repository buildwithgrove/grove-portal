import createClient from "openapi-fetch"
import type { paths } from "../../../../path/portal-db/sdk/typescript/types"
import { getRequiredClientEnvVar } from "~/utils/environment"

type Headers = {
    [key: string]: string
}

function initPortalDbClient(headers: Headers = {}) {
    const { token, ...rest } = headers

    return createClient<paths>({
        baseUrl: getRequiredClientEnvVar("PORTAL_DB_API_URL"),
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "Connection": "close",
            ...rest,
        },
        // Use native fetch to avoid Remix's fetch polyfill issues
        fetch: (input: Request) => fetch(input),
    })
}

export { initPortalDbClient }

