
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BreakingTicker from './BreakingTicker';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Frozen Header Component */}
      <Header />
      
      {/* Frozen Breaking News Ticker positioned below Header */}
      <div className="fixed top-16 left-0 right-0 z-40 shadow-sm">
        <BreakingTicker />
      </div>

      {/* Main Content Area - padded to start after the frozen elements (64px + 40px = 104px) */}
      <main className="flex-grow pt-[104px]">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
