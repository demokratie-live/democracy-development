import Head from 'next/head';

import { Navigation } from '../Navigation';

type ShellProps = {
  title?: string;
  children: React.ReactNode;
};

// shared by the pages router (Layout) and the app router (app/layout.tsx)
export const Shell: React.FC<ShellProps> = ({ title, children }) => (
  <div className="min-h-screen">
    <Navigation />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {title && <h1 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h1>}
      <div className="rounded-lg border bg-card p-4 sm:p-6">{children}</div>
    </main>
  </div>
);

export const Layout: React.FC<ShellProps> = ({ title, children }) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title ? `${title} · bundestag.io Admin` : 'bundestag.io Admin'}</title>
    </Head>
    <Shell title={title}>{children}</Shell>
  </>
);
