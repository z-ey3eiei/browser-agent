# Environment Variables

Copy `.env.example` to `.env.local` and fill these in. On Vercel, set them in your
project's **Settings → Environment Variables**.

## Required

### `BROWSER_USE_API_KEY`

Your [Browser Use](https://browser-use.com) cloud key (`bu_...`). Used server-side to
provision and tear down cloud browsers. Never exposed to the model or the sandbox.
Get one at [browser-use.com](https://browser-use.com).

### A model credential

The agent's model (`anthropic/claude-opus-4.8`) routes through the
[Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Provide **one** of:

- **Link a Vercel project** — the gateway authenticates via OIDC, no key to manage
  (easiest on Vercel; run `vercel link` locally).
- **`AI_GATEWAY_API_KEY`** — a gateway key from
  [vercel.com/dashboard/ai/api-keys](https://vercel.com/dashboard/ai/api-keys).

To call a provider directly instead of the gateway, set that provider's key and use
a provider-authored model in `agent/agent.ts` (see
[CUSTOMIZATION.md](./CUSTOMIZATION.md#change-the-model)).

## Example `.env.local`

```bash
BROWSER_USE_API_KEY=bu_your_key_here
AI_GATEWAY_API_KEY=your_gateway_key_here
```

## Notes

- `.env.local` is gitignored — never commit secrets.
- A cloud browser bills until it is stopped or times out; the agent stops it when a
  task completes.

## Private owner login

The chat page and Eve session/stream APIs require authentication. There is no
public signup and no anonymous fallback, including in local development.

Set these server-only variables in the project's **Environment Variables** for
Production and Preview, then deploy the updated code:

- `PRIVATE_LOGIN_USERNAME`: your private login name (at most 256 characters).
- `PRIVATE_LOGIN_PASSWORD`: a unique, password-manager-generated random password,
  32–1024 characters. Do not reuse a password or use a memorable phrase. The app
  fails closed if it is missing or shorter than 32 characters.

Never prefix these names with `NEXT_PUBLIC_`, commit the values, or send them in
chat. Use separate credentials for Preview when sharing previews with others.
For local development, put your own values in the ignored `.env.local` file.

Open `/login`, enter the credentials, and sign in. The signed, HttpOnly,
SameSite=Strict cookie expires after 12 hours and uses Secure on deployments.
The logout button clears the current browser's cookie. Treat that cookie as a
credential: a copied cookie remains valid until expiry. Changing either login
variable and redeploying invalidates existing sessions on that deployment;
older deployments retain their old environment until removed or redeployed.

This is a single-owner login, not a multi-user identity service. There is no
password recovery, MFA, or distributed login-attempt limiter. Keep the random
password private; use an identity provider if you need those features. The
public Eve health endpoint remains available for uptime checks. Vercel OIDC is
retained for trusted internal framework calls.

Run `node scripts/check-private-auth.mjs` with Node 24 to check missing/weak
configuration, login verification, cookie signatures, expiry, and rotation. The
check generates temporary test credentials in memory and does not print them.
