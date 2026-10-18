import { existsSync, readFileSync } from 'node:fs';
import { pool } from '../src/db.js';

const FILE = 'data/alerted-orders.json';

if (existsSync(FILE)) {
  const ids = JSON.parse(readFileSync(FILE, 'utf8'));
  for (const id of ids) {
    await pool.query(
      'insert into alerted_orders (order_id) values ($1) on conflict (order_id) do nothing',
      [String(id)]
    );
  }
  console.log(`Imported ${ids.length} order IDs.`);
} else {
  console.log('No file to import.');
}

await pool.end();