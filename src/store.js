import { pool } from './db.js';

export async function hasAlerted(orderId) {
  const { rowCount } = await pool.query(
    'select 1 from alerted_orders where order_id = $1',
    [String(orderId)]
  );
  return rowCount > 0
}

export async function markAlerted(orderId) {
  await pool.query(
    'insert into alerted_orders (order_id) values ($1) on conflict (order_id) do nothing',
    [String(orderId)]
  );
}