#!/usr/bin/env node
// Poll for what changed since the last run.
//
//   node examples/watch-changes.mjs [--resource products] [--field updated_at] [--state .watch.json]
//
// Webhooks are not in v1 yet, so this is the pattern until they are. It asks the server for
// the records that moved, newest first, and keeps a high-water mark between runs. It does
// not download the catalog and diff it, which is the shape that burns the whole rate budget
// to discover that nothing happened.
//
// The filterable field list is documented per endpoint and is blank for some of them, so
// the first thing this does is send one request to find out whether the filter is accepted.
// An unsupported field is a `400`, which makes that probe reliable and cheap.
import { readFile, writeFile } from 'node:fs/promises';
import { client, QoblexError, isoSeconds } from './lib/qoblex.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : fallback;

const resource = arg('--resource', 'products');
const field = arg('--field', 'updated_at');
const statePath = arg('--state', new URL('.watch.json', import.meta.url).pathname);
const path = `/v1/${resource}`;

const qoblex = client();

const state = JSON.parse(await readFile(statePath, 'utf8').catch(() => '{}'));
const key = `${resource}:${field}`;

// Overlap the window by two minutes. A record written while the previous run was mid
// request carries a timestamp inside that run's window but arrives after it, and without
// the overlap it is never seen again.
// isoSeconds throughout: a filter value with milliseconds matches nothing on some
// endpoints and does not error, so the poller would report "nothing changed" forever.
const since = state[key]
  ? isoSeconds(new Date(state[key]).getTime() - 120_000)
  : isoSeconds(Date.now() - 86_400_000);

const filters = `${field}>=${since}`;

let changed;
try {
  changed = await qoblex.collect(path, { filters, sort_by: `-${field}` }, { max: 500 });
} catch (error) {
  if (error instanceof QoblexError && error.status === 400) {
    console.error(
      `${path} does not accept a filter on \`${field}\`.\n` +
        `The response was: ${error.message}\n\n` +
        'Check the field list on that endpoint\'s reference page. `updated_at` exists on\n' +
        'Product, SaleOrder, Quote and ProductBatch; PurchaseOrder calls it `last_updated_at`\n' +
        'and documents `created_at` as the filterable date.',
    );
    process.exit(1);
  }
  throw error;
}

console.log(`${changed.length} ${resource} changed since ${since}`);
for (const record of changed.slice(0, 25)) {
  const label = record.name ?? record.number ?? record.sku ?? `#${record.id}`;
  console.log(`  ${String(record[field] ?? '').slice(0, 19)}  ${label}`);
}
if (changed.length > 25) console.log(`  ... and ${changed.length - 25} more`);

// Advance the mark to the newest record actually seen, not to "now". If the run crashes
// halfway through the work, the next run re-reads the same window rather than skipping it.
const newest = changed
  .map((r) => r[field])
  .filter(Boolean)
  .sort()
  .at(-1);

if (newest) {
  state[key] = newest;
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
  console.log(`\nHigh-water mark for ${key} is now ${newest}`);
} else {
  console.log('\nNothing to record; the mark is unchanged.');
}
