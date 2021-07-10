import Head from "next/head";
import { Layout as AntLayout, Menu, Breadcrumb } from "antd";

import { Navigation } from "../Navigation";

const { Header, Content, Footer } = AntLayout;

export const Layout: React.FC = ({ children }) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      {/* <link rel="stylesheet" href="/_next/static/style.css" /> */}
    </Head>
    <Navigation />
    <AntLayout>
      <Content style={{ padding: "0 50px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©2016 Created by Ant UED
      </Footer>
    </AntLayout>
  </>
);
