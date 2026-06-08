# typescript

> Express + TypeScript REST API with Prisma and PostgreSQL.

## Requirements

- Nodejs >= 24.x
- PostgreSQL running locally or remotely

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Update environment variables in `/tmp/workspace/pedrozc90/typescript/.env`.

3. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

4. Apply SQL migrations:

   ```bash
   npm run prisma:migrate:deploy
   ```

## Run API

```bash
npm run start
```

## Endpoints

- `POST /users` register user
- `PUT /users` update user
- `GET /users/:id` get user information
- `GET /users` list all users
- `POST /login` login and return `access_token`, `refresh_token`, `expires_at`

## Prisma migrations

- SQL migration files are stored in `/tmp/workspace/pedrozc90/typescript/prisma/migrations`.
- Initial migration creates `users` table with: email, password, inserted_at, updated_at, version, role, last_login_timestamp.

## License

See [LICENSE](./LICENSE) file.
