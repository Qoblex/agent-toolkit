---
name: qoblex
description: Read and change inventory, stock, orders, purchasing, shipments, batches and production in Qoblex through its v1 REST API. Use when the task involves Qoblex, or asks about stock levels, what to reorder, low stock, sale orders, purchase orders, suppliers, goods receipts, bills, shipments, stocktakes, batch or lot expiry and traceability, manufacturing orders, bundles, or syncing a catalog to or from an inventory system.
---

# Qoblex API v1

Qoblex is an inventory, order and production system. This skill covers its v1 REST API:
201 endpoints, the surface an integration calls.

## Before the first call

The key lives in `QOBLEX_API_KEY`. If it is not set, stop and ask for it; do not look for it
in files. A user who has not made one gets it from Qoblex under **Integrations > API >
Create API key**, and API access is a paid add-on that is active during the free trial.

Confirm which account you are on before doing anything that writes:

```bash
curl -sS 'https://api.qoblex.com/v1/account' -H "qoblex-x-api-key: $QOBLEX_API_KEY"
```

Not `/v1/users/me`: an integration key has no user behind it and gets a `404`, which looks
like a bad key and is not.

## The rules that bite

```
Base URL   https://api.qoblex.com, every path under /v1
Auth       qoblex-x-api-key: <key>     not Authorization: Bearer, whatever the 401 says
Limit      30 requests / 60 seconds    pace at one every two seconds
Paging     page=0 is the first page    50 records, and four endpoints page differently
Updates    usually POST /{resource}/{id}, not PUT or PATCH
Filters    ?filters=name@=shirt,quantity>10    not ?name=shirt
Webhooks   not in v1 yet; poll on updated_at
```

The records come back under a different key per endpoint (`products`, `sale_orders`,
`lines`, `data`), and 11 endpoints return a bare array with no envelope at all.

## Working method

1. **Look the endpoint up before calling it.** `docs/reference/index.md` is every operation
   in one table; `docs/reference/<group>.md` has the parameters, body and response. Do not
   infer a path from another API.
2. **Filter and expand on the server.** The rate limit makes "pull everything and filter
   here" fail rather than merely be slow. One list call with `expand=` beats fifty
   retrieves.
3. **Read the `400`.** Validation failures name each rejected field in an `errors` object.
   Only 6 of 361 schemas declare their required fields, so the error is the specification.
4. **Never print or log the key**, and never write it into a file you create.

## Ask before committing anything

Reading is safe. Creating a draft is usually safe, because a person sees it before acting on
it. These are not, and want explicit confirmation each time:

- `POST /v1/adjustments/{id}/authorize` writes the inventory ledger
- `POST /v1/purchase_orders/{id}/approve` and `/receive` commit a purchase and its stock
- `POST .../bills/{id}/authorize`, `.../payments` and the refund and return authorizations move money
- `POST /v1/sale_orders/{id}/shipments/{id}/dispatch` says the goods have gone
- any `DELETE`

## Where to start for a given job

| The job | Start here |
| --- | --- |
| Low stock, what to reorder | `GET /v1/variants`, comparing `quantity` less `allocated_quantity` against `buffer_quantity`, then checking `incoming_quantity` |
| Stock by location | `GET /v1/variants/{id}/inventory`, or `GET /v1/variants?expand=locations` |
| Catalog out | `GET /v1/products?expand=variants` |
| Order in | `POST /v1/sale_orders`, then `/allocate`, `/shipments`, `/dispatch` |
| Purchasing | `POST /v1/purchase_orders` (`type`: `RegularPO`, `FreightPO`, `DropShipPo`), or `/bulk/csv`, then `/approve` |
| Receiving | `POST /v1/purchase_orders/{id}/goods_receipt_notes`, then `/authorize` |
| Supplier invoices | `POST .../bills`, `/authorize`, `.../payments` |
| Stocktake | `POST /v1/adjustments/stocktake/csv`, `/reconcile`, `/authorize` |
| Expiry and recall | `GET /v1/batches?filters=expires_at<=...`, `GET /v1/batches/{id}/trace` |
| Production | `POST /v1/manufacturing_orders`, `/start`, `/complete` |
| Bundles and kits | `POST /v1/variants/{id}/composition` |
| Reporting | `GET /v1/reporting/{sales,purchases,inventory,forecasting}` |

## Reference

- `docs/reference/index.md`: all 201 endpoints
- `docs/reference/envelopes.md`: the response key and paging style per list endpoint
- `docs/conventions.md`: paging, filtering, expanding, errors, rate limits
- `docs/changes.md`: polling until webhooks ship
- `examples/lib/qoblex.mjs`: a client that handles the pacing and paging already
- `spec/openapi.json`: the OpenAPI document, for any schema not in the tables
