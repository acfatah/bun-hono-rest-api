# Hono RESTful API Templates with Bun Runtime

<p>
  <a href="https://bun.sh">
    <img
      alt="bun.sh"
      src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white"></a>
  <a href="https://github.com/antfu/eslint-config">
    <img
      alt="Code Style"
      src="https://antfu.me/badge-code-style.svg"></a>
  <a href="https://github.com/acfatah/bun-hono-rest-api/commits/main">
  <img
    alt="GitHub last commit (by committer)"
    src="https://img.shields.io/github/last-commit/acfatah/bun-hono-rest-api?display_timestamp=committer&style=flat-square"></a>
</p>

This repository offers RESTful API boilerplates or templates for [Hono](https://hono.dev), running on the [Bun](https://bun.sh) runtime.

## Usage

To create a project using this template, make a new directory with your chosen project name, navigate into it, then run the following command:

```bash
bunx --bun tiged acfatah/bun-hono-rest-api/templates/starter
```

Look under the `templates` directory to see the other available templates.
Replace `/starter` with the template that you want to use.

Afterwards, you can update and install the latest dependencies with:

```bash
bun update --latest
```

Read the respective template's `README.md` for more details.

## Motivation

Why this repository exists and what problems it tries to solve:

- **Modern stack alignment** – Stay current with the latest Bun, Hono, Drizzle, Zod, and ecosystem tooling without re‑researching each time.
- **Opinionated, lightweight convention** – Fill the gap where no clear, concise convention for Bun + Hono REST APIs (with optional DB + auth) felt both minimal and extensible.
- **Reusable personal baseline** – A living template I actively maintain and can share instead of copy/pasting ad‑hoc snippets across projects.
- **Rapid bootstrap** – Go from empty directory to a running, structured API (health, upload, static assets, logging) in minutes.
- **Boilerplate elimination** – Centralize repetitive setup: environment validation, logging, CORS handling, security headers, route composition, and directory scaffolding.
- **Developer experience & performance** – Typed env config, fast Bun runtime, structured logs, modular feature folders, and minimal abstraction overhead.
- **Progressive enhancement path** – Start stateless (`starter`), add persistence & sessions (`drizzle-sqlite`), then full auth (`better-auth`) without architectural rewrites.
- **Maintainability & consistency** – Internal `_` base + sync scripts reduce drift between templates and simplify applying improvements.

If you have similar goals, you can fork and adapt—swap persistence, change auth provider, or add infrastructure layers while keeping the same core patterns.

## Templates Overview & Architecture

The `templates/` directory provides starting points to create RESTful APIs that share
a common core and layer on additional concerns like persistence and authentication.
The `_` template is an internal minimal baseline used to DRY shared code.

### Templates at a Glance

| Template         | Intended Use                               | Added Capabilities                                        |
| ---------------- | ------------------------------------------ | --------------------------------------------------------- |
| `_`              | Internal base (not for direct consumption) | Minimal HTTP API skeleton                                 |
| `starter`        | Lightweight stateless APIs                 | Core structure, health, upload, static assets             |
| `drizzle-sqlite` | APIs needing persistence & sessions        | Drizzle ORM (SQLite), session (iron-session), user schema |
| `better-auth`    | Full auth flows & protected routes         | Drizzle + Better Auth integration, session middleware     |

### Core Design Principles

1. Feature modularity: Each domain lives in `src/modules/<feature>` (routes + related code grouped together).
2. Explicit composition: `createApp()` wires global middleware only; modules stay decoupled.
3. Fail-fast configuration: Startup validates `Bun.env` via Zod and exits on invalid state.
4. Progressive enhancement: Move upward through templates without rewriting base concepts.
5. Replaceable infrastructure: Logging, DB, auth isolated behind small files/easy adapters.
6. Minimal ceremony: Plain functions, no decorators or framework-specific abstractions beyond Hono.

### Shared Directory Layout (All Templates)

```
src/
  app.ts          # createApp(): attach global middleware & compose routes
  index.ts        # Bun runtime entry (exports fetch + port)
  router.ts       # useRoutes(): central route registration
  config/
    env.ts        # Zod schema + typed env export
  lib/
    logger.ts     # Pino logger (pretty in dev, file in prod/test)
  middleware/
    cors-utils.ts # Dynamic CORS origin logic
    logger.ts     # hono-pino adapter exposing ctx.get('logger')
  modules/
    assets/       # Static file serving (./public)
    health/       # Liveness / uptime probe
    upload/       # Example file upload route
public/           # Static assets (robots.txt, images, etc.)
tests/            # Bootstrap & test helpers (lightweight scaffold)
```

### Template-Specific Structure

#### drizzle-sqlite

A simple Drizzle ORM + stateless cookies session management (iron-session) + example user domain.

```
src/db/
  index.ts      # drizzle() client (sqlite via bun:sqlite)
  migrator.ts   # Codebase-first migration executor
  logger.ts     # Drizzle log routing to pino (debug/trace only)
  schema.ts     # Barrel aggregator for domain schemas
  schema/       # (Optional modular schema parts)
src/modules/session/
  session.service.ts  # build() + validate() helpers for iron-session
  session.routes.ts   # Example login route issuing session
src/modules/user/
  user.schema.ts      # User table + timestamps helper
src/types/
  index.ts            # SessionData interface
  hono.d.ts           # Hono context augmentation (session typing)
```

Highlights:

- Session invalidation via optional `SESSION_INVALIDATION_KEY`.
- Reusable `timestamps` helper centralizes created/updated/deleted columns.
- Snake case enforcement with `casing: 'snake_case'` for consistency.

#### better-auth

Extends persistence layer to include full authentication using `better-auth`.

```
src/modules/auth/
  auth.service.ts   # better-auth configuration (adapter, hooks, flows)
src/middleware/session.ts  # Injects authenticated user/session into context
```

Highlights:

- Drizzle adapter with SQLite schema.
- Protected route example (`/protected`).
- Trusted origins combine `BASE_URL` + `TRUSTED_ORIGINS`.

### Environment Configuration Patterns

All templates treat empty strings as undefined so Zod defaults apply. Invalid configuration prints a structured error tree and exits immediately.

| Variable                                         | Purpose                                | Templates      |
| ------------------------------------------------ | -------------------------------------- | -------------- |
| PORT                                             | Server port                            | All            |
| BASE_URL                                         | Absolute application URL               | All            |
| LOG_LEVEL                                        | Controls pino + ORM verbosity          | All            |
| TRUSTED_ORIGINS                                  | CSV of allowed origins for CORS        | All            |
| PRODUCTION_LOG_FILE / TEST_LOG_FILE              | Log destinations in prod/test          | All            |
| APP_SECRET                                       | Session encryption (iron-session)      | drizzle-sqlite |
| SESSION\_\* (COOKIE_NAME, TTL, INVALIDATION_KEY) | Session behavior                       | drizzle-sqlite |
| AUTH_SECRET / BETTER_AUTH_SECRET                 | Auth secrets (one required)            | better-auth    |
| SQLITE_DB_PATH                                   | Custom SQLite path (defaults :memory:) | better-auth    |

### Middleware Strategy

- `logger()` attaches a request-scoped pino.
- `cors` only applied to `/api/*` leaving root/static unaffected.
- `secureHeaders()` ensures sane defaults for common security headers.
- Auth/session middlewares included only where needed—keeps base lean.

### Routing Pattern

Each feature exports a `Hono` instance (`<feature>.routes.ts`) mounted in `useRoutes(app)`, centralizing route registration while preserving module isolation.

### Upload Example

Shows both form-data (commented) and direct body parsing pathways. Uses `Bun.write()` with timestamp-prefixed filenames in `upload/`.

### Static Assets

Served under root via `assetsRoutes` using `serveStatic({ root: './public' })`—simple and explicit.

### Progressive Adoption Guide

| Start          | When                              | Upgrade Path                        |
| -------------- | --------------------------------- | ----------------------------------- |
| starter        | Stateless JSON API                | add DB/session → drizzle-sqlite     |
| drizzle-sqlite | Need persistence + sessions       | add auth flows → better-auth        |
| better-auth    | Need full auth & protected routes | add domain modules & business rules |

### Extending with a New Module (Example: Todos)

1. Create `src/modules/todos/todos.routes.ts` exporting a `Hono` router.
2. (If using Drizzle) Add `todos.schema.ts` & export via `db/schema.ts`.
3. Register in `useRoutes(app)` with `app.route('/todos', todosRoutes)`.
4. Add Zod validation for request payloads.

### Logging Behavior

| Environment | Transport   | Destination    |
| ----------- | ----------- | -------------- |
| development | pino-pretty | stdout (color) |
| test        | pino/file   | test.log       |
| production  | pino/file   | production.log |

Drizzle logs are emitted only when `LOG_LEVEL` is `debug` or `trace`.

### Why the `_` Template Exists

Scripts (`scripts/copy-common-*`) sync shared boilerplate. This reduces merge churn and ensures consistency across evolving templates.

### Testing Scaffolding

Each template seeds a minimal `tests/` directory (`bootstrap.ts`, helpers) so you can plug in your preferred runner (e.g. Bun test, Vitest) without structural changes.

### Future Roadmap Ideas

- [ ] S3 storage Upload.
- [x] Transactional email (e.g. nodemailer, AWS SES).
- [ ] JWT + refresh token example layer.
- [ ] Postgres database integration.
- [ ] OpenAPI (Swagger) generation.
- [ ] Background job/queue (e.g. built-in scheduler, sidekiq-like pattern).
- [ ] Request/response contract typing utilities.

## References

- https://github.com/honojs/hono
- https://github.com/honojs/examples
- https://github.com/drizzle-team/drizzle-orm
- https://github.com/colinhacks/zod
- https://github.com/better-auth/better-auth
- https://github.com/vvo/iron-session
