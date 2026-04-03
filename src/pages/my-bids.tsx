import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { Card } from '@/components/ui/card';

export default function MyBidsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, getUserBids, auctions } = useAuction();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const bids = getUserBids();
  const sortedBids = [...bids].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-balance">
          My Bids
        </h1>
        <p className="text-lg text-muted-foreground">
          Track all your bids across auctions
        </p>
      </div>

      {sortedBids.length === 0 ? (
        <div className="flex items-center justify-center min-h-64 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">You haven't placed any bids yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBids.map((bid) => {
            const auction = auctions.find(a => a.id === bid.auctionId);
            return (
              <Link key={bid.id} to={`/auction/${bid.auctionId}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{auction?.title || 'Unknown Auction'}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(bid.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">${bid.amount}</p>
                      {auction && (
                        <p className="text-xs text-muted-foreground">
                          {bid.amount >= auction.currentBid ? (
                            <span className="text-green-600 font-medium">Leading</span>
                          ) : (
                            <span>Outbid (current: ${auction.currentBid})</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}