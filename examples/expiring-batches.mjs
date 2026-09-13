#!/usr/bin/env node
// Which batches expire soon, and how much stock is inside them.
//
//   node examples/expiring-batches.mjs [--days 60] [--trace <batch_id>]
//
// This is the report that is hard to get out of a general-purpose system and is one line
// here, because Qoblex tracks stock per batch with an expiry date on each one. Food,
// beverage, beauty and anything with a shelf life runs on it: what is about to date out,
// where it is sitting, and how much it is worth.
//
// `--trace` takes one batch id and asks where that stock came from and where it went,
// which is the question a recall starts with.
//
// Fields used, all from the batch list schema: id, number, expires_at, quantity,
// reserved_quantity, cost, location, product_variant.
import { client } from './lib/qoblex.mjs';

const args = process.argv.slice(2);
const days = Number(args[args.indexOf('--days') + 1]) || 60;
const traceId = args.includes('--trace') ? args[args.indexOf('--trace') + 1] : null;

const qoblex = client();

if (traceId) {
  const trace = await qoblex.request(`/v1/batches/${traceId}/trace`);
  console.log(JSON.stringify(trace, null, 2));
  process.exit(0);
}

const horizon = new Date(Date.now() + days * 86_400_000);

// Filter and sort on the server. Pulling every batch and filtering here would cost a page
// per 50 batches against a budget of 30 requests a minute.
const filters = `expires_at<=${horizon.toISOString()}`;
const rows = [];

for await (const b of qoblex.paginate('/v1/batches', { filters, sort_by: 'expires_at' })) {
  const quantity = b.quantity ?? 0;
  if (quantity <= 0) continue; // an empty batch has no stock left to lose
  const expires = b.expires_at ? new Date(b.expires_at) : null;
  rows.push({
    id: b.id,
    number: b.number ?? '',
    sku: b.product_variant?.sku ?? '',
    item: b.product_variant?.name ?? b.product_variant?.product_name ?? '',
    location: b.location?.name ?? '',
    quantity,
    reserved: b.reserved_quantity ?? 0,
    value: quantity * (b.cost ?? 0),
    expires,
    // Truncate rather than floor: floor(-6.001) is -7, which reports a batch that
    // expired six days ago as seven.
    inDays: expires ? Math.trunc((expires - Date.now()) / 86_400_000) : null,
  });
}

if (!rows.length) {
  console.log(`No batches with stock expiring in the next ${days} days.`);
  process.exit(0);
}

const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const num = (s, n) => String(s).padStart(n);

console.log(`${rows.length} batches with stock expiring within ${days} days\n`);
console.log(
  `${pad('Batch', 12)} ${pad('SKU', 14)} ${pad('Item', 32)} ${pad('Location', 12)} ${num('Qty', 7)} ${num('Value', 10)}  Expires`,
);
console.log('-'.repeat(110));

let value = 0;
let expired = 0;
for (const r of rows) {
  value += r.value;
  if (r.inDays !== null && r.inDays < 0) expired++;
  const when =
    r.inDays === null
      ? 'no date'
      : r.inDays < 0
        ? `EXPIRED ${-r.inDays}d ago`
        : `${r.expires.toISOString().slice(0, 10)} (${r.inDays}d)`;
  console.log(
    `${pad(r.number, 12)} ${pad(r.sku, 14)} ${pad(r.item, 32)} ${pad(r.location, 12)} ${num(r.quantity, 7)} ${num(r.value.toFixed(2), 10)}  ${when}`,
  );
}

console.log(`\nStock at risk: ${value.toFixed(2)} across ${rows.length} batches.`);
if (expired) {
  console.log(
    expired === 1
      ? 'One of them is already past its expiry date.'
      : `${expired} of them are already past their expiry date.`,
  );
}
console.log(`\nTrace one: node examples/expiring-batches.mjs --trace ${rows[0].id}`);
