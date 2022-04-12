import { FC, ReactNode } from 'react';

import Navigation from '@/components/molecules/Navigation';

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => (
  <div className="h-full w-full">
    <Navigation />
    <div className="min-h-full">{children}</div>
  </div>
);

export default Layout;
