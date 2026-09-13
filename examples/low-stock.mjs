#!/usr/bin/env node
// What is running low, and what is already on its way.
//
//   node examples/low-stock.mjs [--buffer-only] [--limit 500]
//
// Available stock is `quantity - allocated_quantity`: what is on the shelf minus what is
// already promised to an order. A variant is short when available stock is below its
// `buffer_quantity`, the safety stock set on the variant in Qoblex. `incoming_quantity` is
// what is already on a purchase order, so a variant that is short but covered by an
// inbound delivery is a different problem from one nobody has ordered.
//
// Fields used, all from the ProductVariant schema: quantity, allocated_quantity,
// incoming_quantity, buffer_quantity, sku, name, product_name, is_batch_tracked.
import { client, Qoblex } from './lib/qoblex.mjs';

const args = process.argv.slice(2);
const bufferOnly = args.includes('--buffer-only');
const limit = Number(args[args.indexOf('--limit') + 1]) || Infinity;

const qoblex = client();

const short = [];
let scanned = 0;

// One pass over the catalog. `expand` is left off on purpose: the fields this needs are on
// the variant already, and every expansion makes the response bigger without saving a call.
for await (const v of qoblex.paginate('/v1/variants', {}, { max: limit })) {
  scanned++;
  const onHand = v.quantity ?? 0;
  const allocated = v.allocated_quantity ?? 0;
  const incoming = v.incoming_quantity ?? 0;
  const buffer = v.buffer_quantity ?? 0;
  const available = onHand - allocated;

  // With no buffer set there is no threshold to be under, so "low" can only mean "none
  // left". Reporting every zero-buffer variant as low would bury the ones that are real.
  const threshold = buffer > 0 ? buffer : 0;
  if (buffer === 0 && bufferOnly) continue;
  if (available > threshold) continue;

  short.push({
    sku: v.sku ?? '',
    name: [v.product_name, v.name].filter(Boolean).join(' / '),
    available,
    buffer,
    incoming,
    covered: incoming > 0 && available + incoming > threshold,
    batchTracked: Boolean(v.is_batch_tracked),
  });
}

short.sort((a, b) => a.available - b.available || a.sku.localeCompare(b.sku));

if (!short.length) {
  console.log(`Nothing below its buffer. Scanned ${scanned} variants.`);
  process.exit(0);
}

const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const num = (s, n) => String(s).padStart(n);

console.log(`${short.length} of ${scanned} variants at or below buffer\n`);
console.log(`${pad('SKU', 18)} ${pad('Item', 38)} ${num('Avail', 7)} ${num('Buffer', 7)} ${num('Incoming', 9)}  Status`);
console.log('-'.repeat(96));
for (const r of short) {
  const status = r.covered ? 'on order' : r.available <= 0 ? 'OUT OF STOCK' : 'reorder';
  console.log(
    `${pad(r.sku, 18)} ${pad(r.name, 38)} ${num(r.available, 7)} ${num(r.buffer, 7)} ${num(r.incoming, 9)}  ${status}`,
  );
}

const toOrder = short.filter((r) => !r.covered);
console.log(
  `\n${toOrder.length} need a purchase order, ${short.length - toOrder.length} already covered by one.`,
);
