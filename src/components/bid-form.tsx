import { useState } from 'react';
import { useAuction } from '@/lib/auction-context';
import { Auction } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BidFormProps {
  auction: Auction;
  onBidSuccess?: () => void;
}

export function BidForm({ auction, onBidSuccess }: BidFormProps) {
  const { placeBid } = useAuction();
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState(0);

  const minBid = auction.currentBid + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
    
    // Simulate small delay for better UX
    setTimeout(() => {
      if (placeBid(auction.id, pendingBidAmount)) {
        setSuccess(`Bid placed for $${pendingBidAmount}!`);
        setBidAmount('');
        setPendingBidAmount(0);
        setShowConfirmation(false);
        setIsSubmitting(false);
        onBidSuccess?.();
      } else {
        setError('Failed to place bid. Please try again.');
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <>
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Current Bid</p>
        <p className="text-3xl font-bold text-primary">${auction.currentBid}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Bid</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Minimum: $${minBid}`}
                disabled={isSubmitting}
                className="w-full pl-7 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Minimum bid: ${minBid}</p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || auction.status !== 'active'}
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground">
        <p>By bidding, you agree to buy this item if you win the auction.</p>
      </div>
    </Card>

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
              <span className="text-sm font-medium">{auction.title}</span>
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
            onClick={() => setShowConfirmation(false)}
            disabled={isSubmitting}
          >
            Cancel
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
