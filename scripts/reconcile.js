import { graphql } from '../src/shopify.js';
import { sendAlert } from '../src/slack.js';
import { hasAlerted, markAlerted } from '../src/store.js';

const hours = Number(process.argv[2]) || 24;
const shouldSend = process.argv.includes('--send');

const query = /* GraphQL */ `
  query ($search: String!, $cursor: String) {
    orders(first: 50, after: $cursor, query: $search, sortKey: CREATED_AT) {
      edges {
        node {
          id
          name
          createdAt
          totalPriceSet {
            presentmentMoney {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const numericId = (gid) => gid.split('/').pop();

async function fetchRecentOrders(since) {
  const orders = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await graphql(query, {
      search: `created_at:>='${since}'`,
      cursor,
    });
    const page = data.orders;
    orders.push(...page.edges.map((edge) => edge.node));
    hasNextPage = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  return orders;
}

const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
const orders = await fetchRecentOrders(since);
const missed = orders.filter((order) => !hasAlerted(numericId(order.id)));

const formatPT = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const sinceLabel = formatPT(since);

console.log(
  `Checked ${orders.length} orders since ${sinceLabel}; ${missed.length} without an alert.`
);

for (const order of missed) {
  const { amount, currencyCode } = order.totalPriceSet.presentmentMoney;
  const text = `[Recovered] New order ${order.name}: ${amount} ${currencyCode}`;

  if (!shouldSend) {
    console.log(`Would alert: ${text} (created ${formatPT(order.createdAt)} PT`);
    continue;
  }

  await sendAlert(text);
  markAlerted(numericId(order.id));
  console.log(`Alerted: ${text}`);
}