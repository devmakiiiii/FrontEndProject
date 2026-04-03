import { Auction } from '@/lib/mock-data';
import { AuctionCard } from './auction-card';

interface AuctionGridProps {
  auctions: Auction[];
  emptyMessage?: string;
}

export function AuctionGrid({ auctions, emptyMessage = 'No auctions found.' }: AuctionGridProps) {
  if (auctions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} />
      ))}
    </div>
  );
}
