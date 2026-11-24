// Default (empty) runtime config for local development.
// Overwritten at deploy time by .github/workflows/deploy.yml with values
// from SSM Parameter Store (API URL, Turnstile site key, analytics token).
window.SITE_CONFIG = window.SITE_CONFIG || {};
