# This file contains information about database migrations.

## Database Migrations

This directory is intended for managing database migrations for the e-commerce web application. Migrations are a way to version control your database schema changes, allowing you to easily apply and revert changes as needed.

### Migration Files

- Each migration file should be named in the format `YYYYMMDDHHMMSS_description.js`, where:
  - `YYYYMMDDHHMMSS` is the timestamp of when the migration was created.
  - `description` is a brief description of the changes made in the migration.

### Running Migrations

To run migrations, use the following command:

```
npm run migrate
```

This command will apply all pending migrations to the database.

### Rolling Back Migrations

To roll back the last migration, use the following command:

```
npm run migrate:rollback
```

This command will revert the last applied migration.

### Best Practices

- Always create a new migration file for any changes made to the database schema.
- Test migrations in a development environment before applying them to production.
- Keep migration files organized and well-documented for future reference.