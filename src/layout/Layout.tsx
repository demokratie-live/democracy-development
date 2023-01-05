import { FC, ReactNode } from 'react';

import Navigation from '@/components/molecules/Navigation';
import Donate from '@/components/organisms/Donate';

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => (
  <div className="h-full w-full">
    <Navigation />
    <div className="min-h-full">{children}</div>
    <Donate />
  </div>
);

export default Layout;
