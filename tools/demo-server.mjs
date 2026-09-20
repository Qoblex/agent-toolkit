// A stand-in Qoblex API, so the examples can be run before anyone has an account.
//
//   npm run demo            # starts here, prints the two commands to try
//
// The data is invented and says so. The point is not to simulate Qoblex, it is to let
// somebody see what the scripts do and what the responses look like without signing up,
// and to give the README output that is really the script's rather than a mock-up of it.
//
// It serves the shapes the real API serves, envelope keys and all, so a script that works
// here works there. Only the endpoints the examples call are implemented; everything else
// answers 404 the way the real API would.
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);

const PRODUCTS = [
  ['ESP-1KG-DRK',  'Espresso Blend',      'Dark / 1kg',   4,  0,  24, 0,   18.40],
  ['ESP-1KG-MED',  'Espresso Blend',      'Medium / 1kg', 31, 6,  0,  24,  18.40],
  ['FLT-250-ETH',  'Ethiopia Yirgacheffe', 'Filter / 250g', 2, 2,  0,  30,  7.10],
  ['FLT-250-COL',  'Colombia Huila',      'Filter / 250g', 96, 12, 0,  30,  6.85],
  ['CUP-8OZ-WHT',  'Takeaway Cup',        '8oz / White',  310, 40, 0,  500, 0.11],
  ['CUP-12OZ-WHT', 'Takeaway Cup',        '12oz / White', 44, 0,  0,  500, 0.13],
  ['LID-8OZ-BLK',  'Cup Lid',             '8oz / Black',  0,  0,  2000, 400, 0.04],
  ['BAG-VAC-1KG',  'Vacuum Bag',          '1kg',          1250, 0, 0,  600, 0.09],
  ['SYR-VAN-750',  'Vanilla Syrup',       '750ml',        7,  1,  0,  12,  4.25],
  ['SYR-CAR-750',  'Caramel Syrup',       '750ml',        11, 0,  24, 12,  4.25],
  ['GRD-BUR-58',   'Grinder Burr Set',    '58mm',         2,  0,  0,  3,   64.00],
  ['DSC-TAB-100',  'Descaling Tablets',   'Tub of 100',   19, 4,  0,  10,  12.50],
];

// Two suppliers, so draft-purchase-orders has more than one order to raise.
const SUPPLIER = (sku) => (sku.startsWith('CUP') || sku.startsWith('LID') || sku.startsWith('BAG') ? 402 : 401);

const variants = PRODUCTS.map(
  ([sku, product_name, name, quantity, allocated_quantity, incoming_quantity, buffer_quantity, purchase_price], i) => ({
    id: 1000 + i,
    sku,
    product_name,
    name,
    quantity,
    allocated_quantity,
    incoming_quantity,
    buffer_quantity,
    purchase_price,
    quantity_unit: 'pcs',
    is_batch_tracked: sku.startsWith('ESP') || sku.startsWith('FLT') || sku.startsWith('SYR'),
    supplier_ids: [SUPPLIER(sku)],
    updated_at: new Date(Date.now() - i * 3_600_000).toISOString(),
  }),
);

const day = 86_400_000;
const batches = [
  ['ESP-1KG-DRK', 'R-2609-A', -6,  4,  18.40, 'Roastery'],
  ['FLT-250-ETH', 'L-2610-C', 3,   2,  7.10,  'Roastery'],
  ['SYR-VAN-750', 'B-2554-K', 11,  7,  4.25,  'Main store'],
  ['ESP-1KG-MED', 'R-2611-B', 19,  31, 18.40, 'Roastery'],
  ['FLT-250-COL', 'L-2612-D', 34,  96, 6.85,  'Main store'],
  ['SYR-CAR-750', 'B-2560-M', 52,  11, 4.25,  'Main store'],
  ['FLT-250-COL', 'L-2601-A', 88,  40, 6.85,  'Main store'], // outside a 60 day window
].map(([sku, number, inDays, quantity, cost, location], i) => {
  const v = variants.find((x) => x.sku === sku);
  return {
    id: 5000 + i,
    number,
    quantity,
    reserved_quantity: 0,
    cost,
    expires_at: new Date(Date.now() + inDays * day).toISOString(),
    created_at: new Date(Date.now() - 120 * day).toISOString(),
    updated_at: new Date(Date.now() - 5 * day).toISOString(),
    location: { id: 1, name: location },
    product_variant: { id: v.id, sku: v.sku, name: `${v.product_name} / ${v.name}` },
  };
});

