# Momentum

Momentum is a mobile diary for reflecting on postponed tasks and choosing one small next step. The project includes an Expo app in `apps/mobile` and a TypeScript Express API in `apps/api`.

## Run locally

Install Node.js 24 and run `npm ci` from the repository root.

**Mobile:** Run `npm run dev:mobile` with your phone and computer on the same Wi-Fi network. Scan the QR code in Expo Go on Android or with Camera on iOS. Follow the phone test steps below to connect the app to the local API. If Expo Go reports a version mismatch, select SDK 58 on the [Expo Go download page](https://expo.dev/go) and follow the steps for your device.

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

## Private owner account

Set `BETTER_AUTH_SECRET` in `.env` to a random value. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. If you change the API address or port, set `BETTER_AUTH_URL` to the API origin that clients use.

After running the migrations, run `npm run auth:create-owner` from the repository root. Enter the owner's email, a username, and a password of at least 15 characters. The terminal masks the password and asks you to confirm it. Usernames are case insensitive and support 3 to 30 letters, numbers, underscores, or periods.

If you created an owner before username support, rerun the command after applying the migrations. Enter the owner's existing email and choose a username. You can use the same password to sign in.

Start the API with `npm run dev:api`. It accepts `POST /api/auth/sign-in/username` with `username` and `password`, `GET /api/auth/get-session`, and `POST /api/auth/sign-out`. Send the session cookie on later requests. `GET /api/me` returns the signed-in owner's `id`, `email`, and `username` or HTTP `401` without a valid session. Owner creation runs through the terminal command, and the API disables registration.

## Test sign-in on your phone

Start PostgreSQL and set up your private owner as described above. For this local test, use a fictional account and keep your phone and computer on the same Wi-Fi network. Find your computer's Wi-Fi IPv4 address with `ipconfig`. In the examples below, replace `192.168.1.23` with that address.

In the API terminal, stop the previous API process if it is running, then run:

```powershell
$momentumIp = '192.168.1.23'
$env:HOST = '0.0.0.0'
$env:BETTER_AUTH_URL = "http://${momentumIp}:3001"
$env:MOMENTUM_EXPO_ORIGIN = "exp://${momentumIp}:8081"
npm.cmd run dev:api
```

Save the API addresses once in `apps/mobile/.env.development.local`. Use your Azure Container App's HTTPS URL if you also test against Azure.

```dotenv
MOMENTUM_LOCAL_API_URL=http://192.168.1.23:3001
MOMENTUM_AZURE_API_URL=https://your-api.azurecontainerapps.io
```

Start the local mobile preview in a separate terminal.

```powershell
npm.cmd run dev:mobile:local -- --lan --port 8081
```

To use Azure, stop Expo with Ctrl+C and run `npm.cmd run dev:mobile:azure`. To switch back, stop Expo and run the local command again. Expo prints the selected API address at startup.

Open the API's `/health` URL in your phone's browser to check connectivity, then scan the Expo Go QR code. If Metro uses a different port, update `MOMENTUM_EXPO_ORIGIN` to match the `exp://` address printed by Metro and restart the API.

1. Try a wrong password. The app should stay on Sign in and show an error.
2. Sign in with the owner username and password. The app should greet you by username.
3. Close and reopen the app. It should restore the session and confirm it with the API.
4. Sign out, then reopen the app. It should show the sign-in form.

The mobile app stores the session cookie in Expo SecureStore. The API address is public configuration. Keep authentication secrets in the root `.env`, and use an HTTPS API address for release builds.


## Deploy the API to Azure

From the repository root, build the API image with `docker build -t momentum-api .`. It listens on port `3001`. In Azure Container Apps, use external HTTPS ingress with target port `3001` and put the environment on `container-apps-subnet` in `momentum-vnet`. This allows the API to reach the private PostgreSQL server.

| Setting | Value |
| --- | --- |
| `POSTGRES_HOST` | `momentum.postgres.database.azure.com` |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_USER` | The PostgreSQL role used for the pilot database |
| `POSTGRES_PASSWORD` | Container Apps secret reference for the role password |
| `BETTER_AUTH_SECRET` | Container Apps secret reference for a separate random auth secret |
| `BETTER_AUTH_URL` | The API's public `https://` origin |

The API uses the `momentum` database. It verifies the TLS certificate for remote PostgreSQL connections. Local commands use `127.0.0.1:5433` and the `momentum` database user by default.

From a container shell in that environment, run `npm run db:migrate`, then `npm run auth:create-owner` and enter the pilot login interactively. Verify the HTTPS `/health` response before pointing the Android build's `EXPO_PUBLIC_API_URL` at the API origin.

## Check changes

Run `npm run typecheck` for both apps, `npm run build:api` to compile the API, and `npm run build:mobile` to export Android and iOS bundles.
