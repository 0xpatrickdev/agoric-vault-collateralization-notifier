# Sequence Diagrams

## Table of Contents

- [User Registration Flow](#user-registration-flow)
- [Notifier Creation Flow](#notifier-creation-flow)
- [Quote Follower Flow](#quote-follower-flow)
- [Vault Follower Flow](#vault-follower-flow)
- [maybeSendNotifier Flow](#maybesendnotifier-flow)
- [Notifier Deletion Flow](#notifier-deletion-flow)

### User Registration Flow

```mermaid
sequenceDiagram
  participant User
  participant Server
  participant EmailService

  User->>Server: Request registration
  Server->>EmailService: Generate access code
  EmailService->>User: Send access code via email
  User->>Server: Submit access code for verification
  Server->>User: Return Cookie with JWT token (or error)
```

### Notifier Creation Flow

```mermaid
sequenceDiagram
  participant User
  participant Server
  participant Database
  participant rpcService
  participant vstorageWatcher

  User->>Server: Request to create a Notifier
  Server->>rpcService: Check if vault is valid and not in 'closed' or 'liquidating' state
  rpcService->>Server: Return vault state
  Server->>Database: Save vault and quote details
  Database->>Server: Confirm vault and quote saved
  Server->>Database: Save notifier details
  Database->>Server: Confirm notifier saved
  Server->>User: Return success (or error)
  Server->>vstorageWatcher: Start following the specified vault
  Server->>vstorageWatcher: Start following the specified quote/manager
```

### Quote Follower Flow

```mermaid
sequenceDiagram
  participant vstorageWatcher
  participant handleQuote
  participant DB as Database
  participant maybeSendNotification

  vstorageWatcher->>+handleQuote: Manager quote received
  handleQuote->>DB: insertOrReplaceQuote(quote)
  handleQuote->>DB: getAllVaultsByManagerId(vaultManagerId)
  DB-->>handleQuote: vaults list
  Note right of handleQuote: For each vault, calculate collateralizationRatio
  handleQuote->>maybeSendNotification: Send collateralizationRatio, vaultId, vaultManagerId
```

### Vault Follower Flow

```mermaid
sequenceDiagram
  participant vstorageWatcher
  participant handleVault
  participant DB as Database
  participant maybeSendNotification

  vstorageWatcher->>+handleVault: Manager quote received
  handleVault->>DB: insertOrReplaceVault(quote)
  handleVault->>vstorageWatcher: stop following vault if vault is 'closed' or 'liquidated'
  handleVault->>DB: getLatestQuote(vaultManagerId)
  DB-->>handleVault: vaultManager quote
  Note right of handleVault: Calculate collateralizationRatio
  handleVault->>maybeSendNotification: Send collateralizationRatio, vaultId, vaultManagerId
```

### maybeSendNotifier Flow

```mermaid
sequenceDiagram
  participant maybeSendNotification
  participant DB as Database
  participant EmailService

  maybeSendNotification->>DB: getNotifiersByThreshold(..args)
  DB-->>maybeSendNotification: notifiers to alert
  maybeSendNotification->>EmailService: Send email notification
  maybeSendNotification->>DB: Update notifier status (active: true)
  maybeSendNotification->>DB: getNotifiersToReset(..args)
  DB-->>maybeSendNotification: notifiers to reactivate
  maybeSendNotification->>DB: Update notifier status (active: false)
```

### Notifier Deletion Flow

```mermaid
sequenceDiagram
  participant User
  participant Server
  participant Database
  participant vstorageWatcher

  User->>Server: Request to delete a specific Notifier
  Server->>Database: Delete the notifier from DB
  Note right of Server: (confirms user is owner)
  Database->>Server: Confirm notifier deleted
  Server->>User: Return success (or error)
  Server->>vstorageWatcher: Stop following the associated vault
  Note right of Server: (if no other notifiers are tracking it)
```