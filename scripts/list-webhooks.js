import { graphql } from '../src/shopify.js';

const query = /* GraphQL */ `
  {
    webhookSubscriptions(first: 20) {
      edges {
        node {
          id
          topic
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
    }
  }
`;

const data = await graphql(query);

for (const { node } of data.webhookSubscriptions.edges) {
  const url = node.endpoint?.callbackUrl ?? '(not an HTTP endpoint)';
  console.log(`${node.id}\n  ${node.topic}\n  ${url}\n`);
}

if (data.webhookSubscriptions.edges.length === 0) {
  console.log('No webhook subscriptions.');
}