import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { AuctionGrid } from '@/components/auction-grid';

export default function BrowsePage() {
  const navigate = useNavigate();
  const { auctions, isAuthenticated } = useAuction();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const activeAuctions = auctions.filter(a => a.status === 'active');

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-balance">
          Browse Auctions
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover and bid on amazing items from sellers worldwide
        </p>
      </div>

      <AuctionGrid
        auctions={activeAuctions}
        emptyMessage="No active auctions at the moment."
      />
    </main>
  );
}