import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import express from 'express';

if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
if (!CLIENT_SECRET) {
    throw new Error('Set SHOPIFY_CLIENT_SECRET in your environment.');
}

const app = express();

function isValidHmac(rawBody, headerValue) {
    if (!headerValue) return false;

    const expected = crypto
        .createHmac('sha256', CLIENT_SECRET)
        .update(rawBody)
        .digest();
    const received = Buffer.from(headerValue, 'base64');

    return (
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received)
    );
}

const seenWebhookIds = new Set();

app.post('/webhooks', express.raw({ type: '*/*' }), (req, res) => {
    if (!isValidHmac(req.body, req.get('X-Shopify-Hmac-SHA256'))) {
        return res.status(401).send('Invalid signature');
    }
    const topic = req.get('X-Shopify-Topic');
    const webhookId = req.get('X-Shopify-Webhook-Id');

    if (webhookId && seenWebhookIds.has(webhookId)) {
        console.log(`Duplicate webhook ${webhookId}, skipping`);
        return res.status(200).send('OK');
    }
    if (webhookId) seenWebhookIds.add(webhookId);

    const order = JSON.parse(req.body.toString('utf8'));

    console.log(
        `[${topic}] order ${order.name}, total ${order.total_price} ${order.currency} (webhook ${webhookId})`
    );
    res.status(200).send('OK');
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});