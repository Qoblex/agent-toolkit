// A small Qoblex API v1 client. No dependencies, Node 18 or newer.
//
// It exists because three things about this API are easy to get wrong and tedious to get
// right more than once: the 30 requests per 60 seconds limit, zero-based paging, and the
// fact that list responses do not agree on which key holds the records.
//
//   import { Qoblex } from './lib/qoblex.mjs';
//   const qoblex = new Qoblex();
//   for await (const product of qoblex.paginate('/v1/products', { expand: 'variants' })) {
//     console.log(product.name);
//   }

const BASE_URL = process.env.QOBLEX_BASE_URL ?? 'https://api.qoblex.com';

// 30 requests per 60 seconds is 2000ms per request. We pace a little slower than that
// because the window is not ours to observe: another process using the same key spends
// from the same budget, and the cost of being wrong is a 429 that stalls everything.
const MIN_INTERVAL_MS = 2100;

export class QoblexError extends Error {
  constructor(status, body, url) {
    // A validation failure names the fields it rejected. Surfacing "400 Bad Request" and
    // dropping that is what makes an agent retry the same broken request in a loop.
    const fields = body?.errors
      ? Object.entries(body.errors)
          .map(([field, messages]) => `${field}: ${[].concat(messages).join(' ')}`)
          .join('; ')
      : null;
    super(`${status} on ${url}${fields ? `: ${fields}` : body?.title ? `: ${body.title}` : ''}`);
    this.name = 'QoblexError';
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// An ISO timestamp the filters will actually match.
//
// `Date.prototype.toISOString()` emits milliseconds, and a filter value carrying fractional
// seconds matches NOTHING on the endpoints that use the second filter dialect. It does not
// error: `/v1/batches?filters=expires_at<=2028-02-02T14:55:44.042Z` answers 204 with no body
// where the same instant without the `.042` answers 200 and 114 records. Measured
// 2026-09-20. Always build a filter value with this.
export const isoSeconds = (date = new Date()) => `${new Date(date).toISOString().slice(0, 19)}Z`;

export class Qoblex {
  #nextSlot = 0;

  constructor({
    apiKey = process.env.QOBLEX_API_KEY,
    baseUrl = BASE_URL,
    verbose = false,
    // Only the tests change this. Raising it above the real interval is the one safe
    // direction; lowering it against the live API just buys 429s.
    minIntervalMs = MIN_INTERVAL_MS,
  } = {}) {
    if (!apiKey) {
      throw new Error(
        'No API key. Set QOBLEX_API_KEY in the environment. Create a key in Qoblex under ' +
          'Integrations > API > Create API key.',
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.verbose = verbose;
    this.minIntervalMs = minIntervalMs;
  }

  // One shared queue, so concurrent callers cannot collectively exceed the limit. Each
  // request claims the next slot before it is sent rather than sleeping afterwards.
  async #pace() {
    const now = Date.now();
    const slot = Math.max(now, this.#nextSlot);
    this.#nextSlot = slot + this.minIntervalMs;
    if (slot > now) await sleep(slot - now);
  }

  async request(path, { method = 'GET', query, body, retries = 3 } = {}) {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, this.baseUrl);
    for (const [key, value] of Object.entries(query ?? {})) {
      // URLSearchParams encodes the filter operators correctly; hand-built query strings
      // are where `>=` and the `@=*` operators get mangled.
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }

    for (let attempt = 0; ; attempt++) {
      await this.#pace();
      if (this.verbose) console.error(`${method} ${url}`);

      const res = await fetch(url, {
        method,
        headers: {
          'qoblex-x-api-key': this.apiKey,
          accept: 'application/json',
          ...(body ? { 'content-type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (res.status === 429 && attempt < retries) {
        // Retry-After is in seconds and is authoritative. Guessing an interval here is how
        // a backoff turns into a second source of 429s.
        const wait = (Number(res.headers.get('retry-after')) || 60) * 1000;
        if (this.verbose) console.error(`  429, waiting ${wait / 1000}s`);
        this.#nextSlot = Date.now() + wait;
        await sleep(wait);
        continue;
      }

      if (res.status >= 500 && attempt < retries) {
        await sleep(2 ** attempt * 1000);
        continue;
      }

      if (res.status === 204) return null;

      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new QoblexError(res.status, payload, url.pathname);
      return payload;
    }
  }

  // Four shapes, all of them real. A list may wrap its records under `products`,
  // `sale_orders`, `lines`, `custom_fields`, `data` and so on; or return a bare array with
  // no envelope at all, as 11 endpoints do. `docs/reference/envelopes.md` has the table.
  // Taking the first array-valued property is safe because no paginated envelope in v1 has
  // a second one. Pass `collection` where you would rather not rely on that.
  static records(payload, collection) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (collection) return payload[collection] ?? [];
    const key = Object.keys(payload).find((k) => Array.isArray(payload[k]));
    return key ? payload[key] : [];
  }

  // How many records the query matches in total, which is what you page against.
  //
  // `count` is that number, and it tracks the filter: /v1/variants answers 4873 unfiltered
  // and 3290 with `filters=quantity<5`. `filtered_count` is NOT a total at all, it is the
  // number of rows in the page you are holding, and it reads 50 on every page of every
  // endpoint. The schema descriptions in the OpenAPI document say the opposite of both.
  //
  // Reading `filtered_count` as the total stops the walk after the first page, silently,
  // with exactly one page of a 4873-record catalog in hand. Measured against a live
  // account on 2026-09-20; no stub reproduced it, because the stub implemented the
  // documented meaning.
  static total(payload) {
    if (Array.isArray(payload)) return payload.length;
    return payload?.count ?? payload?.total_count ?? null;
  }

  // Yields every record across pages, whichever way the endpoint pages.
  //
  // Most of v1 takes a zero-based `page`. `/v1/products/overview` and
  // `/v1/products/{id}/variants` take `offset`, `/v1/activity` takes `page` with
  // `page_size`, and 11 endpoints do not page at all. The style is read off the first
  // response rather than configured, so calling code does not have to know which it got.
  //
  // Stops at the reported total, at `has_next_page: false`, or at the first short page,
  // rather than paging on until an empty one comes back: that last empty request is a
  // thirtieth of a minute's budget spent learning nothing.
  async *paginate(path, query = {}, { collection, max = Infinity } = {}) {
    let page = 0; // zero-based. This is the bug this method exists to prevent.
    let offset = 0;
    let style = null;
    let seen = 0;
    // The page size is not the same on every endpoint and is not always reported, so it is
    // measured rather than assumed: the first full page defines it, and a page smaller than
    // the largest one seen is the last page. Hard-coding 50 truncates the endpoints that
    // return their own `limit`.
    let widest = 0;

    while (seen < max) {
      const cursor = style === 'offset' ? { offset } : style === null ? {} : { page };
      const payload = await this.request(path, { query: { ...query, ...cursor } });

      if (style === null) {
        // A bare array is the whole answer: no envelope, no second page to ask for.
        if (Array.isArray(payload)) {
          for (const record of payload) {
            yield record;
            if (++seen >= max) return;
          }
          return;
        }
        style = payload && 'offset' in payload ? 'offset' : 'page';
        if (style === 'page') page = 0;
      }

      const records = Qoblex.records(payload, collection);
      if (!records.length) return;

      for (const record of records) {
        yield record;
        if (++seen >= max) return;
      }

      const total = Qoblex.total(payload);
      if (payload?.has_next_page === false) return;
      if (total !== null && seen >= total) return;
      if (records.length < widest) return;
      widest = Math.max(widest, records.length);

      if (style === 'offset') offset += records.length;
      else page++;
    }
  }

  // Everything in one array. Fine for a few hundred records; for a whole catalog prefer
  // `paginate` and handle each record as it arrives, so a rate-limited run that is
  // interrupted has still done some work.
  async collect(path, query = {}, options = {}) {
    const out = [];
    for await (const record of this.paginate(path, query, options)) out.push(record);
    return out;
  }
}

// What a failing request most likely means, in the words of the thing to go and fix.
const EXPLANATION = {
  401: 'The API key was rejected. Check QOBLEX_API_KEY, and that the key has not been\n' +
       'revoked in Qoblex under Integrations > API. The header is `qoblex-x-api-key`;\n' +
       '`Authorization: Bearer` is not accepted, whatever the 401 response says.',
  402: 'The key is valid but this account is not on a plan that includes API access.\n' +
       'It is a paid add-on, included on Scale, and active during the free trial.\n' +
       'See https://qoblex.com/pricing/. Retrying will not clear this.',
  403: 'The key is valid but lacks the scope for this operation. Permissions are set on\n' +
       'the integration or team member the key belongs to.',
  404: 'No such endpoint or record. Check the path against docs/reference/index.md;\n' +
       'every path begins /v1.',
  405: 'Wrong method for this path. Updates in this API are usually POST /{resource}/{id}\n' +
       'rather than PUT or PATCH. Read the method off docs/reference/.',
  429: 'Rate limited, and the retries did not clear it. The limit is 30 requests per 60\n' +
       'seconds per key, shared with anything else using the same key right now.',
};

// Most examples want the same two lines of setup and the same failure message.
//
// This also installs a top-level error handler, which the class deliberately does not: the
// scripts in examples/ are top-level await, so without one a mistyped key prints a stack
// trace pointing into this file. That is the wrong answer to the most likely first mistake
// anyone makes with this repo. Code using `new Qoblex()` directly gets no global handler and
// can catch QoblexError itself.
//
// Both events are needed. A rejection thrown while a module with top-level await is being
// evaluated arrives as `uncaughtException`, not `unhandledRejection`, so registering only
// the obvious one catches nothing.
export function client(options = {}) {
  const report = (error) => {
    if (error instanceof QoblexError) {
      console.error(`\n${error.message}`);
      const why = EXPLANATION[error.status];
      if (why) console.error(`\n${why}`);
    } else {
      console.error(`\n${error?.stack ?? error}`);
    }
    process.exit(1);
  };
  process.on('uncaughtException', report);
  process.on('unhandledRejection', report);

  try {
    return new Qoblex({ verbose: process.env.QOBLEX_VERBOSE === '1', ...options });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
