import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const SAMPLE = `const api = require('lambda-api')();

api.get('/status', async (req, res) => {
  return { status: 'ok' };
});

exports.handler = async (event, context) =>
  await api.run(event, context);`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>
            Zero-dependency · API Gateway &amp; ALB · TypeScript-ready
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroTagline}>{siteConfig.tagline}</p>
          <p className={styles.heroSubtagline}>
            Express-style routing and middleware, purpose-built for AWS
            Lambda — no bloat, no cold-start penalty.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/getting-started/quick-start">
              Get Started →
            </Link>
            <Link
              className="button button--secondary button--outline button--lg"
              href="https://github.com/jeremydaly/lambda-api">
              View on GitHub
            </Link>
          </div>
          <code className={styles.installChip}>npm install lambda-api</code>
        </div>
        <div className={styles.heroCode}>
          <CodeBlock language="javascript" title="handler.js">
            {SAMPLE}
          </CodeBlock>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Lightweight, zero-dependency web framework for AWS Lambda. Express-style routing, middleware, logging, and built-in support for API Gateway v1/v2 and ALB.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
