import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { AuctionGrid } from '@/components/auction-grid';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, getUserListings } = useAuction();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const listings = getUserListings();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-balance">
          My Listings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your auction listings
        </p>
      </div>

      <AuctionGrid
        auctions={listings}
        emptyMessage="You haven't listed any auctions yet."
      />
    </main>
  );
}