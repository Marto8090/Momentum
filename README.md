# Momentum

Momentum is a mobile diary for reflecting on postponed tasks and choosing one small next step. The project includes an Expo app in `apps/mobile` and a TypeScript Express API in `apps/api`.

## Run locally

Install Node.js 24 and run `npm ci` from the repository root.

**Mobile:** Run `npm run dev:mobile` with your phone and computer on the same Wi-Fi network. Scan the QR code in Expo Go on Android or with Camera on iOS. The app should display the Momentum welcome screen. If Expo Go reports a version mismatch, select SDK 58 on the [Expo Go download page](https://expo.dev/go) and follow the steps for your device.

**API:** In a separate terminal, run `npm run dev:api` and open [http://127.0.0.1:3001/](http://127.0.0.1:3001/). The response should be `{"name":"Momentum API"}`. Set `PORT` in the terminal environment if port 3001 is already in use.

## Local PostgreSQL

Start Docker Desktop. From the repository root, run `Copy-Item .env.example .env` the first time you set up the database. Open `.env` and set `POSTGRES_PASSWORD` to a password for local development. Git ignores this file.

```powershell
docker compose up -d --wait db
docker compose exec db psql -U momentum -d momentum -c "SELECT current_database();"
```

PostgreSQL listens on `127.0.0.1:5433` by default. The database and user are both `momentum`. If the port is in use, change `POSTGRES_PORT` in `.env`. Use `docker compose down` to stop and remove the container. The named volume keeps your data for the next start.

## Database migrations and API health

With the database running, apply the account and diary migrations from the repository root:

```powershell
npm run db:migrate
```

Run this command again whenever you pull a new migration. PostgreSQL records which SQL files ran. Add a new numbered file in `apps/api/migrations` for later changes so existing databases can apply them in order.

Start the API with `npm run dev:api` and open [http://127.0.0.1:3001/health](http://127.0.0.1:3001/health). It returns HTTP `200` with `{"status":"ok","database":"up"}` when PostgreSQL responds and `503` when the connection fails. The API and migration command read `POSTGRES_PASSWORD` and `POSTGRES_PORT` from the repository’s `.env`.

## Check changes

Run `npm run typecheck` for both apps, `npm run build:api` to compile the API, and `npm run build:mobile` to export Android and iOS bundles.
