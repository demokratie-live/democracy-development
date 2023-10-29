import { useRouter } from 'next/router';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import Icon from '@ant-design/icons/lib/components/Icon';
import { signOut } from 'next-auth/react';

const { Sider } = Layout;

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
          <Link href="/" legacyBehavior>
            <a>
              <Icon type="user" />
              <span className="nav-text">Home</span>
            </a>
          </Link>
        </Menu.Item>
        <Menu.Item key="/procedures">
          <Link href="/procedures" legacyBehavior>
            <a>
              <Icon type="pie-chart" />
              <span className="nav-text">Vorgänge</span>
            </a>
          </Link>
        </Menu.Item>
        <Menu.Item key="/signout" onClick={() => signOut()}>
          Ausloggen
        </Menu.Item>
        {/* <Menu.Item key="/fractions">
        <Link  href="/fractions" legacyBehavior>
          <a>
            <Icon type="team" />
            <span className="nav-text">Fraktionen</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item key="/periods">
        <Link  href="/periods" legacyBehavior>
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
