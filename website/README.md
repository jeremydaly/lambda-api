# Lambda API Documentation Site

The [Lambda API](https://github.com/jeremydaly/lambda-api) documentation site, built with
[Docusaurus](https://docusaurus.io/). It is published to GitHub Pages at
**https://jeremydaly.github.io/lambda-api/** by the
[`deploy-docs.yml`](../.github/workflows/deploy-docs.yml) workflow on every push to `main`
that touches `website/`.

Documentation content lives in [`docs/`](./docs); the sidebar is defined in
[`sidebars.ts`](./sidebars.ts) and site config in [`docusaurus.config.ts`](./docusaurus.config.ts).

## Local development

```bash
cd website
npm install
npm start
```

Starts a local dev server with hot reload at `http://localhost:3000/lambda-api/`.

## Build

```bash
npm run build      # outputs static files to website/build
npm run serve      # preview the production build locally
npm run typecheck  # type-check the TypeScript config/components
```

The production build fails on broken internal links (`onBrokenLinks: 'throw'`), so a clean
`npm run build` is the gate to keep green.

## Search

Search is provided offline by
[`@easyops-cn/docusaurus-search-local`](https://github.com/easyops-cn/docusaurus-search-local) —
the index is generated at build time, so no Algolia account is required.
