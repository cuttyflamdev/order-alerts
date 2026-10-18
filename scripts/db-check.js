import { pool } from "../src/db.js";

const { rows } = await pool.query(
    'select now() as now, count(*)::int as alerted from alerted_orders'
);

console.log(rows[0]);

await pool.end();