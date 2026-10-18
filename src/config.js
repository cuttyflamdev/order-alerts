import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Set ${name} in your environment.`);
    }
    return value
}

export const SHOP = required('SHOPIFY_SHOP');
export const CLIENT_ID = required('SHOPIFY_CLIENT_ID');
export const CLIENT_SECRET = required('SHOPIFY_CLIENT_SECRET');
export const SLACK_WEBHOOK_URL = required('SLACK_WEBHOOK_URL');
export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = required('DATABASE_URL');