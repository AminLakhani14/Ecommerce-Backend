# API performance verification

Measured on 19 October 2026 against the local API connected to the configured remote MongoDB database. These are API timings, not total page or image loading times.

| Endpoint | Before: median of 5 requests | After: cache miss | After: warm median | Warm p95 |
| --- | ---: | ---: | ---: | ---: |
| `/api/products/homepage` | 2746 ms | 403.09 ms | 2.04 ms | 3.44 ms |
| `/api/products` | 495 ms | 529.81 ms | 1.71 ms | 2.18 ms |
| `/api/products/category/accessories` | 271 ms | 270.36 ms | 1.92 ms | 3.74 ms |
| `/api/products/filter/Accessories/Sunglasses` | 310 ms | 283.73 ms | 1.83 ms | 2.90 ms |
| `/api/products/sale` | 300 ms | 246.29 ms | 1.93 ms | 2.86 ms |
| `/api/categories` | 256 ms | Already cached | 0.56 ms | 2.64 ms |

The after run made 10 requests per endpoint; its warm statistics include only responses marked `X-Cache: HIT`. Cache misses include the remote database round trip. The categories endpoint was already cached by the live verification. Small sample sizes and network variation limit comparisons of individual uncached requests.

## Homepage work and payload

- Replaced five serial queries with five parallel, indexed queries, capped at the displayed card counts.
- Removed the separate full-catalog request and unused Men/Women homepage queries.
- Homepage product JSON fell from 35,983 bytes across two requests to 5,879 bytes in one request (84% less JSON).
- Static homepage sections render while product data is loading.

- `/api/products/homepage`: 5,879 JSON bytes; 949 bytes transferred as gzip (body only).
- `/api/products`: 22,965 JSON bytes; 2,346 bytes transferred as gzip (body only).

## Correctness checks

- Category, category/subcategory, and sale lookups used index scans with no blocking sort; the sampled limited queries examined five documents for five results.
- Automated tests verify cache expiry, memory limits, concurrent miss sharing, invalidation during an in-flight read, ETags, gzip, pagination, legacy category compatibility, and batched checkout inventory validation.
- Live database verification confirmed multi-category matching, cached reads, immediate update/delete invalidation, category removal, and ten concurrent requests sharing one initial cache load. Temporary verification records were removed.

## Cache and deployment limits

Product JSON is cached for 15 seconds and category JSON for 60 seconds in each API process, with a 200-entry / 16 MiB limit. Successful product/order writes invalidate product responses; category writes invalidate category responses. Checkout invalidates inventory immediately after its database write, including partial write failures. Old in-flight reads cannot overwrite fresh cache entries. Browser copies revalidate with ETags. User and order responses are private and never enter this shared cache.

The caches are per process. Other instances or external database writers become visible when the short TTL expires. The product list still accepts legacy unpaginated requests; list endpoints support optional `?page=1&limit=24` (maximum 100 per page).

The local indexes have been created. For deployment, run `npm run db:indexes` against the intended database, build/redeploy both applications, and repeat `npm run benchmark:api` with `BENCHMARK_API_URL` set to the deployed API. No deployment or hosting-plan changes were made.

Render Free services sleep after 15 idle minutes, and the next startup can take about a minute; application caching cannot provide millisecond responses while the service is asleep. An always-on instance and a nearby database are needed for predictable first requests. [Render documentation](https://render.com/docs/free)

Raw data: [before.json](before.json), [after.json](after.json), [transfer.json](transfer.json).
