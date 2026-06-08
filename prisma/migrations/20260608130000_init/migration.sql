CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

CREATE TABLE IF NOT EXISTS "users" (
    "id"            BIGSERIAL    NOT NULL,
    
    "inserted_at"   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version"       INTEGER      NOT NULL DEFAULT 1,

    "email"         VARCHAR(255) NOT NULL,
    "password"      VARCHAR(32)  NOT NULL,
    "role"          "UserRole"   NOT NULL DEFAULT 'USER',
    "logged_at"     TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
