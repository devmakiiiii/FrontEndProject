import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuctionProvider } from '@/lib/auction-context';
import { Navigation } from '@/components/navigation';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import BrowsePage from '@/pages/browse';
import AuctionDetailPage from '@/pages/auction-detail';
import MyListingsPage from '@/pages/my-listings';
import MyBidsPage from '@/pages/my-bids';
import ProfilePage from '@/pages/profile';
import './index.css';
import CreateAuctionPage from './pages/create-auction';
import { Toaster } from '@/components/ui/sonner';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showNavigation = !['/login', '/signup'].includes(location.pathname);
  
  return (
    <>
      {showNavigation && <Navigation />}
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuctionProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<BrowsePage />} />
            <Route path="/auction/:id" element={<AuctionDetailPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/my-bids" element={<MyBidsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/create-auction" element={<CreateAuctionPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </AuctionProvider>
    </BrowserRouter>
  );
}

export default App;