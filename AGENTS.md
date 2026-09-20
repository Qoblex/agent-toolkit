# Qoblex API: a brief for coding agents

You are working against the Qoblex API v1. Qoblex is an inventory, order and production
system. This file is the short version: enough to write correct code without reading 201
endpoint definitions first. The long version is in [`docs/`](docs/).

```
Base URL   https://api.qoblex.com      every path under /v1
Auth       qoblex-x-api-key: <key>     one header, no OAuth, no expiry
Limit      30 requests / 60 seconds    per key
Paging     page=0 is the first page    up to 50 records
Spec       spec/openapi.json           OpenAPI 3.0.1, 201 operations
```

Check a key with `GET /v1/account`. It names the account, so it tells you which one you are
pointed at. Not `GET /v1/users/me`, which answers `404` for an integration key that has no
user behind it, and reads as a broken key when it is not.

## Eight things to get right

These are the mistakes that cost an afternoon. Each is checked against the live spec, not
inferred from how APIs usually work.

1. **The rate limit is 30 requests per 60 seconds.** Low enough to design around rather
   than handle at the end. Filter on the server, `expand` instead of looping, and pace at
   roughly one request every two seconds. A 5,000-product catalog is 100 requests and over
   three minutes of wall clock. Use the client in
   [`examples/lib/qoblex.mjs`](examples/lib/qoblex.mjs), which paces and backs off for you.

2. **Pages are zero-based, where an endpoint pages at all.** The first page is `page=0`;
   starting at `page=1` skips the first fifty records and reports no error. Three endpoints
   page some other way (`limit`/`offset` on `/v1/products/{id}/variants`, `offset` on
   `/v1/products/overview`, `page_size` on `/v1/activity`), and 11 do not page at all.

3. **The records are not under the same key on every endpoint.** `products` on
   `/v1/products`, `sale_orders` on `/v1/sale_orders`, `lines` on `/v1/purchase_orders`,
   `data` on `/v1/activity`, and no key at all on the 11 that return a bare array, where
   `GET /v1/users` gives you the list itself rather than `{ users: [...] }`. Look the
   endpoint up in [`docs/reference/envelopes.md`](docs/reference/envelopes.md) rather than
   reusing the shape from the last one you called.

4. **Updates are usually `POST`, not `PUT` or `PATCH`.** `POST /v1/products/{id}` is Update
   Product. `POST /v1/sale_orders/{id}` is Update Sale Order. A few resources do use `PUT`
   or `PATCH`. There is no rule to infer, so read the method off the reference; guessing
   gets you a `405`.

