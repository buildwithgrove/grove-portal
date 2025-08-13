# Grove Portal UI <!-- omit in toc -->

<div align="center">
<img src="https://storage.googleapis.com/grove-brand-assets/Presskit/Logo%20Joined-2.png" alt="Grove logo" width="500"/>
</div>
<br/>

## Overview <!-- omit in toc -->

[Grove Portal UI](https://github.com/buildwithgrove/grove-portal) implements the interface for Grove's users and customers at [portal.grove.city/](https://portal.grove.city/).

This [portal](https://portal.grove.city/) allows users to manage their Grove services, subscriptions, configurations and more.

- [Development Quickstart](#development-quickstart)
  - [1. Get Environment Variables](#1-get-environment-variables)
  - [2. Install Dependencies, Build \& Run](#2-install-dependencies-build--run)
  - [3. Open Application](#3-open-application)
- [Run with **Remix**](#run-with-remix)
- [Deployment Workflow](#deployment-workflow)
- [Development](#development)
  - [Env](#env)
  - [Frontend](#frontend)
  - [Stripe Webhook Forwarding](#stripe-webhook-forwarding)
  - [Environment Variables](#environment-variables)
  - [Backend](#backend)

## Development Quickstart

### 1. Get Environment Variables

Use the [1Password CLI](https://developer.1password.com/docs/cli/get-started/):

```sh
op item get c5cretuyeauiubm3uaqojdy4zm --fields notesPlain --format json | jq -r '.value' > .env
```

Or download `.env` from [1Password](https://start.1password.com/open/i?a=4PU7ZENUCRCRTNSQWQ7PWCV2RM&v=kudw25ob4zcynmzmv2gv4qpkuq&i=c5cretuyeauiubm3uaqojdy4zm&h=buildwithgrove.1password.com)

If the link ☝️ doesn't work for you, look for a file named `Grove Portal - Portal UI - .env (PROD)`

### 2. Install Dependencies, Build & Run

```sh
make portal_install_and_run
```

### 3. Open Application

- Visit [http://localhost:3000](http://localhost:3000)

## Run with **Remix**

- [Remix Docs](https://remix.run/docs)

## Deployment Workflow

1. **Test Locally**: Test your changes locally before creating a PR.
2. **Test in Preview**: Push your feature branch and create a PR. CD will automatically deploy via Vercel to a preview environment
3. **Deploy to PROD**: Create a PR into `main`. CD will automatically deploy to [https://portal.grove.city/](https://portal.grove.city).
4. **Test in Main**: Test your changes in the main environment to ensure everything is working as expected.

## Development

### Env

Make sure to get the `.env` from [1password](https://start.1password.com/open/i?a=4PU7ZENUCRCRTNSQWQ7PWCV2RM&v=kudw25ob4zcynmzmv2gv4qpkuq&h=buildwithgrove.1password.com).

### Frontend

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
pnpm install
```

Then, built:

```sh
pnpm build
```

Afterwards, start the Remix development server like so:

```sh
pnpm dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

### Stripe Webhook Forwarding

If you're testing the Stripe webhook flow, you must use the Stripe CLI to forward the webhook to your local environment.

[Full instructions can be found on the Stripe documentation page.](https://docs.stripe.com/stripe-cli/overview#forward-events-to-your-local-webhook-endpoint)

You must initialize the Stripe CLI with your Stripe account:

```sh
stripe login
```

Then run the following to start forwarding webhooks:

```sh
stripe --api-key {STRIPE_API_KEY} listen --forward-to http://localhost:3000/api/stripe/webhook
```

It is generally recommended to use the test mode Stripe API key for forwarding webhooks, as this will not create any real subscriptions or charge any real money.

You will be given a webhook signing secret, set it in your `.env` file as `STRIPE_WEBHOOK_SECRET`.

The webhook handling code in this repo [can be found here](app/routes/api.stripe.webhook/route.tsx).

### Environment Variables

Download `.env` from [1Password](https://start.1password.com/open/i?a=4PU7ZENUCRCRTNSQWQ7PWCV2RM&v=kudw25ob4zcynmzmv2gv4qpkuq&h=buildwithgrove.1password.com)

If the link ☝️ doesn't work for you, look for a file named `Grove Portal - Portal UI - .env (PROD)`

### Backend

The default `.env` uses the `PRODUCTION` environment backend.

If you'd like to test in a `NON-PRODUCTION` environment, run the backend on `localhost:4200`.
