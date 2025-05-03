# pdf-to-png-worker

## Setup

1. `bun install`
2. On Cloudflare, create bucket in R2 named `temp-pdf-to-png-worker`. Add a PDF named `example.pdf` to the bucket.
3. On Cloudflare, create a new worker, choose Hello World.
4. `bun run build && bun run deploy`
5. Start viewing logs: `wrangler tail`
6. Visit your worker URL.
