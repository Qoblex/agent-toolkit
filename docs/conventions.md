# Conventions

The rules that hold across the API. Where an endpoint documents its own version of one of
these, the endpoint wins. That happens more than you would like, and the places it happens
are called out below.

## Rate limits: 30 requests per 60 seconds

This is the single most important number in this document, and it is low enough to change
how you write the code rather than something you handle at the end.

The limit is per API key, so one integration can never spend another's capacity, and
sessions in the web app are unaffected. Every response tells you where you stand:

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
```

Going over returns `429` with a `Retry-After` in seconds.

What this means in practice: a catalog of 5,000 products is 100 pages at 50 records a page,
so pulling it costs 100 requests and takes at least three and a half minutes. Plan for that
instead of discovering it.

Three habits that keep you inside the limit:

- **Filter on the server.** `filters=quantity<10` costs one request. Pulling every page and
  filtering in your own code costs a hundred.
- **Expand instead of looping.** One list call with `expand=line_items.product_variant`
  replaces one call per line item. This is where naive code burns its whole budget.
- **Space the calls and back off.** Roughly one request every two seconds keeps you under
  the limit indefinitely. On a `429`, wait `Retry-After` seconds; do not retry immediately.

The client in [`examples/lib/qoblex.mjs`](../examples/lib/qoblex.mjs) does all three.

## Paging, four ways

**The common case: a zero-based `page`.** The first page is `page=0`, not `page=1`. Starting
at 1 skips the first fifty records and reports no error at all. Pages hold up to 50 records.

There are three exceptions, and they are not guessable:

| Shape | Where | How |
| --- | --- | --- |
| `page`, zero-based | 22 endpoints, including all the main collections | `?page=0`, then `1`, `2` |
| `page` + `page_size` | `/v1/activity` | set the size yourself |
| `limit` + `offset` | `/v1/products/{id}/variants` | advance `offset` by the records returned |
| `offset` | `/v1/products/overview` | same, with the size fixed by the server |
| none at all | 11 endpoints | the whole set comes back in one response |

The full table is generated into [reference/envelopes.md](reference/envelopes.md).

**Know when to stop.** List responses carry their totals:

- `filtered_count` is the total after filters, and is the one to page against.
- `count` is the total before filters.
- `total_count` is what `/v1/activity` and the two overview endpoints use instead.
- `has_next_page` appears on the reporting lists and is the direct answer.

Stop when you have seen the total, or when a page comes back shorter than the ones before
it. Do not page on until you get an empty page: that last empty request is a thirtieth of a
minute's budget spent learning nothing.

## The records are not always under the same key

There is no single envelope. Four examples, all different:

```jsonc
GET /v1/products         → { "count": 0, "filtered_count": 0, "products":    [] }
GET /v1/sale_orders      → { "count": 0, "filtered_count": 0, "sale_orders": [] }
GET /v1/purchase_orders  → { "count": 0, "filtered_count": 0, "lines":       [] }
GET /v1/activity         → { "total_count": 0, "prev": null, "next": null, "data": [] }
```

And 11 endpoints have no envelope at all, returning a bare JSON array at the top level.
`GET /v1/users` is one of them, so `response.users` is `undefined` and `response` is already
the list. `/v1/tax_classes`, `/v1/currencies`, `/v1/settings/payment_terms` and
`/v1/account/locations` behave the same way.

Read the shape for the endpoint you are calling from
[reference/envelopes.md](reference/envelopes.md), which is generated from the spec and
covers every list endpoint in v1. Carrying one shape over from another endpoint is the most
common way code that worked yesterday breaks on a new resource today.

## Filtering

Pass `filters` as a comma-separated list of conditions, combined with AND:

```text
GET /v1/products?filters=name@=shirt,quantity>10
```

| Operator | Meaning | | Operator | Meaning |
| --- | --- | --- | --- | --- |
| `==` | equals | | `@=` | contains |
| `!=` | not equals | | `_=` | starts with |
| `>` | greater than | | `_-=` | ends with |
| `<` | less than | | `!@=` | does not contain |
| `>=` | greater than or equal | | `!_=` | does not start with |
| `<=` | less than or equal | | `!_-=` | does not end with |

Append `*` to a string operator for a case-insensitive match: `@=*`, `_=*`, `==*`, `!=*`.
Match any of several values with a pipe: `filters=status==open|packed`. Apply one condition
across several fields by grouping them: `filters=(name|sku)@=shirt`. Escape a comma or pipe
inside a value with a backslash: `filters=name@=blue\,large`.

### There are two filter engines, and they are not compatible

The operators above are one of two dialects in use. Which one an endpoint speaks is a
property of how it was built, and the document does not currently say which is which
(confirmed with the API team, 2026-09-13).

| | Everything above | The second dialect |
| --- | --- | --- |
| String values | bare: `name@=shirt` | double-quoted: `supplier.name@=*"acme"` |
| `\|` means | *any of these values* for one field: `status==open\|packed` | *OR between whole conditions* |
| Endpoints | every other filterable list | the eight below |

The ten on the second dialect. Eight were confirmed against the API source on 2026-09-13;
the two search endpoints added since name their engine in their own description:

```
GET /v1/purchase_orders          GET /v1/manufacturing_orders
GET /v1/sale_orders              GET /v1/tax_classes
GET /v1/suppliers                GET /v1/account/locations
GET /v1/batches                  GET /v1/settings/document_templates
GET /v1/purchase_orders/linkable_orders
GET /v1/sale_orders/linkable_orders
```

Every other filterable list endpoint uses the first dialect, the one the operator table
above describes. If an endpoint documents its own syntax on its reference page, follow that
page.

**The dialect belongs to the endpoint, not to the record.** The clearest case is the sale
order, which two endpoints expose through two different engines, with two different names
for the same timestamp:

| Endpoint | Dialect | Creation timestamp |
| --- | --- | --- |
| `GET /v1/sale_orders` | second | `created_time`, and `created_at` is **not** accepted |
| `GET /v1/quotes` | first | `created_at` |

Both are correct for the endpoint they belong to. So "a sale order filters on `created_at`"
is not a true or false statement until you say which endpoint, and carrying a field name
from one of these to the other is a `400` at best and a silently empty result at worst.

This matters more than a missing field list: a reader who follows the general rules on a
second-dialect endpoint writes a filter that parses, runs, and means something other than
what they wrote.

Check the endpoint's own page before you guess a field name. `updated_at` exists on
`SaleOrder` and `Product`; `PurchaseOrder` calls the same idea `last_updated_at` and
documents `created_at` as the filterable date.

## Sorting

```text
GET /v1/products?sort_by=-created_at,name
```

Comma-separated fields, applied in turn, `-` for descending. Sortable fields are per
endpoint in the same way filterable ones are.

## Expanding

List and retrieve endpoints return lean records and let you pull related data in:

```text
GET /v1/sale_orders?expand=line_items.product_variant,customer
```

Each endpoint documents the values it accepts; an unsupported value is a `400`. Values are
case-insensitive. On a rate-limited API this is not a nicety: it is the difference between
one request and fifty.

## Errors

`2xx` succeeded. `4xx` means the request was wrong given what you sent. `5xx` means Qoblex
broke.

| Status | Meaning |
| --- | --- |
| `200` | Succeeded. |
| `204` | Succeeded, no body. |
| `400` | Malformed, or failed validation. |
| `401` | API key missing or invalid. |
| `402` | Key valid, account not on a plan that includes API access. |
| `403` | Key valid, not permitted to do this. |
| `404` | No such endpoint or record. |
| `405` | Wrong method for this path. See the note below. |
| `422` | Well-formed but could not be processed. |
| `429` | Rate limit exceeded. |
| `500` / `503` | Our side. Retry with backoff. |

Validation failures come back as [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807), naming
each rejected field:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "email": ["The email field is required."] }
}
```

