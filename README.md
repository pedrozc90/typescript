# typescript

Koa + TypeScript REST API with Prisma and PostgreSQL.

## Requirements

- Node.js >= 24
- PostgreSQL

## Environment

Copy `.env.example` to `.env` and update values.

## Commands

- `npm run start`
- `npm run start:dev`
- `npm run lint`
- `npm run build`
- `npm run test:run`

## Project structure

- `src/controllers` - endpoint controllers
- `src/services` - business logic
- `types` - interfaces and types
- `settings` - environment mapping to a `Settings` object
- `prisma` - schema and SQL migrations

## Endpoints

- `POST /users`
- `PUT /users`
- `GET /users/:id`
- `GET /users`
- `POST /login`
