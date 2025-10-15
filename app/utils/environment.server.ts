function getClientEnv() {
  return {
    BUILD_ID: process.env.BUILD_ID,
    DOCS_STATUS: process.env.DOCS_STATUS,
    FLAG_ENTERPRISE: process.env.FLAG_ENTERPRISE,
    FLAG_INFLUX_RELAY_ERROR: process.env.FLAG_INFLUX_RELAY_ERROR,
    FLAG_LEGACY_MESSAGING: process.env.FLAG_LEGACY_MESSAGING,
    FLAG_MAINTENANCE_MODE: process.env.FLAG_MAINTENANCE_MODE,
    FLAG_MAINTENANCE_MODE_DASHBOARD: process.env.FLAG_MAINTENANCE_MODE_DASHBOARD,
    FLAG_MULTI_LANGUAGE: process.env.FLAG_MULTI_LANGUAGE,
    FLAG_STRIPE_PAYMENT: process.env.FLAG_STRIPE_PAYMENT,
    GODMODE_ACCOUNTS: process.env.GODMODE_ACCOUNTS,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    NODE_ENV: process.env.NODE_ENV,
    PORTAL_API_URL: process.env.PORTAL_API_URL,
    PORTAL_DB_API_URL: process.env.PORTAL_DB_API_URL,
    RELAY_METER_API_URL: process.env.RELAY_METER_API_URL,
    FLAG_ANNOUNCEMENT_ALERT: process.env.FLAG_ANNOUNCEMENT_ALERT,
    ANNOUNCEMENT_ALERT_TITLE: process.env.ANNOUNCEMENT_ALERT_TITLE,
    ANNOUNCEMENT_ALERT_BODY: process.env.ANNOUNCEMENT_ALERT_BODY,
    NOVU_APP_IDENTIFIER: process.env.NOVU_APP_IDENTIFIER,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }
}

type ENV = ReturnType<typeof getClientEnv>

// entry.server sets this global value
// root.tsx injects it into the window
declare global {
  // eslint-disable-next-line
  var ENV: ENV
  interface Window {
    ENV: ENV
    dataLayer: any
    gtag: any
  }
}

export { getClientEnv }
