### Server Walkthrough

The first time the app starts, it will create a new sqlite3 database and persist it to disk. For tests, an in-memory database is used. Six tables are created in the database -

- Users - users who've verified email address ownership
- Brands - list of vbank assets and their decimal places
- Quotes - latest quote (in/out) for each active vault manager
- Vaults - latest vault state (locked, debt) for each active vault
- Notifiers - list of vaults and collateralizationRatio thresholds specified by users
- Notifications - historical list of notifications sent to users

The app will periodically poll the blockchain for the latest vault and quote state, and manage this logic in a singleton `vstorageWatcher` service. When the app starts, it will add a follower for all vbankAssets, and followers for any Notifiers found in the database. Other followers will be added and removed based on user generated requests for Notifiers.

A user can sign up by requesting an access code to their email (`/register`). The access code has an expiry of 30 minutes, and can only be used once. After verifying the access token (`/verify`), the user will recieve a cookie containing a JWT token they must include in future requests. Alternatively, the cookie value can be sent in the `Authorization` header. The JWT token expiry can be configured with the `JWT_EXPIRY` env var, and has a default value of 30 days. The cookie is also configured with `HttpOnly; Secure; SameSite=Strict` to follow best practices. 

Once verified, a user can creater a Notifier for any vault. The follower service will trigger an email notification to the user when the vault's collateralizationRatio is less than or equal to the threshold specified by the user. This particular Notifier will go into the `(active: true)` phase, indicating that the user is not to receive another notification until the vault goes above the notification level and re-crosses the threshold.

If a vault is in the `closed` or `liquidated` state when the user requests to create a Notifier, they will encounter an error. If the vault enters one of these states after the Notifier is created, the Notifier will be marked as "expired" and the user will recieve no further notifications.

Users are able to query only their own list of Notifiers and only delete Notifiers they've created. When notifiers are deleted, the vault follower is conditionally removed. The Vault(s) will still appear in the database but followers are only initiated/active based on data from the Notifiers table.

A change in a vault's state (balanace change for locked, debt) or a change in the quote's state (quoteAmountIn, quoteAmountOut) will both trigger a check for any Notifiers that need to be sent. The current collateralizationRatio is calculated on the fly and used to query against the Notifiers table.

Notifications are sent via email via the Mailgun API. The Mailgun API key and domain are configured via the `EMAIL_API_KEY`, `EMAIL_CALLBACK_URL`, `EMAIL_FROM`, and `EMAIL_DOMAIN` env vars. Rolling an email server is tricky and prone to getting flagged as spam, so Mailgun was chosen for better delivery.

When a notification is sent, it is also persisted to a `Notifications` table with a `sentAt` timestamp.

Tests are implemented using [Ava](https://github.com/avajs/ava) as a test runner and [Sinon](https://sinonjs.org/) for spies and stubs. All criticial flows have tests and coverage is above 90%.