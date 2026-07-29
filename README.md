# Quit Anything

A private, mobile-first PWA that helps adults quit, reduce, set boundaries
around, or take a break from an unwanted habit.

## Current MVP

- Five-step setup with tap-ready choices and custom answers
- Four flexible change approaches
- Personal danger windows and replacement plans
- Daily check-ins with urge and trigger tracking
- Ten-minute urge-support flow
- Non-shaming slip recovery
- Progress calculated from saved check-ins
- Editable plan answers without deleting history
- Private account-owned data through ChatGPT sign-in

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
```

## Technology

- Next.js, React, and TypeScript
- Vinext and Cloudflare Workers
- Cloudflare D1 with Drizzle ORM
- Installable PWA manifest and service worker

## Privacy and safety

Habit plans and check-ins are tied to the signed-in user. The app does not
provide medical tapers or tell users to abruptly stop substances where
withdrawal may be dangerous. It is a behavior-change tool, not emergency or
medical treatment.
