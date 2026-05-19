import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { Bid } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Auction } from '@/lib/types';

export default function MyBidsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, getUserBids, auctions } = useAuction();
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAuctions, setBidAuctions] = useState<Record<string, Auction>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
    if (isAuthenticated) {
      getUserBids().then(async (userBids) => {
        setBids(userBids);
        // Fetch auction data for each bid to ensure we have ended auctions
        const auctionData: Record<string, Auction> = {};
        for (const bid of userBids) {
          if (!auctions.find(a => a.id === bid.auctionId)) {
            try {
              const data = await api.getAuction(bid.auctionId);
              if (data?.auction) {
                // Transform the data similar to how context does it
                const transformed: Auction = {
                  id: String(data.auction.id),
                  title: data.auction.title || '',
                  description: data.auction.description || '',
                  category: data.auction.category || 'Uncategorized',
                  currentBid: Number(data.auction.current_price || data.auction.currentBid || 0),
                  startingBid: Number(data.auction.starting_price || data.auction.startingBid || 0),
                  image: data.auction.image_url || data.auction.image || '',
                  sellerFirstname: data.auction.seller?.firstname || data.auction.firstname || '',
                  sellerLastname: data.auction.seller?.lastname || data.auction.lastname || '',
                  sellerId: String(data.auction.seller_id || data.auction.sellerId || ''),
                  endTime: data.auction.end_time ? new Date(data.auction.end_time) : new Date(),
                  status: data.auction.status || 'ended',
                  bidCount: data.auction.bidCount || 0,
                  winningBidderId: data.auction.winning_bidder_id,
                  paymentStatus: data.auction.payment_status,
                };
                auctionData[bid.auctionId] = transformed;
              }
            } catch (e) {
              console.error(`Failed to fetch auction ${bid.auctionId}:`, e);
            }
          }
        }
        setBidAuctions(auctionData);
      });
    }
  }, [isLoading, isAuthenticated, getUserBids, auctions]);

  const sortedBids = useMemo(() => [...bids].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), [bids]);

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

  const formatCountdown = (endTime: Date) => {
    const ms = Math.max(0, endTime.getTime() - Date.now());
    if (ms <= 0) return 'Ended';

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
        <div className="text-center py-12">Loading your bids...</div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
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
        <div className="space-y-6">
          {sortedBids.map((bid) => {
            const auction = auctions.find(a => a.id === bid.auctionId) || bidAuctions[bid.auctionId];
            const countdown = auction ? formatCountdown(auction.endTime) : 'N/A';
            const isEnded = auction ? new Date() > auction.endTime : false;
            
            return (
              <Card key={bid.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <img
                      src={auction?.image || 'https://placehold.co/300x200?text=No+Image'}
                      alt={auction?.title || 'Auction'}
                      className="w-full aspect-video object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/300x200?text=No+Image';
                      }}
                    />
                  </div>
                  
                  <div className="md:col-span-3 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{auction?.category}</p>
                        <Link to={`/auction/${bid.auctionId}`} className="text-xl font-semibold hover:underline">
                          {auction?.title || 'Unknown Auction'}
                        </Link>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${bid.amount}</p>
                        <p className="text-xs text-muted-foreground">Your bid</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {auction?.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="font-semibold">${auction?.currentBid ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Starting Bid</p>
                        <p className="font-semibold">${auction?.startingBid ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Bids</p>
                        <p className="font-semibold">{auction?.bidCount ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time Left</p>
                        <p className="font-semibold">
                          {auction ? (isEnded ? 'Ended' : countdown) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Seller</p>
                          <p className="text-sm font-medium">
                            {auction?.sellerFirstname || auction?.sellerLastname
                              ? `${auction?.sellerFirstname} ${auction?.sellerLastname}`.trim()
                              : auction?.sellerId || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          {auction ? (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              bid.amount >= auction.currentBid
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {bid.amount >= auction.currentBid ? 'Leading' : `Outbid (current: $${auction.currentBid})`}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </div>
<div className="text-right">
                         <p className="text-xs text-muted-foreground">Bid placed {formatTime(bid.timestamp)}</p>
                         <div className="flex gap-2 mt-1">
                           <Button asChild variant="outline" size="sm">
                             <Link to={`/auction/${bid.auctionId}`}>View Auction</Link>
                           </Button>
                           {auction && isEnded && bid.amount >= auction.currentBid && (!auction.paymentStatus || auction.paymentStatus === 'pending') && (
                             <Button asChild size="sm">
                               <Link to={`/payment/${bid.auctionId}`}>Pay Now</Link>
                             </Button>
                           )}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}