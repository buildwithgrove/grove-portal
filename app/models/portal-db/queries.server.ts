import { initPortalDbClient } from "./portal-db.server"
import type { PortalAccountWithRelations } from "./types"

/**
 * Fetches complete account data with all related entities.
 * Replaces GraphQL getUserAccount and getUserAccounts queries.
 * 
 * This function fetches:
 *    1. Portal account(s) - filtered by accountId if provided
 *    2. RBAC data - all roles for the account(s)
 *    3. Applications - with only essential fields (id, name, emoji, secret keys)
 *    4. Plan - the portal plan for each account
 * 
 * @param token - JWT access token for authentication
 * @param accountId - Optional account ID to filter by a single account
 * @returns Array of accounts with their related data
 * 
 * @example
 * // Get all user's accounts (RLS filtered by JWT)
 * const accounts = await getUserAccounts(token)
 * 
 * @example
 * // Get a specific account
 * const accounts = await getUserAccounts(token, "account-id-123")
 */
export async function getUserAccounts(
    token: string,
    accountId?: string
): Promise<PortalAccountWithRelations[]> {
    const portalDb = initPortalDbClient({ token })

    // Make all requests in a single Promise.all to avoid connection issues
    // Fetch accounts, rbac, applications, and plans all at once
    const [accountsResult, rbacResult, applicationsResult, plansResult] = await Promise.all([
        // Fetch portal account(s) - filtered by accountId if provided
        portalDb.GET("/portal_accounts", {
            params: {
                query: accountId
                    ? {
                        portal_account_id: `eq.${accountId}`,
                        limit: "1",
                    }
                    : undefined,
            },
        }),
        // Fetch ALL RBAC data - filtered by accountId if provided
        portalDb.GET("/portal_account_rbac", {
            params: {
                query: accountId
                    ? {
                        portal_account_id: `eq.${accountId}`,
                    }
                    : undefined,
            },
        }),
        // Fetch ALL applications - filtered by accountId if provided
        portalDb.GET("/portal_applications", {
            params: {
                query: {
                    ...(accountId && { portal_account_id: `eq.${accountId}` }),
                    deleted_at: "is.null",
                    select:
                        "portal_application_id,portal_application_name,emoji,secret_key_hash,secret_key_required,portal_account_id",
                    order: "created_at.asc",
                },
            },
        }),
        // Fetch ALL plans (small dataset, no filter needed)
        portalDb.GET("/portal_plans"),
    ])

    if (accountsResult.error || !accountsResult.data) {
        throw new Response("Failed to fetch portal accounts", { status: 500 })
    }

    if (rbacResult.error) {
        throw new Response("Failed to fetch account RBAC data", { status: 500 })
    }

    if (applicationsResult.error) {
        throw new Response("Failed to fetch account applications", { status: 500 })
    }

    if (plansResult.error || !plansResult.data) {
        throw new Response("Failed to fetch account plans", { status: 500 })
    }

    const accounts = accountsResult.data
    const allRbac = rbacResult.data ?? []
    const allApplications = applicationsResult.data ?? []
    const allPlans = plansResult.data ?? []

    if (accounts.length === 0) {
        if (accountId) {
            throw new Response("Account not found", { status: 404 })
        }
        return []
    }

    // Match up the data for each account
    const accountsWithRelations: PortalAccountWithRelations[] = accounts.map((account) => {
        // Filter RBAC for this account
        const rbac = allRbac.filter((r) => r.portal_account_id === account.portal_account_id)

        // Filter applications for this account
        const applications = allApplications.filter(
            (app) => app.portal_account_id === account.portal_account_id
        )

        // Find the plan for this account
        const plan = allPlans.find((p) => p.portal_plan_type === account.portal_plan_type)

        if (!plan) {
            throw new Response(
                `Plan not found for account ${account.portal_account_id} with plan type ${account.portal_plan_type}`,
                { status: 500 }
            )
        }

        return {
            account,
            rbac,
            applications,
            plan,
        }
    })

    return accountsWithRelations
}

