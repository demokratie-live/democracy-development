import styled from "styled-components";
import Router, { withRouter } from "next/router";
import { Layout, Menu, Icon } from "antd";
import Link from "next/link";

const { Header, Sider } = Layout;

// import Link from "./Link";

const Wrapper = styled.header`
  margin-bottom: 25px;
`;

const Navigation = ({ router: { pathname } }) => (
  <Sider
    breakpoint="lg"
    collapsedWidth="0"
    onCollapse={(collapsed, type) => {
      console.log(collapsed, type);
    }}
  >
    <div className="logo" />
    <Menu theme="dark" mode="inline" defaultSelectedKeys={[pathname]}>
      <Menu.Item key="/">
        <Link prefetch href="/">
          <a>
            <Icon type="user" />
            <span className="nav-text">Home</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item key="/procedures">
        <Link prefetch href="/procedures">
          <a>
            <Icon type="pie-chart" />
            <span className="nav-text">Vorgänge</span>
          </a>
        </Link>
      </Menu.Item>
      {/* <Menu.Item key="/fractions">
        <Link prefetch href="/fractions">
          <a>
            <Icon type="team" />
            <span className="nav-text">Fraktionen</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item key="/periods">
        <Link prefetch href="/periods">
          <a>
            <Icon type="global" />
            <span className="nav-text">Legislaturen</span>
          </a>
        </Link>
      </Menu.Item> */}
    </Menu>
  </Sider>
);

export default withRouter(Navigation);
