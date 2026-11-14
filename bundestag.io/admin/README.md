This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Without backends (mocks)

```bash
pnpm dev:mock
```

Starts a mock server on `localhost:4010` and `next dev` pointed at it, so no
bundestag.io API, procedures service or AI services are needed. Login still uses
`CREDENTIALS` from `.env`.

- `mocks/handlers.ts`: [MSW](https://mswjs.io) handlers, also used by the Vitest tests
  (`mocks/__tests__`).
- `mocks/schema.ts`: answers GraphQL against the real SDL in `../api/src/graphql/schemas`,
  so queries that don't match the API fail here too.
- `mocks/db.ts`: in-memory data with the API's to-do and save rules. Saved data is
  lost when the mock restarts.
- `mocks/fixtures/procedures.json`: real procedures from the public DEMOCRACY API.
  Rebuild with `pnpm mocks:fixtures`. Fields the public API doesn't have
  (history, votingDocument) are derived and listed per procedure in `mock`.
- The AI helpers return fixed example answers; no Claude calls.
- `pnpm mocks:server` starts only the mock server.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
