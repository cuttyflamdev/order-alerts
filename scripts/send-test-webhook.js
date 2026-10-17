import crypto from 'node:crypto';
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

const orderId = process.argv[2] ?? String(Date.now());

const body = JSON.stringify({ 
    id: orderId, 
    name: `#TEST-${orderId}`,
    total_price: '25.00',
    currency: 'USD' 
});

const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET)
    .update(body)
    .digest('base64');

const response = await fetch('http://localhost:3000/webhooks', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-SHA256': hmac,
        'X-Shopify-Webhook-Id': crypto.randomUUID(),
        'X-Shopify-Topic': 'orders/create'
    },
    body,
});

console.log(response.status, await response.text());