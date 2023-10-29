import Head from 'next/head';
import { Layout as AntLayout, Breadcrumb } from 'antd';

import { Navigation } from '../Navigation';

const { Content } = AntLayout;

type Props = {
  children: React.ReactNode;
};

export const Layout: React.FC<Props> = ({ children }) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      {/* <link rel="stylesheet" href="/_next/static/style.css" /> */}
    </Head>
    <AntLayout>
      <Navigation />
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Backend</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>{children}</div>
      </Content>
    </AntLayout>
  </>
);
