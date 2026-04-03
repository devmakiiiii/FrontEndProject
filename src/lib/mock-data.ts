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
  status: 'active' | 'ended' | 'pending';
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
  name: string;
  email: string;
  avatar: string;
  reputation: number;
}

// Mock users
export const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'John Collector',
    email: 'john@example.com',
    avatar: 'JC',
    reputation: 98,
  },
  'user-2': {
    id: 'user-2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    avatar: 'SS',
    reputation: 95,
  },
  'user-3': {
    id: 'user-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: 'MJ',
    reputation: 87,
  },
  'current': {
    id: 'current',
    name: 'You',
    email: 'you@example.com',
    avatar: 'YU',
    reputation: 92,
  },
};

// Mock auctions
export const mockAuctions: Auction[] = [
  {
    id: 'auction-1',
    title: 'Vintage Film Camera Collection',
    description: 'Rare vintage cameras from the 1970s and 1980s in excellent condition.',
    category: 'Collectibles',
    currentBid: 450,
    startingBid: 100,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
    seller: 'John Collector',
    sellerId: 'user-1',
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active',
    bidCount: 12,
  },
  {
    id: 'auction-2',
    title: 'Luxury Swiss Watch',
    description: 'Pre-owned luxury chronograph with original papers and box.',
    category: 'Jewelry & Watches',
    currentBid: 1200,
    startingBid: 500,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop',
    seller: 'Sarah Smith',
    sellerId: 'user-2',
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    status: 'active',
    bidCount: 18,
  },
  {
    id: 'auction-3',
    title: 'Art Deco Furniture Set',
    description: 'Beautiful 1920s art deco furniture restored to original condition.',
    category: 'Furniture',
    currentBid: 800,
    startingBid: 300,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    seller: 'Mike Johnson',
    sellerId: 'user-3',
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active',
    bidCount: 8,
  },
  {
    id: 'auction-4',
    title: 'First Edition Book Set',
    description: 'Complete collection of signed first editions by renowned authors.',
    category: 'Books & Media',
    currentBid: 350,
    startingBid: 100,
    image: 'https://images.unsplash.com/photo-150784272343-583f20270319?w=400&h=300&fit=crop',
    seller: 'John Collector',
    sellerId: 'user-1',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active',
    bidCount: 5,
  },
  {
    id: 'auction-5',
    title: 'Classic Vinyl Record Collection',
    description: 'Curated collection of classic jazz and rock records, mint condition.',
    category: 'Music & Audio',
    currentBid: 280,
    startingBid: 50,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
    seller: 'Sarah Smith',
    sellerId: 'user-2',
    endTime: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    status: 'active',
    bidCount: 14,
  },
  {
    id: 'auction-6',
    title: 'Limited Edition Sneakers',
    description: 'Rare limited edition sneakers from exclusive collaboration, unworn.',
    category: 'Fashion & Accessories',
    currentBid: 520,
    startingBid: 200,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    seller: 'Mike Johnson',
    sellerId: 'user-3',
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    status: 'active',
    bidCount: 22,
  },
];

// Mock bids for each auction
export const mockBids: Record<string, Bid[]> = {
  'auction-1': [
    { id: 'bid-1', auctionId: 'auction-1', bidderId: 'user-3', bidderName: 'Mike Johnson', amount: 100, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    { id: 'bid-2', auctionId: 'auction-1', bidderId: 'user-2', bidderName: 'Sarah Smith', amount: 150, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) },
    { id: 'bid-3', auctionId: 'auction-1', bidderId: 'current', bidderName: 'You', amount: 200, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'bid-4', auctionId: 'auction-1', bidderId: 'user-3', bidderName: 'Mike Johnson', amount: 250, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { id: 'bid-5', auctionId: 'auction-1', bidderId: 'user-2', bidderName: 'Sarah Smith', amount: 350, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { id: 'bid-6', auctionId: 'auction-1', bidderId: 'current', bidderName: 'You', amount: 450, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  ],
  'auction-2': [
    { id: 'bid-7', auctionId: 'auction-2', bidderId: 'user-1', bidderName: 'John Collector', amount: 500, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'bid-8', auctionId: 'auction-2', bidderId: 'user-3', bidderName: 'Mike Johnson', amount: 700, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { id: 'bid-9', auctionId: 'auction-2', bidderId: 'current', bidderName: 'You', amount: 1000, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { id: 'bid-10', auctionId: 'auction-2', bidderId: 'user-1', bidderName: 'John Collector', amount: 1200, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  ],
  'auction-3': [
    { id: 'bid-11', auctionId: 'auction-3', bidderId: 'user-2', bidderName: 'Sarah Smith', amount: 300, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    { id: 'bid-12', auctionId: 'auction-3', bidderId: 'user-1', bidderName: 'John Collector', amount: 500, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'bid-13', auctionId: 'auction-3', bidderId: 'current', bidderName: 'You', amount: 800, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  ],
  'auction-4': [
    { id: 'bid-14', auctionId: 'auction-4', bidderId: 'user-3', bidderName: 'Mike Johnson', amount: 100, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    { id: 'bid-15', auctionId: 'auction-4', bidderId: 'current', bidderName: 'You', amount: 200, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'bid-16', auctionId: 'auction-4', bidderId: 'user-2', bidderName: 'Sarah Smith', amount: 250, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { id: 'bid-17', auctionId: 'auction-4', bidderId: 'user-1', bidderName: 'John Collector', amount: 350, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  ],
  'auction-5': [
    { id: 'bid-18', auctionId: 'auction-5', bidderId: 'user-1', bidderName: 'John Collector', amount: 50, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    { id: 'bid-19', auctionId: 'auction-5', bidderId: 'user-3', bidderName: 'Mike Johnson', amount: 120, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) },
    { id: 'bid-20', auctionId: 'auction-5', bidderId: 'current', bidderName: 'You', amount: 180, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'bid-21', auctionId: 'auction-5', bidderId: 'user-2', bidderName: 'Sarah Smith', amount: 280, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
  ],
  'auction-6': [
    { id: 'bid-22', auctionId: 'auction-6', bidderId: 'user-2', bidderName: 'Sarah Smith', amount: 200, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 'bid-23', auctionId: 'auction-6', bidderId: 'user-3', bidderName: 'Mike Johnson', amount: 300, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { id: 'bid-24', auctionId: 'auction-6', bidderId: 'user-1', bidderName: 'John Collector', amount: 400, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { id: 'bid-25', auctionId: 'auction-6', bidderId: 'current', bidderName: 'You', amount: 520, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
  ],
};