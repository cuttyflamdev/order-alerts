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

app.post('/webhooks', express.raw({ type: '*/*' }), (req, res) => {
    if (!isValidHmac(req.body, req.get('X-Shopify-Hmac-SHA256'))) {
        return res.status(401).send('Invalid signature');
    }
    const text = req.body.toString('utf8');
    console.log('Received:', text);
    res.status(200).send('OK');
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});