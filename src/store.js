import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATA_DIR = 'data';
const FILE = `${DATA_DIR}/alerted-orders.json`;

function load() {
  if (!existsSync(FILE)) return new Set();
  return new Set(JSON.parse(readFileSync(FILE, 'utf8')));
}

const alerted = load();

export function hasAlerted(orderId) {
  return alerted.has(String(orderId));
}

export function markAlerted(orderId) {
  alerted.add(String(orderId));
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify([...alerted]));
}