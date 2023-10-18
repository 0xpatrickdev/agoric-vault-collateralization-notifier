# Agoric Vault Collateralization Notifier

## Description

The `agoric-vault-collateralization-notifier` is a server application that allows users to monitor collateralization levels of vaults opened on the Inter Protocol via email notifications. It also includes a web application interface that allows users to create, edit, and delete notifiers.

## Table of Contents

- [Key Concepts](#key-concepts)
- [Demo & Screenshots](#demo-screenshots)
- [Getting Started](#getting-started)
- [Server Architecture Overview](#server-architecture-overview)
- [Client Architecture Overview](#client-architecture-overview)
- [Sequence Diagrams](#sequence-diagrams)
- [Deployment](#deployment)

## Key Concepts

In the application, specific terminology is used to describe key concepts. These are explained below:

- **Notifiers**: Notifiers are user-generated rules that specify conditions under which they should be notified. Users create notifiers to monitor the collateralization ratio of specific vaults. When the specified conditions are met, users receive email notifications.

- **Notifications**: Notifications are sent to users when the conditions of their notifiers are met. They contain information about the notifier, the vault, and the current collateralization ratio. They are also stored in a database table for record keeping purposes.

- **Vaults**: Vaults represent a vault opened on the Inter Protocol. They are associated with Notifiers, and can enter different states, including "closed" or "liquidated."

- **Quotes**: Quotes provide information about the latest exchange rates or prices, specifically the "quoteAmountIn" and "quoteAmountOut." These numbers are used to calculate the collateralization ratio. A "quote manager" is roughly synonymous with a "vault manager."

- **Vault Manager**: A Vault Manager is set of vaults for a specific collateral type. Quotes and governance params are gathered on the VaultManager level.

- **Collateralization Ratio**: The collateralization ratio is a critical metric in our application. It represents the ratio of a vault's collateral value to its debt. Users set threshold values for this ratio when creating notifiers to trigger notifications.


## Demo & Screenshots

A full list of screenshots can be found in the [`docs/screenshots`](docs/screenshots) directory.

https://github.com/0xpatrickdev/agoric-vault-collateralization-notifier/assets/11021913/6969e3ad-85a0-4a83-acf1-3c18e12bdff5


## Getting Started

### Requirements

- Node 18.x (native fetch!)
- yarn 1.22.x
- API_KEY and DOMAIN_NAME from [Mailgun](https://www.mailgun.com/)

```zsh
git clone https://github.com/0xpatrickdev/agoric-vault-collateralization-notifier.git
cd agoric-vault-collateralization-notifier

# install dependencies
yarn install

# set environment variables
# Remember to update .env file with your own API_KEY and DOMAIN_NAME
cp server/.env.test server/.env

# start fastify server + db
yarn server:start

# start frontend dev server
yarn web:dev

# run tests and coverage 
yarn server:test

```

## Server Architecture Overview

A basic overview is provided here. For more in-depth information, please see [`docs/server.md`](docs/server.md).

1. **Database**: SQLite3 is used to store Notifiers, Notifications, and Users. It also stores information about Assets, Vaults, and Quotes, for faster retrieval and persistence across restarts. 

2. **API Server (Fastify)**: Fastify serves as our API server, providing endpoints for client-side interactions. It handles incoming HTTP requests, processes them, and communicates with the database as necessary. Libraries like `@fastify/jwt`, `@fastify/cookie`, and `@fastify/cors` are leveraged to implement authentication.

3. **Blockchain Interaction (@agoric/rpc)**: Our server interacts with the blockchain through a modified version of the `@agoric/rpc` library, that is suitable for a server environment. The `followers.js` service keeps track of paths to follow, callback handlers, and notificatiosn that should be sent.

4. **Email Service (Mailgun)**: To send email notifications, the Mailgun API is leveraged as it is important for emails to have a high delivery rate.


## Client Architecture Overview

The client-side architecture is built using popular technologies to create a responsive and user-friendly interface. The primary technologies used are React, Tailwind, and Vite.

1. **React**: library for ui components and state management

2. **Tailwind CSS**: utility-based CSS framework

3. **Vite**: build tool and local development server

For more in-depth information, please see [`docs/client.md`](docs/client.md).

## Sequence Diagrams

Please see [`docs/diagrams.md`](docs/diagrams.md) for more details.

- [User Registration Flow](docs/diagrams.md#user-registration-flow)
- [Notifier Creation Flow](docs/diagrams.md#notifier-creation-flow)
- [Quote Follower Flow](docs/diagrams.md#quote-follower-flow)
- [Vault Follower Flow](docs/diagrams.md#vault-follower-flow)
- [maybeSendNotifier Flow](docs/diagrams.md#maybesendnotifier-flow)
- [Notifier Deletion Flow](docs/diagrams.mde#notifier-deletion-flow)

## Deployment

### Server Deployment

For production, the server should be configure with rate limiting and/or a reverse proxy. Something like [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit) could be configured and used as a rate limiter. Alternatively, rate-limiting can be configured through a reverse proxy like nginx or caddy.

The embedded database and server are currently only configured for one environment/network at a time, so a server instance should be deployed for each environment. In the future, the app could be configured to support multiple environments in parallel.

Since sqlite3 is used as an embedded database, it's only suitable to deploy this as a single instance.

### Client Deployment
For production, the web app can be built as a static site and served over a CDN. Some server side environment vairables are reliant on the final url/domain name of the web app, so please keep this in mind when deploying.


