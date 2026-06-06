import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Lambda API',
  tagline: 'Lightweight web framework for your serverless applications',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL and base path for GitHub Pages project site
  // (https://jeremydaly.github.io/lambda-api/)
  url: 'https://jeremydaly.github.io',
  baseUrl: '/lambda-api/',

  // GitHub pages deployment config.
  organizationName: 'jeremydaly', // GitHub org/user name.
  projectName: 'lambda-api', // Repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',

  // Mermaid diagram support (used on the Execution Stacks page).
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          editUrl: 'https://github.com/jeremydaly/lambda-api/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      // Offline/local search — no Algolia account required.
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/lambda-api-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    metadata: [
      {
        name: 'keywords',
        content:
          'serverless, aws lambda, api gateway, alb, web framework, nodejs, typescript, express',
      },
    ],
    navbar: {
      logo: {
        alt: 'Lambda API',
        src: 'img/logo.png',
        srcDark: 'img/logo-dark.png',
        href: '/',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/getting-started/quick-start',
          label: 'Quick Start',
          position: 'left',
        },
        {
          href: 'https://www.npmjs.com/package/lambda-api',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/jeremydaly/lambda-api',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/getting-started/introduction',
            },
            {
              label: 'Quick Start',
              to: '/docs/getting-started/quick-start',
            },
            {
              label: 'Routes & Methods',
              to: '/docs/core-concepts/routes-and-methods',
            },
            {
              label: 'API Reference',
              to: '/docs/api-reference/app-configuration',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Issues',
              href: 'https://github.com/jeremydaly/lambda-api/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/jeremydaly/lambda-api',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/lambda-api',
            },
            {
              label: 'Releases',
              href: 'https://github.com/jeremydaly/lambda-api/releases',
            },
            {
              label: 'License (MIT)',
              href: 'https://github.com/jeremydaly/lambda-api/blob/main/LICENSE',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jeremy Daly. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
