// Exercises examples/lib/qoblex.mjs against a stub server that reproduces every response
// shape v1 actually uses. The client's whole job is to hide those differences, so a bug
// here is a bug in every example at once, and none of it is visible without a real account.
//
//   node tools/test-client.mjs
import { createServer } from 'node:http';
import { Qoblex, QoblexError } from '../examples/lib/qoblex.mjs';

let failures = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) return console.log(`  ok    ${name}`);
  failures++;
  console.log(`  FAIL  ${name}\n          expected ${e}\n          actual   ${a}`);
};

const ids = (records) => records.map((r) => r.id);
const page = (n, size, total) =>
  Array.from({ length: Math.max(0, Math.min(size, total - n * size)) }, (_, i) => ({
    id: n * size + i,
  }));

let requests = [];
let rateLimitOnce = false;

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  requests.push(url.pathname + url.search);
  const json = (body, status = 200, headers = {}) => {
    res.writeHead(status, { 'content-type': 'application/json', ...headers });
    res.end(JSON.stringify(body));
  };

  if (url.pathname === '/v1/limited' && !rateLimitOnce) {
    rateLimitOnce = true;
    return json({ title: 'Too Many Requests' }, 429, { 'retry-after': '1' });
  }

  switch (url.pathname) {
    // The common shape: zero-based `page`, records under a resource-named key.
    case '/v1/products': {
      const p = Number(url.searchParams.get('page') ?? 0);
      // count is the total; filtered_count is the size of THIS page, as the live API
      // answers. Setting both to the total is what let the paging bug through.
      const rows = page(p, 50, 120);
      return json({ count: 120, filtered_count: rows.length, products: rows });
    }
    // Same shape, different key. Purchase orders call the collection `lines`.
    case '/v1/purchase_orders': {
      const p = Number(url.searchParams.get('page') ?? 0);
      const short = page(p, 50, 3);
      return json({ count: 3, filtered_count: short.length, lines: short });
    }
    // `limit` + `offset`, with a server-chosen page size that is not 50.
    case '/v1/products/1/variants': {
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const size = 20;
      return json({
        data: Array.from({ length: Math.max(0, Math.min(size, 45 - offset)) }, (_, i) => ({
          id: offset + i,
        })),
        limit: size,
        offset,
        total_count: 45,
      });
    }
    // A bare top-level array: no envelope, no paging.
    case '/v1/users':
      return json([{ id: 0 }, { id: 1 }]);
    // The reporting lists answer `has_next_page` outright.
    case '/v1/reporting/inventory': {
      const p = Number(url.searchParams.get('page') ?? 0);
      const rep = page(p, 50, 75);
      return json({ count: 75, filtered_count: rep.length, has_next_page: p < 1, lines: rep });
    }
    case '/v1/limited':
      return json({ ok: true });
    case '/v1/broken':
      return json({ title: 'One or more validation errors occurred.', status: 400, errors: { sku: ['The sku field is required.'] } }, 400);
    default:
      return json({ title: 'Not Found' }, 404);
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const qoblex = new Qoblex({ apiKey: 'test', baseUrl, minIntervalMs: 0 });

console.log('paging');
check('zero-based page, 120 records over 3 pages', (await qoblex.collect('/v1/products')).length, 120);
check('first request asks for no page', requests[0], '/v1/products');
check('then page=1 and page=2', requests.slice(1, 3), ['/v1/products?page=1', '/v1/products?page=2']);

requests = [];
check('short first page stops after one request', ids(await qoblex.collect('/v1/purchase_orders')), [0, 1, 2]);
check('  and cost one request', requests.length, 1);

requests = [];
check('limit/offset with a 20-record page', (await qoblex.collect('/v1/products/1/variants')).length, 45);
check('  advanced by records returned', requests.slice(1), ['/v1/products/1/variants?offset=20', '/v1/products/1/variants?offset=40']);

requests = [];
check('bare array comes back whole', ids(await qoblex.collect('/v1/users')), [0, 1]);
check('  and is not paged', requests.length, 1);

requests = [];
check('has_next_page is honoured', (await qoblex.collect('/v1/reporting/inventory')).length, 75);
check('  stopping at 2 requests', requests.length, 2);

check('max caps the walk', ids(await qoblex.collect('/v1/products', {}, { max: 3 })), [0, 1, 2]);
check('explicit collection key', Qoblex.records({ count: 1, lines: [{ id: 9 }] }, 'lines'), [{ id: 9 }]);

console.log('\nerrors');
const start = Date.now();
check('429 is retried after Retry-After', await qoblex.request('/v1/limited'), { ok: true });
check('  having waited about a second', Date.now() - start >= 900, true);

let caught = null;
try {
  await qoblex.request('/v1/broken');
} catch (error) {
  caught = error;
}
check('400 throws QoblexError', caught instanceof QoblexError, true);
check('  carrying the status', caught?.status, 400);
check('  and naming the rejected field', /sku: The sku field is required\./.test(caught?.message ?? ''), true);

console.log('\npacing');
const paced = new Qoblex({ apiKey: 'test', baseUrl, minIntervalMs: 120 });
const t0 = Date.now();
await Promise.all([paced.request('/v1/users'), paced.request('/v1/users'), paced.request('/v1/users')]);
const elapsed = Date.now() - t0;
check('three concurrent calls are spaced, not fired at once', elapsed >= 240, true);

server.close();
if (failures) {
  console.log(`\n${failures} failing`);
  process.exit(1);
}
console.log('\nall passing');
