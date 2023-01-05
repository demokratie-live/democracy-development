import { FC, ReactNode } from 'react';

import Navigation from '@/components/molecules/Navigation';
import DonateDialog from '@/components/organisms/DonateDialog';

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => (
  <div className="h-full w-full">
    <Navigation />
    <div className="min-h-full">{children}</div>
    <DonateDialog />
  </div>
);

export default Layout;