5. **There are two filtering systems, then two syntaxes inside one of them.** The four
   `/v1/reporting/` endpoints take `dim_filters` and `fact_filters` against a reporting
   model, with field names from the report's row schema. The other 20 list endpoints take
   `filters` against their own fields. No endpoint takes both, and a name from one is
   meaningless in the other. Within `filters`, the syntax splits again:
   `filters=name@=shirt,quantity>10`, where `@=` is contains, `_=` is starts with, and a
   trailing `*` makes a string match case-insensitive. `?name=shirt` does nothing. A second
   dialect is in use on ten endpoints (`purchase_orders`, `sale_orders`, `suppliers`,
   `batches`, `manufacturing_orders`, `tax_classes`, `account/locations`,
   `settings/document_templates`, and the two `linkable_orders` searches): there, string
   values are double-quoted
   (`supplier.name@=*"acme"`) and `|` is OR between whole conditions rather than between
   values for one field. The document itself does not say which endpoint speaks which. See
   [`docs/conventions.md`](docs/conventions.md#there-are-two-filter-engines-and-they-are-not-compatible).

6. **`Authorization: Bearer` is not accepted.** The header is `qoblex-x-api-key`. A request
   with no key comes back carrying `WWW-Authenticate: Bearer`, which is the framework's
   default response and not a description of this API. Ignore it.

7. **Almost nothing is marked required, and that is a gap in the spec rather than a fact
   about the API.** 6 of 361 schemas declare a `required` list. A field can be mandatory and
   say so only in its own description, as `billing_location_id` does on a purchase order.
   Send the record you believe is complete, then read the `errors` object on a `400`: it
   names each rejected field and why. That is the authority, not the column.

8. **Webhooks are not in v1 yet** (checked 2026-09-13). Poll with a filter on `updated_at`
   and a high-water mark. [`docs/changes.md`](docs/changes.md) has the pattern, the field
   name per resource, and the one-request probe that tells you whether a given filter is
   supported.

## Ask before you authorize

An API key carries the permissions of the identity it belongs to, and some endpoints commit
stock movements and money that a person would normally approve on screen. Treat these as
actions to confirm with the user, not steps to take because they were the next call:

- `POST /v1/adjustments/{id}/authorize` writes the inventory ledger.
- `POST /v1/purchase_orders/{id}/approve` and `/receive` commit a purchase and its stock.
- `POST .../bills/{bill_id}/authorize`, `.../payments` and the refund and return
  `authorize` endpoints move money.
- `POST /v1/sale_orders/{id}/shipments/{shipment_id}/dispatch` tells the business the goods
  have gone.
- `DELETE` on any resource. Several are soft deletes, but not all, and the reference does
  not always say which.

Reading is safe. Drafting is usually safe, because a draft is visible on screen before
anyone acts on it. Authorizing is not. When scoping a key for an agent, granting `view` and
`create` without `authorize` or `approve` is the arrangement that lets it do useful work
without being able to commit anything.

## Where to start for a given job

| The job | Start here |
| --- | --- |
| What is low, what should we reorder | `GET /v1/reporting/forecasting`, `GET /v1/reporting/inventory` |
| Stock on hand, by location | `GET /v1/variants/{id}/inventory`, `GET /v1/variants?expand=locations` |
| Catalog sync out | `GET /v1/products?expand=variants` |
| Push an order in | `POST /v1/sale_orders`, then `/allocate`, `/shipments`, `/dispatch` |
| Raise purchasing | `POST /v1/purchase_orders`, or `/bulk/csv` for a file, then `/approve` |
| Receive a delivery | `POST /v1/purchase_orders/{id}/goods_receipt_notes` then `/authorize` |
| Supplier invoice and payment | `POST .../bills`, `/authorize`, `.../payments` |
| Stocktake | `POST /v1/adjustments/stocktake/csv`, `/reconcile`, `/authorize` |
| Expiry, recall, traceability | `GET /v1/batches`, `GET /v1/batches/{id}/trace` |
| Production | `POST /v1/manufacturing_orders`, `/start`, `/complete` |
| Bundles and kits | `POST /v1/variants/{id}/composition` |
| Sales and margin figures | `GET /v1/reporting/sales`, `GET /v1/reporting/purchases` |
| Stock as it stood in a past period | `GET /v1/reporting/inventory?report_type=stock_movement`, reading `closing_balance` by `record_date` |
| What to reorder, in one row per variant | `GET /v1/reporting/inventory?report_type=inventory_reorder` |
| Outstanding POs by supplier | `GET /v1/purchase_orders/open_purchases` |
| Raise POs for a set of sale orders | `GET /v1/sale_orders/preview_purchase_orders`, then `POST /v1/sale_orders/create_purchase_orders` |
| Drop-ship, freight or regular POs | `GET /v1/purchase_orders?filters=type=="DropShipPo"` |
| Find an order to link by number or contact | `GET /v1/{sale,purchase}_orders/linkable_orders` |
| Bulk price list import or export | `POST /v1/price_lists/csv`, `POST /v1/price_lists/export` |
| Channel listing mapping | `GET /v1/variants/external_links`, `/v1/products/{id}/external_links` |

Full table: [`docs/reference/index.md`](docs/reference/index.md). The reporting endpoints
carry most of the analytical questions and are the least self-describing part of the API:
[`docs/reporting.md`](docs/reporting.md) is the guide to them.

These are the endpoints an integration calls. The complete published document, which also
carries what the Qoblex web app uses to draw its own screens, is at
[api.qoblex.com](https://api.qoblex.com/swagger/v1/swagger.json).

## Conventions in this repo

- Everything under `docs/reference/` is generated from `spec/openapi.json`. Do not edit it
  by hand: it is rebuilt whenever the API changes and your edit will be overwritten.
- `docs/*.md` and this file are written by hand and are where judgement lives.
- Examples are zero-dependency Node and run with `node`. They read `QOBLEX_API_KEY` from
  the environment and never take a key as an argument.
- Do not commit an API key, a response body from a real account, or a customer name.
- `npm test` exercises the client's paging against a stub of all four response shapes, plus
  the rate-limit backoff and the validation-error path.
