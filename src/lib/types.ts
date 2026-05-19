export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  currentBid: number;
  startingBid: number;
  image: string;
  sellerFirstname: string;
  sellerLastname: string;
  sellerId: string;
  endTime: Date;
  status: 'active' | 'ended' | 'sold' | 'pending';
  bidCount: number;
  winningBidderId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  avatar: string;
}