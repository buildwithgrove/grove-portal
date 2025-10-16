import jwt_decode from "jwt-decode"
import { Authenticator } from "remix-auth"
import { Auth0Strategy } from "remix-auth-auth0"
import invariant from "tiny-invariant"
import { getRequiredServerEnvVar } from "./environment"
import { sessionStorage } from "./session.server"
import { initPortalClient } from "~/models/portal/portal.server"
import {
  AdminCreatePortalUserMutationVariables,
  getSdk as portalSDKType,
} from "~/models/portal/sdk"
import type { AuthPortalUser } from "~/models/portal-db/types"
import { initPortalDbClient } from "~/models/portal-db/portal-db.server"
import { initAdminPortal } from "~/utils/adminPortal"

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<{
  accessToken: string
  refreshToken: string | undefined
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
}>(sessionStorage)

export type AuthUser = {
  accessToken: string
  refreshToken: string | undefined
  user: AuthPortalUser & {
    auth0ID: string
    email_verified?: boolean
  }
}

const auth0Strategy = new Auth0Strategy(
  {
    callbackURL: "/api/auth/auth0/callback",
    clientID: getRequiredServerEnvVar("AUTH0_CLIENT_ID"),
    clientSecret: getRequiredServerEnvVar("AUTH0_CLIENT_SECRET"),
    domain: getRequiredServerEnvVar("AUTH0_DOMAIN"),
    audience: getRequiredServerEnvVar("AUTH0_AUDIENCE"),
    scope: getRequiredServerEnvVar("AUTH0_SCOPE"),
  },
  async ({ accessToken, refreshToken, profile, extraParams }): Promise<AuthUser> => {
    const email = profile?._json?.email
    const providerUserID = profile?.id

    invariant(email, "email is not found")
    invariant(providerUserID, "providerUserID is not found")

    // Initialize portal-db client once for all operations
    const portalDbClient = initPortalDbClient({ token: accessToken })
    const portalSDK = initPortalClient({ token: accessToken })

    let portalUser: AuthUser["user"]

    try {
      // Case 1: Standard login
      portalUser = await handlePortalUserFound(portalDbClient, providerUserID, profile)
    } catch (error) {
      const err = error as Error

      if (err.message.includes("Response not OK. 404 Not Found")) {
        const portalAdmin = await initAdminPortal(portalSDK)
        const idToken = extraParams.id_token

        // Decode the ID token to check for GCP account ID
        const gcpAccountIDCustomClaim = "https://custom.claims/gcp_account_id"
        const decodedIdToken = idToken
          ? jwt_decode<{ [key: string]: string | undefined }>(idToken)
          : undefined
        const gcpAccountID = decodedIdToken?.[gcpAccountIDCustomClaim]

        if (gcpAccountID) {
          // Case 2: ID token contains gcp_account_id (GCP Marketplace signup)
          portalUser = await handleGCPMarketplaceRedirect(
            portalAdmin,
            email,
            providerUserID,
            gcpAccountID,
          )
        } else {
          // Case 3: ID token does not contain gcp_account_id (Standard signup)
          portalUser = await handleStandardSignup(portalAdmin, email, providerUserID)
        }
      } else {
        throw error
      }
    }

    return {
      accessToken,
      refreshToken,
      user: portalUser,
    }
  },
)

// Handles the case where the portal user is found (standard login)
async function handlePortalUserFound(
  portalDbClient: ReturnType<typeof initPortalDbClient>,
  providerUserID: string,
  profile: any,
): Promise<AuthUser["user"]> {
  const { data: users, error } = await portalDbClient.GET("/portal_users", {
    params: {
      query: {
        select: "portal_user_id,portal_user_email,signed_up",
        limit: "1",
      },
    },
  })

  if (error || !users || users.length === 0) {
    throw new Error("Portal user not found")
  }

  const portalUser = users[0]

  console.log("portalUser", portalUser)

  return {
    portal_user_id: portalUser.portal_user_id,
    portal_user_email: portalUser.portal_user_email,
    signed_up: portalUser.signed_up,
    auth0ID: providerUserID,
    email_verified: profile._json?.email_verified,
  }
}

// Handles the case where the portal user is not found and id token contains gcp_account_id (GCP Marketplace signup)
async function handleGCPMarketplaceRedirect(
  portalAdmin: ReturnType<typeof portalSDKType>,
  email: string,
  providerUserID: string,
  gcpAccountID: string,
): Promise<AuthUser["user"]> {
  const createGCPPortalUserVars: AdminCreatePortalUserMutationVariables = {
    email,
    providerUserID,
    gcpAccountID,
  }

  const user = await portalAdmin.adminCreatePortalUser(createGCPPortalUserVars)

  return {
    portal_user_id: user.adminCreatePortalUser.portalUserID,
    portal_user_email: email,
    signed_up: true,
    auth0ID: providerUserID,
    email_verified: true,
  }
}

// Handles the case where the portal user is not found and no gcp_account_id is found (standard signup)
async function handleStandardSignup(
  portalAdmin: ReturnType<typeof portalSDKType>,
  email: string,
  providerUserID: string,
): Promise<AuthUser["user"]> {
  const createPortalUserVars: AdminCreatePortalUserMutationVariables = {
    email,
    providerUserID,
  }

  const user = await portalAdmin.adminCreatePortalUser(createPortalUserVars)

  return {
    portal_user_id: user.adminCreatePortalUser.portalUserID,
    portal_user_email: email,
    signed_up: true,
    auth0ID: providerUserID,
    email_verified: true,
  }
}

// Use the Auth0 strategy for authentication
authenticator.use(auth0Strategy)
