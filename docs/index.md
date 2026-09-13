# Qoblex API v1

Qoblex is the inventory, order and production system behind [go.qoblex.com](https://go.qoblex.com).
The v1 API gives your own code the operations your team uses on screen: products and stock,
sale orders, shipments, purchasing, goods receipts, bills, manufacturing, batches and reporting.

- **Base URL** `https://api.qoblex.com`, every path under `/v1`.
- **Auth** one header, `qoblex-x-api-key`. See [authentication](authentication.md).
- **Shape** REST, JSON in and JSON out, standard verbs and status codes.
- **Size** 197 operations over 156 paths in 30 resource groups.
- **Machine-readable** the OpenAPI 3.0.1 document is at
  [`/swagger/v1/swagger.json`](https://api.qoblex.com/swagger/v1/swagger.json), and a copy
  is committed here at [`spec/openapi.json`](../spec/openapi.json).

## Read these first

| | |
| --- | --- |
| [authentication.md](authentication.md) | Getting a key, sending it, and the two ways it fails |
| [conventions.md](conventions.md) | Paging, filtering, sorting, expanding, errors, rate limits |
| [changes.md](changes.md) | Finding out what changed, while webhooks are still to come |
| [reference/index.md](reference/index.md) | Every endpoint, one table |
| [reference/envelopes.md](reference/envelopes.md) | Which key holds the records, per list endpoint |

## The resource groups

Everything under [`reference/`](reference/) is generated from the OpenAPI document, one file
per group. Start from the group, not the endpoint: the group description says what the
records mean, which is the part a list of paths cannot tell you.

The human-browsable version, with a request runner, is at
[api.qoblex.com](https://api.qoblex.com/).

## Scope

This documents the endpoints an integration calls. The complete published document, which
also carries what the Qoblex web app uses to draw its own screens, is at
[api.qoblex.com](https://api.qoblex.com/swagger/v1/swagger.json).
