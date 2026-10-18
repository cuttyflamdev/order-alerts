import { graphql } from '../src/shopify.js';

const id = process.argv[2];
if (!id) {
  console.error(
    'Usage: node scripts/delete-webhook.js gid://shopify/WebhookSubscription/123'
  );
  process.exit(1);
}

const mutation = /* GraphQL */ `
  mutation webhookSubscriptionDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      deletedWebhookSubscriptionId
      userErrors {
        field
        message
      }
    }
  }
`;

const data = await graphql(mutation, { id });
const { deletedWebhookSubscriptionId, userErrors } =
  data.webhookSubscriptionDelete;

if (userErrors.length > 0) {
  console.error(JSON.stringify(userErrors, null, 2));
  process.exit(1);
}

console.log('Deleted:', deletedWebhookSubscriptionId);