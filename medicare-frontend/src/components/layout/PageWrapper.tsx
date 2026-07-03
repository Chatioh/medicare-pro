import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface PageWrapperProps {
  title: string;
  children: ReactNode;
}

const PageWrapper = ({ title, children }: PageWrapperProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
