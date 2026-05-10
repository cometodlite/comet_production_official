This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Storage

The COMET account system stores users in Postgres when one of these environment variables is available:

```bash
DATABASE_URL
POSTGRES_URL
POSTGRES_PRISMA_URL
```

On startup, the app creates a `comet_users` table if it does not already exist. Local development falls back to `.data/users.json` when no database URL is configured.

Set `AUTH_SECRET` in every Vercel environment that serves authenticated routes.

Account roles are separated:

- Public users use `/login`, `/signup`, and `/account`.
- Staff users use `/staff/login`, `/staff/signup`, and `/staff`.
- Staff group areas are isolated:
  - `/staff/entertainers` requires a `COMET ENTERTAINERS` staff account.
  - `/staff/develops` requires a `COMET DEVELOPS` staff account.
  - `/staff/board` requires a `COMET 이사회` account.

Staff signup requires the matching group code. If a group code is not configured, signup for that staff group is disabled while staff login pages remain available.

Staff who need a signup code can use `/contact?type=staff-code` to send a staff signup code request through the contact form.

Staff codes are separated by staff group and should be configured as server-side environment variables:

```bash
STAFF_CODE_ENTERTAINERS
STAFF_CODE_DEVELOPS
STAFF_CODE_COMET_BOARD
STAFF_ALLOWED_EMAILS_ENTERTAINERS
STAFF_ALLOWED_EMAILS_DEVELOPS
STAFF_ALLOWED_EMAILS_COMET_BOARD
```

Board signup requires both `STAFF_CODE_COMET_BOARD` and an email included in `STAFF_ALLOWED_EMAILS_COMET_BOARD` (comma, space, or newline separated). Optional allow-lists can also be configured for `STAFF_ALLOWED_EMAILS_ENTERTAINERS` and `STAFF_ALLOWED_EMAILS_DEVELOPS`.

Staff accounts are created with the group initial code. After signup, a staff user can change their personal staff code in `/staff/settings`; staff login then requires the updated personal code. If a staff user forgets the personal code, an authorized board account can use `/staff/reset-code` to reset the account back to the group initial code.
