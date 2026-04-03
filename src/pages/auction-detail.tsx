import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { BidForm } from '@/components/bid-form';
import { BidHistory } from '@/components/bid-history';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auctions, isAuthenticated } = useAuction();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const auction = auctions.find(a => a.id === id);

  if (!isAuthenticated) {
    return null;
  }

  if (!auction) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Auction Not Found</h1>
          <p className="text-muted-foreground">The auction you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => navigate('/')}>Back to Auctions</Button>
        </div>
      </main>
    );
  }

  const timeLeft = Math.ceil((auction.endTime.getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <Button variant="outline" onClick={() => navigate('/')}>← Back</Button>

      <div key={refreshKey} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="overflow-hidden">
            <img
              src={auction.image}
              alt={auction.title}
              className="w-full aspect-square object-cover"
            />
          </Card>

          {/* Status */}
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {auction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time Left</span>
                <span className="font-semibold">{timeLeft}h</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Category */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{auction.category}</p>
            <h1 className="text-3xl font-bold">{auction.title}</h1>
            <p className="text-muted-foreground">{auction.description}</p>
          </div>

          {/* Bid Information */}
          <Card className="p-6 bg-muted space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Bid</p>
              <p className="text-3xl font-bold text-primary">${auction.currentBid}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Starting Bid</p>
                <p className="font-semibold">${auction.startingBid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bids</p>
                <p className="font-semibold">{auction.bidCount}</p>
              </div>
            </div>
          </Card>

          {/* Seller Information */}
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Seller</p>
            <p className="text-lg font-semibold">{auction.seller}</p>
          </Card>

          {/* Bid Form */}
          {auction.status === 'active' && (
            <BidForm
              auction={auction}
              onBidSuccess={() => setRefreshKey(prev => prev + 1)}
            />
          )}

          {/* Bid History */}
          <BidHistory auctionId={auction.id} />
        </div>
      </div>
    </main>
  );
}