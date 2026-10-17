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

For deployments, install development dependencies during the build, run `npm run build`, and use `npm start`. `vercel.json` points to the TypeScript server handler. Uploads remain in `backend/uploads/`; they are served from the same directory in source and compiled runs.

`node_modules/`, `dist/`, and `.env` are ignored. Recreate installed dependencies using `npm ci`.

## Render deployment

The root `render.yaml` manages the existing `ag-store-ecommerce-backend` service as a Blueprint. It pins the Free plan and Singapore region, builds with `npm ci --include=dev && npm run build`, starts with `npm start`, checks `/`, and automatically deploys every commit pushed to `main`. Render supplies `PORT`; do not set a fixed port.

Configure `NODE_ENV=production`, `MONGO_URI`, and `JWT_SECRET` in Render's environment settings. Add the Google OAuth and email settings only if those integrations are needed, and set `FRONTEND_URL` to the deployed frontend origin. Never commit `.env`.

Free services sleep after 15 minutes without traffic. Uploaded files are temporary and disappear when the service restarts, redeploys, or sleeps; existing images committed in `backend/uploads/` are restored from Git. Render Free blocks SMTP ports, so the current SMTP email integration needs an HTTPS email provider to work there. No paid disk or database is required for this deployment; it uses the MongoDB URI configured in the environment.
