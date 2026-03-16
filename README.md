This is the Scanned Reality hologram website: a [Next.js](https://nextjs.org) app that serves volumetric capture content (8th Wall AR and ScannedReality viewers). Content is loaded from CloudFront index files.

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

## Production deployment

For custom server deployment (HTTPS, env vars, build steps), see **[DEPLOYMENT.md](../DEPLOYMENT.md)** in the repo root. Use **build-all.ps1** (Windows) or **build-all.sh** (Mac/Linux) to build both the Next.js app and the 8th Wall app and copy assets.

## Testing

See **[TEST-PLAN.md](../TEST-PLAN.md)** for a full verification checklist. **[TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** covers common issues.
