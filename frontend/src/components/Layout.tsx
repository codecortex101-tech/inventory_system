import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-blue-800/20 to-blue-600/15"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(15, 76, 117, 0.4) 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, rgba(50, 130, 184, 0.3) 0%, transparent 50%),
                         radial-gradient(circle at 40% 20%, rgba(66, 165, 245, 0.2) 0%, transparent 50%)`
      }}></div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
