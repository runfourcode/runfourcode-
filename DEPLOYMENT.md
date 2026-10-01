# Node and PostgreSQL deployment

Inquiry, chat, and website content are stored in PostgreSQL. Firebase Authentication is used for client sign-in only. Admin credentials are verified by the Node server and successful admin sessions use a signed, HttpOnly cookie.

## Required configuration

- `DATABASE_URL`: persistent PostgreSQL connection string. Use TLS for hosted databases.
- `FIREBASE_PROJECT_ID`: the Firebase project used by the browser Authentication client.
- `ADMIN_EMAIL`: the single admin login email.
- `ADMIN_PASSWORD`: admin login password; configure it as a host secret, never in source control.
- `ADMIN_SESSION_SECRET`: random secret of at least 32 characters used to sign 8-hour admin sessions.
- `GEMINI_API_KEY`: optional; required only for the admin AI debugger.
- `TRUST_PROXY=true`: set only when deployed behind a trusted reverse proxy such as Cloud Run.

Run `npm run db:migrate` to create the required tables and indexes from `db/schema.sql`. Keep the database on persistent storage and enable managed backups; container-local files are not a database. Use a schema-owner URL only for migrations; the running API needs only `SELECT`, `INSERT`, and `UPDATE` on application tables, plus `DELETE` on `api_rate_limits` for expiry cleanup.

The example admin email is `ran4code@gmail.com`. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in local `.env` or the production host's secret manager. Generate the session key with `openssl rand -hex 32`. Admin sign-in does not require Firebase Authentication; Firebase remains configured for client Google sign-in.

## Local development

1. Install dependencies with `npm install` and copy `.env.example` to `.env`.
2. Start a local PostgreSQL database, set `DATABASE_URL` to it, then run `npm run db:migrate`.
3. Set `FIREBASE_PROJECT_ID` and the three admin settings. For Firebase Admin SDK credentials used to verify client tokens, use Google Application Default Credentials (`gcloud auth application-default login`) or set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account file kept outside the repository.
4. Run `npm run dev`. The Express server serves Vite and `/api` from the same origin on port 3000.

## Production

Build and run the included Docker image on a Node container host such as Google Cloud Run. Run `npm run db:migrate` once as a release step using `MIGRATION_DATABASE_URL`, then configure the app's restricted `DATABASE_URL` and the other values above in the host's environment/secret manager. Attach persistent PostgreSQL and grant the container Google Application Default Credentials for verifying client Firebase tokens. Set the Cloud Run service port to 8080. Add the deployed hostname to Firebase Authentication's authorized domains.

Static-only hosting such as the previous Netlify setup cannot run these API routes; deploy the container as the application origin instead. Do not expose PostgreSQL credentials in browser variables or commit them to source control.

Existing Firestore documents are not copied automatically. Export and import any records that must be retained before disabling the old database.