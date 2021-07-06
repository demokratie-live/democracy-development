import styled from "styled-components";
import { useRouter } from "next/router";
import { Layout, Menu } from "antd";
import Link from "next/link";
import Icon from "@ant-design/icons/lib/components/Icon";

const { Header, Sider } = Layout;

// import Link from "./Link";

const Wrapper = styled.header`
  margin-bottom: 25px;
`;

export const Navigation = () => {
  const router = useRouter();
  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
    >
      <div className="logo" />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.pathname]}>
        <Menu.Item key="/">
          <Link href="/">
            <a>
              <Icon type="user" />
              <span className="nav-text">Home</span>
            </a>
          </Link>
        </Menu.Item>
        <Menu.Item key="/procedures">
          <Link href="/procedures">
            <a>
              <Icon type="pie-chart" />
              <span className="nav-text">Vorgänge</span>
            </a>
          </Link>
        </Menu.Item>
        {/* <Menu.Item key="/fractions">
        <Link  href="/fractions">
          <a>
            <Icon type="team" />
            <span className="nav-text">Fraktionen</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item key="/periods">
        <Link  href="/periods">
          <a>
            <Icon type="global" />
            <span className="nav-text">Legislaturen</span>
          </a>
        </Link>
      </Menu.Item> */}
      </Menu>
    </Sider>
  );
};
