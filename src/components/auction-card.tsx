import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Auction } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuction } from '@/lib/auction-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const { placeBid } = useAuction();
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState(0);

  const timeLeft = Math.ceil((auction.endTime.getTime() - Date.now()) / (1000 * 60 * 60));
  const isEnding = timeLeft < 24;
  const minBid = auction.currentBid + 1;

  const handleBidClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowBidModal(true);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(bidAmount);

    if (!bidAmount || isNaN(amount)) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (amount < minBid) {
      setError(`Bid must be at least $${minBid}`);
      return;
    }

    setPendingBidAmount(amount);
    setShowConfirmation(true);
  };

  const handleConfirmBid = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      if (placeBid(auction.id, pendingBidAmount)) {
        setSuccess(`Bid placed for $${pendingBidAmount}!`);
        setBidAmount('');
        setError('');
        setShowConfirmation(false);
        setShowBidModal(false);
        setIsSubmitting(false);
        setPendingBidAmount(0);

        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to place bid. Please try again.');
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <>
    <Link to={`/auction/${auction.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={auction.image}
            alt={auction.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {auction.category}
            </p>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {auction.title}
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Current Bid</p>
              <p className="text-lg font-bold text-primary">
                ${auction.currentBid}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{auction.bidCount} bids</span>
              <span className={`font-medium ${isEnding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {timeLeft}h left
              </span>
            </div>
          </div>

          {auction.status === 'active' && (
            <button
              onClick={handleBidClick}
              className="w-full mt-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Place Bid
            </button>
          )}
        </div>
      </Card>
    </Link>

    <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            {auction.title}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Bid</span>
                <span className="font-medium">${auction.currentBid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minimum Bid</span>
                <span className="font-medium">${minBid}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Bid Amount</label>
              <div className="flex gap-2">
                <span className="px-3 py-2 bg-muted rounded-md text-sm">$</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`${minBid}`}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  step="0.01"
                  min={minBid}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBidModal(false);
                  setBidAmount('');
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitBid} className="flex-1">
                Continue to Review
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Bid</DialogTitle>
          <DialogDescription>
            Please review your bid before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Item</span>
              <span className="text-sm font-medium line-clamp-1">{auction.title}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm text-muted-foreground">Your Bid</span>
              <span className="text-lg font-bold text-primary">${pendingBidAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Bid</span>
              <span className="text-sm">${auction.currentBid}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            By confirming, you agree to purchase this item if you win the auction.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirmation(false);
              setBidAmount('');
            }}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmBid}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing...' : 'Confirm Bid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}