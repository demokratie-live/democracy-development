import { Navigation } from '@/components/Navigation';
import { Layout as AntLayout, Breadcrumb } from 'antd';

const { Content } = AntLayout;

export default function AdminLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AntLayout>
          <Navigation />
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>{children}</div>
        </AntLayout>
      </body>
    </html>
  );
}
