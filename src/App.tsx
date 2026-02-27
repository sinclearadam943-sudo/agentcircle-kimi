import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const RoleDetailPage = lazy(() => import('./pages/RoleDetailPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const WikiPage = lazy(() => import('./pages/WikiPage'));
const WestworldPage = lazy(() => import('./pages/WestworldPage'));

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  if (!isLoaded) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/roles" element={<RolesPage />} />
                <Route path="/roles/:roleId" element={<RoleDetailPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/wiki" element={<WikiPage />} />
                <Route path="/westworld" element={<WestworldPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
