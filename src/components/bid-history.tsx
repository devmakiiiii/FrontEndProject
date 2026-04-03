import { useAuction } from '@/lib/auction-context';
import { Card } from '@/components/ui/card';

interface BidHistoryProps {
  auctionId: string;
}

export function BidHistory({ auctionId }: BidHistoryProps) {
  const { getBidsForAuction } = useAuction();
  const bids = getBidsForAuction(auctionId);
  const sortedBids = [...bids].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (sortedBids.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Bid History</h3>
        <p className="text-sm text-muted-foreground">No bids yet. Be the first to bid!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Bid History</h3>
      <div className="space-y-3">
        {sortedBids.map((bid, index) => (
          <div key={bid.id} className="flex items-start justify-between pb-3 last:pb-0 border-b last:border-0">
            <div className="space-y-1">
              <p className="text-sm font-medium">{bid.bidderName}</p>
              <p className="text-xs text-muted-foreground">{formatTime(bid.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">${bid.amount}</p>
              {index === 0 && (
                <p className="text-xs text-green-600 font-medium">Leading</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
