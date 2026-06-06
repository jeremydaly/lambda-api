import type {ReactNode, ComponentType, SVGProps} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: ReactNode;
};

const iconProps: SVGProps<SVGSVGElement> = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const PackageIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);

const BoltIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const CodeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

const CloudIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A3.5 3.5 0 0 0 6.5 19z" />
  </svg>
);

const ListIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const TypeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 9h5M10.5 9v7M14 16c.7.6 1.5.8 2.3.8 1.4 0 2.2-.7 2.2-1.7 0-2-3.8-1.3-3.8-3.3 0-.9.8-1.6 2-1.6.8 0 1.5.2 2 .6" />
  </svg>
);

const FeatureList: FeatureItem[] = [
  {
    title: 'Zero Dependencies',
    Icon: PackageIcon,
    description: (
      <>
        A single, self-contained module. Smaller bundles, faster deploys, and a
        security surface you can actually audit.
      </>
    ),
  },
  {
    title: 'Built for Cold Starts',
    Icon: BoltIcon,
    description: (
      <>
        No heavy framework to bootstrap. Routes resolve fast so your Lambda
        functions wake up and respond in milliseconds.
      </>
    ),
  },
  {
    title: 'Express-Like API',
    Icon: CodeIcon,
    description: (
      <>
        Familiar <code>app.get()</code> routing, middleware, and chainable
        responses. If you know Express, you already know Lambda API.
      </>
    ),
  },
  {
    title: 'API Gateway v1, v2 & ALB',
    Icon: CloudIcon,
    description: (
      <>
        Automatically detects REST API, HTTP API (v2 payload), and Application
        Load Balancer events. One codebase, every trigger.
      </>
    ),
  },
  {
    title: 'Logging Built In',
    Icon: ListIcon,
    description: (
      <>
        Structured JSON logs, access logs, sampling, custom levels, and
        serializers — production observability without extra packages.
      </>
    ),
  },
  {
    title: 'First-Class TypeScript',
    Icon: TypeIcon,
    description: (
      <>
        Ships with type definitions. Typed requests, responses, and handlers
        out of the box, no <code>@types</code> package required.
      </>
    ),
  },
];

function Feature({title, Icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Icon aria-hidden />
        </div>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardBody}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Everything you need, nothing you don&apos;t
        </Heading>
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
