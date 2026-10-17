import { graphql } from "./shopify.js";

const query = `
  {
    orders(first: 3) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

async function main() {
  const data = await graphql(query);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
