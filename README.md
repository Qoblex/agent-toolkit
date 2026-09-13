# Build inventory and order management agents with Claude and the Qoblex API

[Qoblex](https://qoblex.com) runs inventory, orders and production for product businesses.
This repo is what a coding agent needs to build against its API: the whole v1 reference as
plain markdown, a Claude skill, a small client, and four scripts that work.

[![test](https://github.com/qoblex/agent-toolkit/actions/workflows/check.yml/badge.svg)](https://github.com/qoblex/agent-toolkit/actions/workflows/check.yml)
[![API v1](https://img.shields.io/badge/Qoblex%20API-v1%20·%20197%20endpoints-1a202c)](https://api.qoblex.com/)
[![OpenAPI 3.0.1](https://img.shields.io/badge/OpenAPI-3.0.1-6b46c1)](https://api.qoblex.com/swagger/v1/swagger.json)
[![node](https://img.shields.io/badge/node-%E2%89%A518-43853d)](package.json)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

<!--
  Demo video goes here once it is recorded. GitHub renders an uploaded .mp4 inline:
  drag the file into any issue on this repo, copy the generated user-images URL, and
  replace this comment with it. A YouTube link needs a thumbnail image wrapped in an <a>,
  because GitHub does not embed iframes.
-->

## Try it in 30 seconds, without an account

```bash
git clone https://github.com/qoblex/agent-toolkit && cd agent-toolkit
npm run demo          # a stand-in API on localhost, invented data, no key needed
```

Then in another terminal:

```bash
export QOBLEX_BASE_URL=http://localhost:8787 QOBLEX_API_KEY=demo
node examples/low-stock.mjs
```

```
7 of 12 variants at or below buffer

SKU                Item                                     Avail  Buffer  Incoming  Status
------------------------------------------------------------------------------------------------
FLT-250-ETH        Ethiopia Yirgacheffe / Filter / 250g         0      30         0  OUT OF STOCK
LID-8OZ-BLK        Cup Lid / 8oz / Black                        0     400      2000  on order
GRD-BUR-58         Grinder Burr Set / 58mm                      2       3         0  reorder
SYR-VAN-750        Vanilla Syrup / 750ml                        6      12         0  reorder
SYR-CAR-750        Caramel Syrup / 750ml                       11      12        24  on order
CUP-12OZ-WHT       Takeaway Cup / 12oz / White                 44     500         0  reorder
CUP-8OZ-WHT        Takeaway Cup / 8oz / White                 270     500         0  reorder

5 need a purchase order, 2 already covered by one.
```

Point the same scripts at `https://api.qoblex.com` with a real key and they do the same
thing to your own stock. Nothing else changes.

## The point is that you did not write that script

Each example is what Claude Code produced when asked the question above it, in a directory
holding this repo. That is the workflow: describe the job in the words your business uses,
read the code that comes back.

> Take everything below its buffer, group it by supplier, and draft one purchase order per
> supplier that tops each item back up. Do not approve anything. Default to a dry run.

```
Supplier 401: 3 lines, 302.50
       30  FLT-250-ETH      Ethiopia Yirgacheffe / Filter / 250g
        6  SYR-VAN-750      Vanilla Syrup / 750ml
        1  GRD-BUR-58       Grinder Burr Set / 58mm
   (dry run, nothing created)

Supplier 402: 2 lines, 84.58
      230  CUP-8OZ-WHT      Takeaway Cup / 8oz / White
      456  CUP-12OZ-WHT     Takeaway Cup / 12oz / White
   (dry run, nothing created)
```

| Script | The question it answers |
| --- | --- |
| [`low-stock.mjs`](examples/low-stock.mjs) | What is below its safety buffer, and what is already on order |
| [`expiring-batches.mjs`](examples/expiring-batches.mjs) | Which batches date out soon, what they are worth, and where one came from |
| [`watch-changes.mjs`](examples/watch-changes.mjs) | What changed since the last run, without downloading the catalog |
| [`draft-purchase-orders.mjs`](examples/draft-purchase-orders.mjs) | One draft purchase order per supplier, from the shortfall |

The prompts are in [`examples/README.md`](examples/README.md).

## Start here

| | |
| --- | --- |
| **[AGENTS.md](AGENTS.md)** | **The brief.** Base URL, auth, the rate limit, and the eight mistakes that cost an afternoon. If you read one file, read this one. |
| [docs/conventions.md](docs/conventions.md) | Paging, filtering, sorting, expanding, errors, rate limits |
| [docs/reference/index.md](docs/reference/index.md) | All 197 integration endpoints in one table |
| [docs/reference/envelopes.md](docs/reference/envelopes.md) | Which key holds the records, and how each endpoint pages |
| [skills/qoblex/SKILL.md](skills/qoblex/SKILL.md) | A Claude skill for the API |
| [llms.txt](llms.txt) / [llms-full.txt](llms-full.txt) | The whole thing in the shape a model reads |

Using Claude Code? Copy the skill in and it loads itself when the task needs it:

```bash
mkdir -p .claude/skills && cp -r skills/qoblex .claude/skills/
```

## Four things that cost an afternoon

Checked against the live spec rather than assumed, because none of them is what you would
guess from how REST APIs usually behave. [AGENTS.md](AGENTS.md) has the other four.

- **The rate limit is 30 requests per 60 seconds.** Low enough to shape the code rather than
  handle at the end: a 5,000-product catalog is 100 requests and over three minutes. Filter
  on the server and `expand` instead of looping.
- **Pages are zero-based.** `page=0` is the first one. Starting at `1` silently skips fifty
  records. Three endpoints page some other way entirely, and 11 do not page at all and hand
  back a bare array with no envelope, so `response.users` is `undefined`.
- **Updates are usually `POST /{resource}/{id}`**, not `PUT` or `PATCH`. There is no rule to
  infer, so read the method off the reference. Guessing earns a `405`.
- **Webhooks are not in v1 yet.** [docs/changes.md](docs/changes.md) has the polling pattern
  to use meanwhile, with the field name per resource and a probe that tells you whether a
  given filter is even supported.

## What the API covers

197 endpoints across 30 resource groups: products and variants, stock and adjustments, sale
orders through allocation, picking, packing and dispatch, invoices and payments, purchase
orders through approval, goods receipt, bills and supplier payments, manufacturing orders,
bills of materials and kits, batch and lot traceability with expiry, custom fields, and
reporting.

That is the surface an integration calls. The complete published document, which also
carries the endpoints the Qoblex web app uses to draw its own screens, is at
[api.qoblex.com](https://api.qoblex.com/swagger/v1/swagger.json).

```bash
curl -sS 'https://api.qoblex.com/v1/variants?filters=quantity<10&sort_by=quantity' \
  -H "qoblex-x-api-key: $QOBLEX_API_KEY"
```

## These docs cannot drift

Everything under [`docs/reference/`](docs/reference/) is generated from the OpenAPI document
the API produces for itself, the same one behind the
[interactive reference](https://api.qoblex.com/). Nothing here is transcribed by hand, so
nothing here can quietly stop being true. The document is republished whenever the API
changes, and the copy it was built from is committed at
[`spec/openapi.json`](spec/openapi.json), so you can diff it yourself.

```bash
npm test           # the client's paging, backoff and error handling
```

## Safety

A key carries the permissions of the identity it belongs to, and a key that can `authorize`
can commit stock movements and money. Scoping an agent's key to `view` and `create`, without
`authorize` or `approve`, lets it do useful work without being able to commit anything.

Nothing in `examples/` approves, authorizes, dispatches or pays.

## Getting a key

In Qoblex, open **Integrations**, find the **API** tile, click **Install**, then **Create
API key**. API access is a paid add-on, included on Scale and available on Starter and
Business, and it is fully active during the free trial, so you can build before you buy.
See [pricing](https://qoblex.com/pricing/).

```bash
export QOBLEX_API_KEY='...'
node examples/low-stock.mjs
```

Node 18 or newer. No dependencies, nothing to install.

## What is coming

- **An MCP server**, which will land in this repo.
- **Webhooks**, being designed now. Qoblex is
  [asking which events to build first](mailto:support@qoblex.com?subject=Qoblex%20API%20webhooks),
  so if your integration needs a particular one, saying so counts.

## Also here

- [Interactive API reference](https://api.qoblex.com/): the same endpoints, with a request runner
- [What the API is for](https://qoblex.com/api/): the product page
- [Custom integrations](https://qoblex.com/custom-integrations/): what people build on it

MIT licensed. Issues and pull requests welcome.
