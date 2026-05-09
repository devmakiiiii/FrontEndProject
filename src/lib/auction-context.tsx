import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auction, Bid, User } from './mock-data';
import { api } from './api';
import { toast } from 'sonner';

interface AuctionContextType {
  auctions: Auction[];
  bids: Record<string, Bid[]>;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (data: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    confirmpassword: string;
    mobilenumber: string;
  }) => Promise<boolean>;
  logout: () => void;
  placeBid: (auctionId: string, amount: number) => Promise<boolean>;
  createAuction: (auctionData: {
    title: string;
    description: string;
    category_id: string;
    starting_price: number;
    end_time: string;
    images?: File[];
  }) => Promise<boolean>;
  getBidsForAuction: (auctionId: string) => Promise<Bid[]>;
  getUserListings: () => Auction[];
  getUserBids: () => Promise<Bid[]>;
  getHighestBidder: (auctionId: string) => Promise<Bid | null>;
  refreshAuctions: () => Promise<void>;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

function transformAuction(backendAuction: any): Auction {
  return {
    id: String(backendAuction.id),
    title: backendAuction.title,
    description: backendAuction.description || '',
    category: backendAuction.category || 'Uncategorized',
    currentBid: Number(backendAuction.current_price || backendAuction.currentBid || 0),
    startingBid: Number(backendAuction.starting_price || backendAuction.startingBid || 0),
    image: backendAuction.image_url || backendAuction.image || '',
    seller: backendAuction.seller || '',
    sellerId: String(backendAuction.seller_id || backendAuction.sellerId || ''),
    endTime: backendAuction.end_time ? new Date(backendAuction.end_time) : new Date(),
    status: backendAuction.status || 'active',
    bidCount: backendAuction.bidCount || 0,
  };
}

function transformBid(backendBid: any): Bid {
  return {
    id: String(backendBid.id),
    auctionId: String(backendBid.auction_id),
    bidderId: String(backendBid.bidder_id || backendBid.bidderId || ''),
    bidderName: backendBid.bidderName || backendBid.bidder_name || '',
    amount: Number(backendBid.amount),
    timestamp: backendBid.timestamp ? new Date(backendBid.timestamp) : new Date(backendBid.created_at || Date.now()),
  };
}

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Record<string, Bid[]>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.getProfile();
        setCurrentUser({
          id: profile.id,
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
          role: profile.role,
          avatar: profile.firstname?.charAt(0).toUpperCase() || 'U',
        });
      } catch (error) {
        api.removeToken();
      }
      setIsLoading(false);
    };

    const fetchAuctions = async () => {
      try {
        const data = await api.getAuctions();
        setAuctions(data.auctions.map(transformAuction));
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
      }
    };

    fetchAuctions();
    if (api.getToken()) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(username, password);
      api.setToken(response.token);
      const profile = await api.getProfile();
      setCurrentUser({
        id: profile.id,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        role: profile.role,
        avatar: profile.firstname?.charAt(0).toUpperCase() || 'U',
      });
      return true;
    } catch (error: any) {
      toast.error(error?.data?.error || 'Login failed');
      return false;
    }
  };

const signup = async (data: {
     firstname: string;
     lastname: string;
     username: string;
     email: string;
     password: string;
     confirmpassword: string;
     mobilenumber: string;
   }): Promise<boolean> => {
     try {
       await api.signup(data);
       toast.success('Account created successfully! Please log in.');
       return true;
     } catch (error: any) {
       const errorMsg = error?.data?.error || error?.message || 'Signup failed';
       toast.error(errorMsg);
       return false;
     }
   };

  const logout = (): void => {
    api.removeToken();
    setCurrentUser(null);
  };

  const placeBid = async (auctionId: string, amount: number): Promise<boolean> => {
    if (!currentUser) return false;
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || amount <= auction.currentBid) {
      toast.error('Bid must be higher than current bid');
      return false;
    }

    try {
      await api.placeBid(auctionId, amount);
      setAuctions(prev => prev.map(a =>
        a.id === auctionId ? { ...a, currentBid: amount } : a
      ));
      toast.success(`Bid of $${amount} placed successfully!`);
      return true;
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to place bid');
      return false;
    }
  };

  const createAuction = async (auctionData: {
    title: string;
    description: string;
    category_id: string;
    starting_price: number;
    end_time: string;
    images?: File[];
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const formData = new FormData();
      formData.append('title', auctionData.title);
      formData.append('description', auctionData.description);
      formData.append('category_id', auctionData.category_id);
      formData.append('starting_price', String(auctionData.starting_price));
      formData.append('end_time', auctionData.end_time);
      formData.append('bid_increment', '1.00');

      if (auctionData.images) {
        auctionData.images.forEach((file, i) => {
          formData.append(`images[${i}]`, file);
        });
      }

      await api.createAuction(formData);
      toast.success('Auction created successfully!');
      await refreshAuctions();
      return true;
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to create auction');
      return false;
    }
  };

  const getBidsForAuction = async (auctionId: string): Promise<Bid[]> => {
    try {
      const data = await api.getAuction(auctionId);
      const transformedBids = data.bids.map(transformBid);
      setBids(prev => ({ ...prev, [auctionId]: transformedBids }));
      return transformedBids;
    } catch (error) {
      return bids[auctionId] || [];
    }
  };

  const getUserListings = (): Auction[] => {
    return auctions.filter(a => a.sellerId === currentUser?.id);
  };

  const getUserBids = async (): Promise<Bid[]> => {
    const allBids: Bid[] = [];
    for (const auctionId of Object.keys(bids)) {
      if (bids[auctionId]) {
        allBids.push(...bids[auctionId].filter(b => b.bidderId === currentUser?.id));
      }
    }
    return allBids;
  };

  const getHighestBidder = async (auctionId: string): Promise<Bid | null> => {
    const auctionBids = await getBidsForAuction(auctionId);
    if (auctionBids.length === 0) return null;
    return auctionBids.reduce((highest, current) =>
      current.amount > highest.amount ? current : highest
    );
  };

  const refreshAuctions = async () => {
    try {
      const data = await api.getAuctions();
      setAuctions(data.auctions.map(transformAuction));
    } catch (error) {
      console.error('Failed to refresh auctions:', error);
    }
  };

  return (
    <AuctionContext.Provider value={{
      auctions,
      bids,
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      signup,
      logout,
      placeBid,
      createAuction,
      getBidsForAuction,
      getUserListings,
      getUserBids,
      getHighestBidder,
      refreshAuctions,
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within AuctionProvider');
  }
  return context;
}