Read `errors` and fix the named field. Do not retry an unchanged `400`.

**A blank "Required" column means unknown, not optional.** Only 6 of the 361 schemas in the
spec declare a `required` list, so the generated reference has almost nothing to put in that
column. Some fields are documented as required in their own description instead:
`billing_location_id` on a purchase order says so in prose and is not in any `required`
array. Treat the validation response as the authority. Send what you believe is a complete
record, read the `errors` object if it comes back `400`, and add what it names.

**An enum value is now the value the API uses, and that is recent.** The enum lists in
these pages come from the OpenAPI document, which is generated from the API's own types.
Until September 2026 that generation mangled the names on the way out, so the document
published values the API had never accepted. It was fixed wholesale: the document now
publishes the wire spelling, and where legacy spellings are still taken the endpoint says so
outright, as `POST /v1/purchase_orders` does for its `type`.

Two conventions coexist in the result, which is untidy rather than wrong. Most enums are
`PascalCase` (`RegularPO`, `AwaitingStock`, `GoodsReceiptNote`); a handful are snake_case
(`ProductVariant.type` is `simple`, `bundle`, `bill_of_material`, and the reporting
`report_type` values are `stock_on_hand`, `inventory_reorder` and so on). Copy the spelling
from the endpoint you are calling rather than converting it to the one you saw last.

If a value is ever refused, a value you have seen the API **return** is the one to trust.
That was the whole rule while the document could not be relied on, and it is still the
cheapest way to settle a disagreement.

### If you created freight purchase orders before September 2026, check them

`POST /v1/purchase_orders` takes a `type`, and the reference used to document two values for
it, `Regular Order` and `Freight Order`. Neither was accepted. Both were parsed against
identifiers containing no spaces, so both failed to match and fell through to the
regular-order default, returning `200` with no warning.

This is fixed. `type` now publishes `RegularPO`, `FreightPO` and `DropShipPo`, the legacy
spellings with spaces are accepted as well, and an unrecognised value is rejected rather
than quietly becoming a regular order.

The bug is gone; its output is not. **Purchase orders raised through the API as freight
before this shipped are regular orders in your data**, and nothing ever raised an error to
say so. If you run an integration that creates freight POs, it is worth checking what type
they actually carry.

**On `405`: updates are often `POST`, not `PUT` or `PATCH`.** `POST /v1/products/{id}` is
Update Product. `POST /v1/sale_orders/{id}` is Update Sale Order. `POST
/v1/manufacturing_orders/{id}` is Update Order. Some resources do use `PUT` or `PATCH`, for
example `PUT /v1/account` and `PATCH` on a draft bill. There is no rule to infer here, so
read the method off the reference rather than assuming REST convention.

## Dates

[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) everywhere, for example
`2026-09-13T10:53:43-08:00`. URL-encode any date passed as a query parameter.

## Versioning

The version is in the path, and this is `v1`. Additive changes ship without a new version,
so build to tolerate them: read fields by name, ignore fields you do not recognise, do not
depend on field order, and expect new enum values. A breaking change ships as `/v2` with
`v1` still running.
