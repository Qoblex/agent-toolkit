# Examples

Four working scripts against a real Qoblex account. Zero dependencies, Node 18 or newer.

```bash
export QOBLEX_API_KEY='...'          # Integrations > API > Create API key
node examples/low-stock.mjs
```

Set `QOBLEX_VERBOSE=1` to print every request as it goes out, which is the quickest way to
see the pacing work.

| Script | What it answers |
| --- | --- |
| [`low-stock.mjs`](low-stock.mjs) | What is below its safety buffer, and what is already on order |
| [`expiring-batches.mjs`](expiring-batches.mjs) | Which batches date out soon, how much stock is in them, and where one came from |
| [`watch-changes.mjs`](watch-changes.mjs) | What changed since the last run, without downloading the catalog |
| [`draft-purchase-orders.mjs`](draft-purchase-orders.mjs) | One draft purchase order per supplier, from the shortfall |

They share [`lib/qoblex.mjs`](lib/qoblex.mjs), a small client that paces requests under the
30 per 60 seconds limit, backs off on `429`, pages from zero, and reads the records out of
whichever envelope the endpoint used.

## The point is the prompt

Each of these was written by asking Claude Code, in a directory holding this repo, the
question underneath it. The script is what came back. That is the workflow this repo is for:
point an agent at the docs, describe the job in the words the business uses, read the code
it writes.

**low-stock.mjs**

> Using the Qoblex API docs in this repo, write a script that lists every variant whose
> available stock has fallen below its safety buffer. Available means on hand minus
> allocated. Show what is already incoming on a purchase order so I can see which ones
> actually need ordering.

**expiring-batches.mjs**

> Write a script that finds every batch expiring in the next 60 days that still has stock in
> it, sorted by expiry date, with the value at risk. Add a flag that traces one batch back
> to where it came from and forward to where it went.

**watch-changes.mjs**

> Qoblex has no webhooks yet. Write a poller that finds records changed since the last run,
> keeps a high-water mark between runs, and does not pull the whole catalog each time. Check
> first whether the endpoint actually accepts the filter.

**draft-purchase-orders.mjs**

> Take everything below its buffer, group it by supplier, and draft one purchase order per
> supplier that tops each item back up to the buffer. Do not approve anything. Default to a
> dry run.

## What they will not do

Nothing here approves a purchase order, authorizes an adjustment, dispatches a shipment or
records a payment. Those commit stock and money, and an agent should be asked before it does
any of them. See the note in [`../AGENTS.md`](../AGENTS.md#ask-before-you-authorize) on
scoping a key so it cannot.