// The filter dialect, far enough to serve the examples: `field<=value`, `field>=value`.
function applyFilters(rows, expression) {
  if (!expression) return rows;
  for (const condition of expression.split(',')) {
    const [, field, op, value] = condition.match(/^([\w.]+)(<=|>=|==|<|>)(.*)$/) ?? [];
    if (!field) continue;
    rows = rows.filter((row) => {
      const actual = row[field];
      if (actual === undefined) return false;
      const [a, b] = Number.isNaN(Number(value))
        ? [String(actual), value]
        : [Number(actual), Number(value)];
      if (op === '<=') return a <= b;
      if (op === '>=') return a >= b;
      if (op === '<') return a < b;
      if (op === '>') return a > b;
      return String(a) === String(b);
    });
  }
  return rows;
}

function sort(rows, expression) {
  if (!expression) return rows;
  const fields = expression.split(',');
  return [...rows].sort((x, y) => {
    for (const f of fields) {
      const desc = f.startsWith('-');
      const key = desc ? f.slice(1) : f;
      const a = x[key];
      const b = y[key];
      if (a === b) continue;
      return (a < b ? -1 : 1) * (desc ? -1 : 1);
    }
    return 0;
  });
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const q = url.searchParams;
  const send = (body, status = 200) => {
    res.writeHead(status, { 'content-type': 'application/json', 'x-ratelimit-limit': '30' });
    res.end(JSON.stringify(body));
  };

  if (!req.headers['qoblex-x-api-key']) return send({ title: 'Unauthorized', status: 401 }, 401);

  // Paged the way the real endpoints are: zero-based, 50 to a page, records under a
  // resource-named key for variants and under `lines` for batches.
  const paged = (rows, key) => {
    const page = Number(q.get('page') ?? 0);
    const start = page * 50;
    // count is the total; filtered_count is this page's row count, as the live API answers.
    const slice = rows.slice(start, start + 50);
    return { count: rows.length, filtered_count: slice.length, [key]: slice };
  };

  switch (url.pathname) {
    case '/v1/users/me':
      return send({ id: 1, name: 'Demo User', email: 'demo@example.invalid' });
    case '/v1/variants':
      return send(paged(sort(applyFilters(variants, q.get('filters')), q.get('sort_by')), 'variants'));
    case '/v1/batches':
      return send(paged(sort(applyFilters(batches, q.get('filters')), q.get('sort_by')), 'lines'));
    case '/v1/products':
      return send(paged(sort(applyFilters(variants, q.get('filters')), q.get('sort_by')), 'products'));
    // A bare array, no envelope, exactly as the real endpoint answers.
    case '/v1/account/locations':
      return send([{ id: 1, name: 'Main store' }, { id: 2, name: 'Roastery' }]);
    default:
      if (url.pathname.startsWith('/v1/batches/') && url.pathname.endsWith('/trace')) {
        const id = Number(url.pathname.split('/')[3]);
        const batch = batches.find((b) => b.id === id);
        if (!batch) return send({ title: 'Not Found', status: 404 }, 404);
        return send({
          batch: { id: batch.id, number: batch.number },
          upstream: [{ type: 'goods_receipt_note', number: 'GRN-1042', supplier: 'Highland Green Coffee', received_at: batch.created_at }],
          downstream: [
            { type: 'shipment', number: 'SH-8801', customer: 'Dockside Cafe', quantity: 6 },
            { type: 'manufacturing_order', number: 'MO-221', quantity: 12 },
          ],
        });
      }
      if (req.method === 'POST' && url.pathname === '/v1/purchase_orders') {
        return send({ id: 9001, number: 'PO-DEMO-1', status: 'Draft' });
      }
      return send({ title: 'Not Found', status: 404 }, 404);
  }
});

server.listen(PORT, () => {
  console.log(`Demo Qoblex API on http://localhost:${PORT} (invented data, no account needed)\n`);
  console.log('In another terminal:\n');
  console.log(`  export QOBLEX_BASE_URL=http://localhost:${PORT}`);
  console.log('  export QOBLEX_API_KEY=demo\n');
  console.log('  node examples/low-stock.mjs');
  console.log('  node examples/expiring-batches.mjs');
  console.log('  node examples/draft-purchase-orders.mjs\n');
  console.log('Ctrl-C to stop.');
});
