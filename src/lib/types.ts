export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  currentBid: number;
  startingBid: number;
  image: string;
  seller: string;
  sellerId: string;
  endTime: Date;
  status: 'active' | 'ended' | 'sold' | 'pending';
  bidCount: number;
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