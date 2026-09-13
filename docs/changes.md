# Finding out what changed

**Webhooks are announced and are not in v1 yet.** Checked against the live OpenAPI document
on 2026-09-13: there is no endpoint to register a subscription, no event catalogue and no
signature scheme, and the reference's own Webhooks section says they are still being
designed. If you are building today, you are polling. When webhooks ship, this page is
where the migration will be written.

Qoblex is [asking which events to build first](mailto:support@qoblex.com?subject=Qoblex%20API%20webhooks).
If your integration needs a particular one, say so and it counts.

## Poll with a filter, not with a download

The wrong shape, and the one an agent writes by default, is to pull every record each run
and compare against last time. At 50 records a page and 30 requests a minute, that is
minutes of wall clock and your entire rate budget to notice that nothing happened.

The right shape is to ask the server for the records that moved, sorted newest first, and
stop at the first one you have already seen:

```text
GET /v1/products?filters=updated_at>=2026-09-13T00:00:00Z&sort_by=-updated_at&page=0
```

Keep a high-water mark per resource, the timestamp of the newest record you have processed,
and pass it on the next run. Overlap it by a minute or two so a record written during the
previous request is not skipped.

## Which field carries the change

This is per resource, and the names are not consistent. Read the reference page for the
endpoint you are polling before you write the filter:

| Resource | Field to watch | Notes |
| --- | --- | --- |
| `Product` | `updated_at` | |
| `SaleOrder` | `updated_at` | |
| `Quote` | `updated_at` | |
| `PurchaseOrder` | `last_updated_at` on the record, `created_at` documented as filterable | New orders are findable by filter; edits may not be |
| `ProductBatch` | `updated_at` | |

Nine schemas carry an `updated_at` and 25 carry a `created_at`, so most resources give you
something. A resource with neither can only be polled as a full list, and that is a reason
to poll it rarely.

## Confirm the filter before you rely on it

The reference documents the filterable field list for some endpoints and leaves it blank
for others, `GET /v1/sale_orders` among them. A field the endpoint does not support returns
`400 Bad Request` rather than quietly ignoring the filter, which makes a one-request probe a
reliable test:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  'https://api.qoblex.com/v1/sale_orders?filters=updated_at%3E%3D2026-01-01T00:00:00Z' \
  -H "qoblex-x-api-key: $QOBLEX_API_KEY"
```

`200` means the filter is live. `400` means that field is not filterable there and you need
another approach for that resource. Two endpoints will also tell you outright:
`GET /v1/variants/filters` and `GET /v1/reporting/filters`.

Do this once while writing the integration, not on every run.

## How often

One poll per resource per minute is the most a single key can sustain while leaving room
for the work the poll finds. For most inventory work this is comfortably faster than the
business moves, and a five or fifteen minute cycle is usually enough.

If you need to react inside a second, the honest answer today is that v1 cannot do it, and
the thing to do is ask for the webhook.
