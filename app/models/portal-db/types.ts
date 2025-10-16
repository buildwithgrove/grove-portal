import type { components } from "../../../../path/portal-db/sdk/typescript/types"

// Export clean types from the PostgREST schema
export type Service = components["schemas"]["services"]
export type ServiceEndpoint = components["schemas"]["service_endpoints"]
export type PortalAccount = components["schemas"]["portal_accounts"]
export type PortalUser = components["schemas"]["portal_users"]
export type PortalApplication = components["schemas"]["portal_applications"]
export type PortalPlan = components["schemas"]["portal_plans"]
export type PortalAccountRbac = components["schemas"]["portal_account_rbac"]
export type PortalApplicationRbac = components["schemas"]["portal_application_rbac"]
export type ServiceFallback = components["schemas"]["service_fallbacks"]
export type Network = components["schemas"]["networks"]
export type Organization = components["schemas"]["organizations"]

// Augmented service type with endpoints
export type ServiceWithEndpoints = Service & {
    endpoints: ServiceEndpoint[]
    hasWebsocket: boolean
}

// Auth-specific portal user type with only needed fields
export type AuthPortalUser = Pick<PortalUser, 'portal_user_id' | 'portal_user_email' | 'signed_up'>

