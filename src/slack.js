import { SLACK_WEBHOOK_URL } from "./config.js";

export async function sendAlert(text) {
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Slack request failed: ${response.status}`);
  }
}