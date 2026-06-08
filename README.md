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

2. Update environment variables in `.env`.

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
- `role` and `profile` are both accepted in `POST /users` and `PUT /users`; `role` takes precedence when both are provided.

## Prisma migrations

- SQL migration files are stored in `prisma/migrations`.
- Initial migration creates `users` table with: email, password, inserted_at, updated_at, version, role, last_login_timestamp.

## License

See [LICENSE](./LICENSE) file.
