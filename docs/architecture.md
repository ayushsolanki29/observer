# Architecture Overview

Observer follows a clean, interface-driven architecture built on SOLID principles. It avoids heavy enterprise frameworks like NestJS or DI containers in favor of manual dependency injection, composition, registries, and single-responsibility modules.

## Layers

### 1. Core
The absolute core of the application. It contains only Typescript `interfaces`, `models`, and custom `domain errors`. It has zero dependencies on infrastructure libraries (like Axios or SQLite).

### 2. Infrastructure
Contains the concrete implementations of the core interfaces.
- **Http**: `HtmlFetcher` (Axios)
- **Parser**: `GtuParser` (Cheerio)
- **Storage**: `SqliteStorage` (better-sqlite3)
- **Notification**: `TelegramNotifier` (Axios)

All infrastructure implementations catch library-specific errors and rethrow them as custom Domain Errors to prevent leaking implementation details.

### 3. Services
Contains the core business logic.
- **MonitorRunner**: Orchestrates the entire flow for a given `Monitor` profile. It does not know about HTML, SQL, or Telegram. It only interacts with the interfaces `Fetcher`, `Parser`, `Matcher`, `Storage`, and `Notifier`.
- **RuleMatcher**: A scoring engine that calculates whether a `Notice` is relevant based on `include` and `exclude` rules defined in a profile.

### 4. Config
- `env.ts`: Loads global environment variables (e.g. Telegram tokens) once using `dotenv` and validates them with `Zod`.
- `logger.ts`: Instantiates the single `Pino` logger used across the application.
- `monitorLoader.ts`: Loads and parses `*.json` configuration profiles from the `monitors/` directory.

### 5. Utils
Contains pure, reusable helper functions:
- `hash.ts`: SHA-256 hashing.
- `retry.ts`: A Higher-Order Function (`withRetry`) that provides exponential backoff for network operations.

## Execution Flow (main.ts)
1. Initialize Logger (`logger.ts`).
2. Load Monitor profiles via `monitorLoader.ts`.
3. Instantiate Storage (`SqliteStorage`) and Matcher (`RuleMatcher`).
4. Iterate through all active profiles.
5. Dynamically resolve the required `Fetcher` and `Parser` instances via a simple registry pattern.
6. Wrap network infrastructure with the `withRetry` utility.
7. Instantiate the `MonitorRunner`.
8. Execute `MonitorRunner.run(monitor)` to process the website.
9. Exit successfully or forcefully on fatal error.
