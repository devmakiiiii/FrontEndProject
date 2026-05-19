import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { PaymentForm } from '@/components/payment-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Auction } from '@/lib/types';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stripePromise = getStripe();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await api.getAuction(id!);
        const raw = data.auction;
        const transformed: Auction = {
          id: String(raw.id),
          title: raw.title || '',
          description: raw.description || '',
          category: raw.category || 'Uncategorized',
          currentBid: Number(raw.current_price || raw.currentBid || 0),
          startingBid: Number(raw.starting_price || raw.startingBid || 0),
          image: raw.image_url || raw.image || '',
          sellerFirstname: raw.seller?.firstname || raw.firstname || '',
          sellerLastname: raw.seller?.lastname || raw.lastname || '',
          sellerId: String(raw.seller_id || raw.sellerId || ''),
          endTime: raw.end_time ? new Date(raw.end_time) : new Date(),
          status: raw.status || 'ended',
          bidCount: raw.bidCount || 0,
          winningBidderId: raw.winning_bidder_id || raw.winningBidderId || undefined,
          paymentStatus: raw.payment_status || raw.paymentStatus || undefined,
        };
        setAuction(transformed);
      } catch (error) {
        console.error('Failed to fetch auction:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAuction();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Auction not found</p>
      </div>
    );
  }

  const amount = auction.currentBid || 0;

  if (!stripePromise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Stripe payment is not configured. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/auction/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Auction
      </Button>

      <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">{auction.title}</h2>
        <div className="flex justify-between py-2 border-b">
          <span>Total Amount</span>
          <span className="font-bold">${amount}</span>
        </div>
        {auction.paymentStatus === 'paid' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Payment already completed</span>
          </div>
        )}
      </Card>

      {auction.paymentStatus !== 'paid' && (
        <Elements stripe={stripePromise!}>
          <PaymentForm
            auctionId={id!}
            amount={Number(amount)}
            onSuccess={() => navigate(`/auction/${id}`)}
            onCancel={() => navigate(`/auction/${id}`)}
          />
        </Elements>
      )}
    </div>
  );
}