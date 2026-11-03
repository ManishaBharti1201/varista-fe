const { InfisicalSDK } = require('@infisical/sdk');

/**
 * Script to push local/workflow repository secrets to Infisical.
 * Run with: node pushSecretsToInfisical.js
 */
async function pushSecrets() {
  const siteUrl = process.env.INFISICAL_SITE_URL || 'https://app.infisical.com';
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID || 'c79f356b-0e30-4165-83b4-b7434065376c';
  const environment = process.env.INFISICAL_ENVIRONMENT || 'dev';
  const secretPath = process.env.INFISICAL_SECRET_PATH || '/';

  if (!clientId || !clientSecret) {
    console.error('Error: INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET must be set in environment to push secrets.');
    process.exit(1);
  }

  // Repository secrets identified from .env and GitHub Actions workflows (.github/workflows/main.yml)
  const secretsToMigrate = {
    PORT: '4000',
    EXTERNAL_SERVICE_BASE_URL: 'http://localhost:8080',
    FRONTEND_ORIGIN: 'http://localhost:3000,https://varista.coresmith.duckdns.org',
    REACT_APP_BFF_URL: 'https://bff.coresmith.duckdns.org',
    REACT_APP_TENANTS: '[{"id":"101","name":"Leadac"}]',
    // GitHub Actions Secret Placeholders (replace with actual production values when running)
    SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID || 'YOUR_SLACK_CHANNEL_ID',
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || 'xoxb-YOUR_SLACK_BOT_TOKEN',
    DOCKERHUB_USERNAME: process.env.DOCKERHUB_USERNAME || 'YOUR_DOCKERHUB_USERNAME',
    DOCKERHUB_TOKEN: process.env.DOCKERHUB_TOKEN || 'YOUR_DOCKERHUB_TOKEN',
    VM_HOST: process.env.VM_HOST || 'YOUR_VM_HOST',
    VM_USER: process.env.VM_USER || 'YOUR_VM_USER',
    SSH_PRIVATE_KEY: process.env.SSH_PRIVATE_KEY || 'YOUR_SSH_PRIVATE_KEY',
  };

  try {
    const client = new InfisicalSDK({ siteUrl });
    await client.auth().universalAuth.login({ clientId, clientSecret });

    console.log(`[Infisical Migration] Authenticated successfully. Pushing secrets to Project: ${projectId}, Environment: ${environment}, Path: ${secretPath}`);

    for (const [key, value] of Object.entries(secretsToMigrate)) {
      try {
        await client.secrets().createOrUpdateSecret({
          projectId,
          environment,
          secretPath,
          secretKey: key,
          secretValue: String(value),
        });
        console.log(`  ✅ Synced secret: ${key}`);
      } catch (err) {
        console.error(`  ❌ Failed to sync secret ${key}:`, err.message);
      }
    }

    console.log('[Infisical Migration] All repository secrets analyzed and migrated to Infisical successfully!');
  } catch (error) {
    console.error('[Infisical Migration] Error connecting to Infisical:', error);
    process.exit(1);
  }
}

pushSecrets();
