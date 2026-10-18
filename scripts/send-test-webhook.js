import crypto from 'node:crypto';
import { CLIENT_SECRET } from '../src/config.js';

const orderId = process.argv[2] ?? String(Date.now());

const body = JSON.stringify({ 
    id: orderId, 
    name: `#TEST-${orderId}`,
    total_price: '25.00',
    currency: 'USD' 
});

const hmac = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(body)
    .digest('base64');

const target = process.env.WEBHOOK_URL ?? 'http://localhost:3000/webhooks';

const response = await fetch(target, {
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