### Client Walkthrough

The frontend is a standard React app, using `react-router-dom` and the Context API for state management. The app leverages the `@agoric/ui-kit` to connect to a wallet and poll the chain, and stores data in several Context providers (`/contexts`) so it can be easily shared across the app (`/hooks`).

There are only a handful of pages - 
 - `/notifieres` - prompts for authentication, lists notifiers, allows users to create notifiers
 - `/vaults` - prompts for wallet connection, list vaults, prepopulate Create Notifier with vault + manager info
 - `/verify` - looks for `?token=` in the url, and authenticates the user if valid. authentication emails will direct users to this page