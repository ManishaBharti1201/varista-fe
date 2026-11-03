const { InfisicalSDK } = require('@infisical/sdk');

/**
 * Initializes Infisical and injects secrets into process.env at server startup.
 * This ensures your app secrets are fetched securely from Infisical at runtime
 * without needing to store them in GitHub Actions or repository config.
 */
async function loadInfisicalSecretsToEnv() {
  const siteUrl = process.env.INFISICAL_SITE_URL || 'https://app.infisical.com';
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID || 'c79f356b-0e30-4165-83b4-b7434065376c';
  const environment = process.env.INFISICAL_ENVIRONMENT || 'dev';
  const secretPath = process.env.INFISICAL_SECRET_PATH || '/';

  if (!clientId || !clientSecret) {
    console.warn('[Infisical] INFISICAL_CLIENT_ID or INFISICAL_CLIENT_SECRET not found in environment. Skipping runtime secret injection and falling back to local .env.');
    return;
  }

  try {
    const client = new InfisicalSDK({ siteUrl });
    await client.auth().universalAuth.login({ clientId, clientSecret });

    const secretsResponse = await client.secrets().listSecrets({
      projectId,
      environment,
      secretPath,
    });

    const secrets = secretsResponse.secrets || [];
    let injectedCount = 0;

    for (const secret of secrets) {
      if (secret.secretKey && secret.secretValue !== undefined) {
        // Inject into process.env if not already set or override
        process.env[secret.secretKey] = secret.secretValue;
        injectedCount++;
      }
    }

    console.log(`[Infisical] Successfully injected ${injectedCount} secrets from Infisical vault (${environment}:${secretPath}) into process.env at runtime.`);
  } catch (error) {
    console.error('[Infisical] Failed to fetch secrets from Infisical at startup:', error.message);
  }
}

module.exports = {
  loadInfisicalSecretsToEnv,
};
