import crypto from 'node:crypto';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

const body = JSON.stringify({ 
    id: 1, 
    name: '#TEST1',
    total_price: '25.00',
    currency: 'USD' 
});

const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET)
    .update(body)
    .digest('base64');

const webhookId = process.argv[2] ?? crypto.randomUUID();

const response = await fetch('http://localhost:3000/webhooks', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-SHA256': hmac,
        'X-Shopify-Webhook-Id': webhookId,
        'X-Shopify-Topic': 'orders/create'
    },
    body,
});

console.log(response.status, await response.text());