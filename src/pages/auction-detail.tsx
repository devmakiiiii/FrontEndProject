import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { useCountdown } from '@/hooks/use-countdown';
import { BidForm } from '@/components/bid-form';
import { BidHistory } from '@/components/bid-history';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bid, Auction } from '@/lib/types';
import { api } from '@/lib/api';

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auctions, isAuthenticated, currentUser, getBidsForAuction } = useAuction();
  const [refreshKey, setRefreshKey] = useState(0);
  const [bids, setBids] = useState<Bid[]>([]);
  const [auctionData, setAuctionData] = useState<Auction | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (id) {
      getBidsForAuction(id).then(setBids);
    }
  }, [id, getBidsForAuction]);

  // If auction not in list, fetch it directly
  useEffect(() => {
    if (id && !auctions.find(a => a.id === id) && !auctionData) {
      api.getAuction(id).then(data => {
        if (data?.auction) {
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
            status: data.auction.status || 'active',
            bidCount: data.auction.bidCount || 0,
            winningBidderId: data.auction.winning_bidder_id,
            paymentStatus: data.auction.payment_status,
          };
          setAuctionData(transformed);
        }
      }).catch(console.error);
    }
  }, [id, auctions, auctionData]);

  const auction = auctions.find(a => a.id === id) || auctionData;

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

  const { formattedTime, isEnded } = useCountdown(auction.endTime);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <Button variant="outline" onClick={() => navigate('/')}>← Back</Button>

      <div key={refreshKey} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="overflow-hidden">
            <img
              src={auction.image || 'https://placehold.co/600x600?text=No+Image'}
              alt={auction.title}
              className="w-full aspect-square object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image';
              }}
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
                <span className="font-semibold">{formattedTime}</span>
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
            <p className="text-lg font-semibold">
              {(auction.sellerFirstname?.trim() || auction.sellerLastname?.trim())
                ? `${auction.sellerFirstname} ${auction.sellerLastname}`.trim()
                : auction.sellerId || 'Unknown Seller'}
            </p>
          </Card>

{/* Bid Form */}
           {auction.status === 'active' && !isEnded && currentUser?.id !== auction.sellerId && (
             <BidForm
               auction={auction}
               onBidSuccess={() => setRefreshKey(prev => prev + 1)}
             />
           )}

{/* Payment Section - shows when auction ended and user won */}
            {(auction.status === 'ended' || isEnded) && currentUser && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                {(() => {
                  // Determine if current user is the winner
                  // If winningBidderId is set, check against it
                  // Otherwise, check if user has any bid that matches currentBid (indicating they're the highest bidder)
                  const userBidsList = bids.filter(b => b.bidderId === currentUser.id);
                  const userHighestBid = userBidsList.length > 0 
                    ? Math.max(...userBidsList.map(b => b.amount)) 
                    : 0;
                  
                  const isWinner = auction.winningBidderId 
                    ? auction.winningBidderId === currentUser.id 
                    : userHighestBid >= auction.currentBid;
                  
                  if (isWinner) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 10c0 5.523 4.477 10 10 10z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary">Congratulations! You won!</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              You're the highest bidder for this auction.
                            </p>
                          </div>
                        </div>
                        
                        {(!auction.paymentStatus || auction.paymentStatus === 'pending') && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Total amount due: <span className="font-bold text-foreground">${auction.currentBid}</span>
                            </p>
                            <Button 
                              className="w-full" 
                              onClick={() => navigate(`/payment/${auction.id}`)}
                            >
                              Complete Payment
                            </Button>
                          </div>
                        )}
                        
                        {auction.paymentStatus === 'paid' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Payment completed</span>
                          </div>
                        )}
                        
                        {auction.paymentStatus === 'failed' && (
                          <div>
                            <p className="text-sm text-destructive mb-3">
                              Payment failed. Please try again.
                            </p>
                            <Button 
                              variant="outline"
                              className="w-full" 
                              onClick={() => navigate(`/payment/${auction.id}`)}
                            >
                              Retry Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return <p className="text-muted-foreground">This auction has ended.</p>;
                })()}
              </Card>
            )}

           {/* Bid History */}
           <BidHistory auctionId={auction.id} />
        </div>
      </div>
    </main>
  );
}