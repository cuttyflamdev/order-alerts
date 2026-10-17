import { graphql } from '../src/shopify.js';

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error(
    'Usage: node scripts/create-webhook.js https://YOUR-URL.trycloudflare.com'
  );
  process.exit(1);
}

const mutation = /* GraphQL */ `
  mutation webhookSubscriptionCreate(
    $topic: WebhookSubscriptionTopic!
    $webhookSubscription: WebhookSubscriptionInput!
  ) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: $webhookSubscription
    ) {
      webhookSubscription {
        id
        topic
        uri
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const data = await graphql(mutation, {
  topic: 'ORDERS_CREATE',
  webhookSubscription: {
    uri: `${baseUrl}/webhooks`,
    format: 'JSON',
  },
});

const { webhookSubscription, userErrors } = data.webhookSubscriptionCreate;

if (userErrors.length > 0) {
  console.error(JSON.stringify(userErrors, null, 2));
  process.exit(1);
}

console.log('Created:', webhookSubscription);