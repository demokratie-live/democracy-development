import '../styles/globals.css';
import { Shell } from '@/components/Layout';

export const metadata = { title: 'bundestag.io Admin' };

export default function AdminLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Shell card={false}>{children}</Shell>
      </body>
    </html>
  );
}
