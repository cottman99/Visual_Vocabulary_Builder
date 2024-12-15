import { Toaster } from 'react-hot-toast';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Visual Vocabulary Builder
          </h1>
        </header>
        <main>{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
} 