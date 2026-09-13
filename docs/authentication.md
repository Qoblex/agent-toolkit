# Authentication

Every request carries one header:

```http
qoblex-x-api-key: your_api_key
```

That is the whole scheme. There is no OAuth flow, no token exchange and no expiry to
refresh. All requests must be HTTPS.

## Getting a key

1. Sign in at [go.qoblex.com](https://go.qoblex.com).
2. Open **Integrations** and find the **API** tile.
3. Click **Install**, then **Create API key**.
4. Copy the key. It is shown to you, not stored for you to read again.

Revoke a key from the same screen, or click **Disconnect** to revoke every key at once and
switch the integration off.

API access is a paid add-on, included on Scale and available on Starter and Business. It is
fully active during the free trial, so you can build against it before you buy anything.
The plans are on the [pricing page](https://qoblex.com/pricing/).

## Two ways it fails, and one of them misleads you

**`401 Unauthorized`** means the key is missing, wrong or revoked. The response to a
missing key carries `WWW-Authenticate: Bearer`, which is the framework's default and not a
description of this API. Do not read it as an instruction. `Authorization: Bearer <key>`
is not accepted and never has been; the header is `qoblex-x-api-key` and nothing else.

**`402 Payment Required`** means the key is good but the account is not on a plan that
includes API access. A human has to change the plan. Retrying will not clear it, and nor
will a different key from the same account.

## Scopes

A key inherits the permissions of the integration or team member it belongs to. A scope
pairs a resource with an action, so it reads as "view sales orders" or "approve purchase
orders":

- **Resources** are grouped by area, for example `sales/orders`, `inventory/products`,
  `stock_control/purchase_orders`, `contacts/customers`, `reporting/sales`,
  `manufacturing`, `users` and `integrations`.
- **Actions** are `view`, `create`, `edit`, `delete`, `authorize` and `approve`.

Grant a key only the scopes it needs. A key that is allowed to `authorize` can commit stock
movements and money, which is not something an agent should hold by default.

Enforcement is being switched on area by area as each part of the product moves to the new
experience. Scopes you set today are respected by each endpoint as it comes online, so
configure them now rather than later.

## Keeping the key out of the transcript

An agent reads and writes files, and its conversation is often stored. Put the key in the
environment, never in a prompt, a committed file or an inline example:

```bash
export QOBLEX_API_KEY='...'
curl -sS 'https://api.qoblex.com/v1/users/me' -H "qoblex-x-api-key: $QOBLEX_API_KEY"
```

`GET /v1/users/me` is the cheapest way to check a key works. It returns the identity the
key belongs to, which is also how you confirm you are pointed at the account you meant.
