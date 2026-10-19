# AG Store backend

Use Node.js **26.12.0** (Current). `.nvmrc`, `.node-version`, and `package.json` specify Node 26. With fnm, run `fnm install` and `fnm use` in this directory.

```sh
npm ci
npm run dev
```

The API listens on port **5000** by default. Configure `MONGO_URI` and `JWT_SECRET` in `.env`; set `PORT` to change the API port. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` enable Google OAuth; `EMAIL_USER` and `EMAIL_PASS` enable order emails. Set `FRONTEND_URL` for another frontend origin and the OAuth redirect URL.

```sh
npm run typecheck
npm test
npm run build
npm start
```

All application sources use TypeScript with strict checking and Node ESM resolution. Local imports ending in `.js` resolve to `.ts` during development and to compiled JavaScript in `dist/` in production. `tsx` runs development and seeding scripts; production runs compiled output with Node.

`npm test` uses an ephemeral HTTP server and validates runtime compatibility without connecting to MongoDB or sending email. Database and external provider integration require their configured services.

`npm run data:import` replaces database contents with seed data. `npm run data:destroy` deletes database contents. Run these only against the intended database.

`npm run data:collections -- --dry-run` validates the Accessories, Backpacks, and Clothing catalog (ten products each). `npm run data:collections` adds missing entries without changing existing products, inventory, users, or orders. It verifies that `MONGO_URI` matches the catalog exposed by `DEPLOYED_API_URL` (defaults to the Render API). Product images remain external URLs; no image files are uploaded. Redeploy the backend to enable the new categories and image URL fields in the admin create/edit API.

For deployments, install development dependencies during the build, run `npm run build`, and use `npm start`. `vercel.json` points to the TypeScript server handler. Uploads remain in `backend/uploads/`; they are served from the same directory in source and compiled runs.

`node_modules/`, `dist/`, and `.env` are ignored. Recreate installed dependencies using `npm ci`.

## API performance

Product and category reads use bounded JSON caches with concurrent request coalescing, ETags, and response compression. Product responses expire after 15 seconds; category responses after 60 seconds. Product/order mutations invalidate product responses, and category mutations invalidate category responses. These caches are per API process; external database changes and other instances are reflected after the TTL. Account and order responses are private and are not shared-cached.

The homepage endpoint returns only the displayed `children`, `accessories`, `backpacks`, `clothing`, and `sale` cards, with independent indexed queries run in parallel. Product list routes accept optional `page` and `limit` query parameters (limit 1–100); responses remain arrays. Product detail responses include descriptions and galleries, while homepage cards omit them. Lean reads preserve legacy single-category products explicitly.

Run `npm run db:indexes` to add the declared product, order, and category indexes without dropping existing indexes. Run `npm run benchmark:api` to measure public endpoints; set `BENCHMARK_API_URL` for a deployed API or `BENCHMARK_SAMPLES` to change the sample count. [Measured results and limitations](performance/README.md) include both cache misses and warm requests. Deploy the backend and frontend together because the homepage response changed.

## Render deployment

The root `render.yaml` manages the existing `ag-store-ecommerce-backend` service as a Blueprint. It pins the Free plan and Singapore region, builds with `npm ci --include=dev && npm run build`, starts with `npm start`, checks `/`, and automatically deploys every commit pushed to `main`. Render supplies `PORT`; do not set a fixed port.

Configure `NODE_ENV=production`, `MONGO_URI`, and `JWT_SECRET` in Render's environment settings. Add the Google OAuth and email settings only if those integrations are needed, and set `FRONTEND_URL` to the deployed frontend origin. Never commit `.env`.

Free services sleep after 15 minutes without traffic. Uploaded files are temporary and disappear when the service restarts, redeploys, or sleeps; existing images committed in `backend/uploads/` are restored from Git. Render Free blocks SMTP ports, so the current SMTP email integration needs an HTTPS email provider to work there. No paid disk or database is required for this deployment; it uses the MongoDB URI configured in the environment.
