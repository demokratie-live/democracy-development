import React from 'react';
import Navigation from '@/components/molecules/Navigation';
import DonateDialog from '@/components/organisms/DonateDialog';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => (
  <div className="h-full w-full">
    <Navigation />
    <div className="min-h-full">{children}</div>
    <DonateDialog />
  </div>
);

export default Layout;
