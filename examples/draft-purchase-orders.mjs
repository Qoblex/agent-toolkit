#!/usr/bin/env node
// Turn what is running low into one draft purchase order per supplier.
//
//   node examples/draft-purchase-orders.mjs             # print what it would create
//   node examples/draft-purchase-orders.mjs --commit    # create the drafts
//
// It stops at draft on purpose. Creating a purchase order puts it on screen for somebody to
// look at; `POST /v1/purchase_orders/{id}/approve` commits the spend. That second step is a
// person's decision, so this script does not have a flag for it.
//
// Variants carry `supplier_ids`, so lines group by supplier without a second request each.
// A variant with no supplier cannot be ordered from anyone and is listed separately rather
// than quietly dropped.
import { client } from './lib/qoblex.mjs';

const commit = process.argv.includes('--commit');
const qoblex = client();

// `billing_location_id` is documented as required on a purchase order even though the
// schema does not list it. Locations is a bare-array endpoint: no envelope, no paging.
const locations = await qoblex.request('/v1/account/locations');
const defaultLocation = (Array.isArray(locations) ? locations : [])[0];
if (!defaultLocation) {
  console.error('No locations on this account. A purchase order needs one to bill and ship to.');
  process.exit(1);
}

const bySupplier = new Map();
const orphans = [];

for await (const v of qoblex.paginate('/v1/variants')) {
  const available = (v.quantity ?? 0) - (v.allocated_quantity ?? 0);
  const buffer = v.buffer_quantity ?? 0;
  const incoming = v.incoming_quantity ?? 0;
  if (buffer <= 0) continue;                       // no target, nothing to top up to
  if (available + incoming > buffer) continue;     // already covered, on the shelf or inbound

  // Order back up to the buffer, less whatever is already on its way.
  const quantity = Math.ceil(buffer - available - incoming);
  if (quantity <= 0) continue;

  const line = {
    catalog_item_id: v.id,
    sku: v.sku,
    name: [v.product_name, v.name].filter(Boolean).join(' / '),
    quantity,
    price: v.purchase_price ?? 0,
  };

  const supplierId = v.supplier_ids?.[0];
  if (!supplierId) {
    orphans.push(line);
    continue;
  }
  if (!bySupplier.has(supplierId)) bySupplier.set(supplierId, []);
  bySupplier.get(supplierId).push(line);
}

if (!bySupplier.size && !orphans.length) {
  console.log('Nothing to reorder.');
  process.exit(0);
}

for (const [supplierId, lines] of bySupplier) {
  const total = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
  console.log(`\nSupplier ${supplierId}: ${lines.length} lines, ${total.toFixed(2)}`);
  for (const l of lines) {
    console.log(`   ${String(l.quantity).padStart(6)}  ${(l.sku ?? '').padEnd(16)} ${l.name}`);
  }

  const body = {
    supplier: { id: supplierId },
    billing_location_id: defaultLocation.id,
    shipping_location_id: defaultLocation.id,
    private_notes: 'Drafted from buffer shortfall by examples/draft-purchase-orders.mjs',
    line_items: lines.map(({ catalog_item_id, quantity, price, sku, name }) => ({
      catalog_item_id,
      quantity,
      price,
      sku,
      name,
    })),
  };

  if (!commit) {
    console.log('   (dry run, nothing created)');
    continue;
  }

  const created = await qoblex.request('/v1/purchase_orders', { method: 'POST', body });
  console.log(`   created purchase order ${created?.number ?? created?.id} as a draft`);
}

if (orphans.length) {
  console.log(`\n${orphans.length} items are below buffer with no supplier set, so no order can be raised:`);
  for (const l of orphans.slice(0, 10)) console.log(`   ${(l.sku ?? '').padEnd(16)} ${l.name}`);
  if (orphans.length > 10) console.log(`   ... and ${orphans.length - 10} more`);
}

if (!commit) {
  console.log('\nNothing was created. Re-run with --commit to raise these as drafts.');
  console.log('Approving a draft is a separate, deliberate step in Qoblex.');
}
