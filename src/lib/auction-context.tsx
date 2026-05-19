import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auction, Bid, User } from './types';
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
  updateAuction: (auctionId: string, auctionData: {
    title: string;
    description: string;
    category_id: string;
    starting_price: number;
    end_time: string;
    images?: File[];
  }) => Promise<boolean>;
  deleteAuction: (auctionId: string) => Promise<boolean>;
  getBidsForAuction: (auctionId: string) => Promise<Bid[]>;
  getUserListings: () => Auction[];
  getUserBids: () => Promise<Bid[]>;
  getHighestBidder: (auctionId: string) => Promise<Bid | null>;
  refreshAuctions: () => Promise<void>;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

function transformAuction(backendAuction: any): Auction {
  let imageUrl = null;

  // Debug logging - remove in production
  console.log('transformAuction - raw image_url:', backendAuction.image_url, 'images:', backendAuction.images);

  if (backendAuction.images && Array.isArray(backendAuction.images) && backendAuction.images.length > 0) {
    const firstImage = backendAuction.images[0];
    if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    } else if (firstImage && typeof firstImage === 'object') {
      imageUrl = firstImage.url || firstImage.path || firstImage.image_url || null;
    }
  } else if (backendAuction.image_url) {
    imageUrl = backendAuction.image_url;
  } else if (backendAuction.image) {
    imageUrl = backendAuction.image;
  }

  let fullImageUrl = '';
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
    fullImageUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  console.log('transformAuction - imageUrl:', imageUrl, '-> fullImageUrl:', fullImageUrl);

  // Additional validation: check if the returned image_url might be JSON string
  if (typeof backendAuction.image_url === 'string' && backendAuction.image_url.startsWith('[')) {
    console.warn('image_url column contains JSON array, attempting to parse:', backendAuction.image_url);
    try {
      const parsed = JSON.parse(backendAuction.image_url);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        const fixedUrl = parsed[0];
        fullImageUrl = fixedUrl.startsWith('http') ? fixedUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${fixedUrl.startsWith('/') ? '' : '/'}${fixedUrl}`;
        console.log('Fixed fullImageUrl from JSON in image_url:', fullImageUrl);
      }
    } catch (e) {
      console.error('Failed to parse image_url as JSON:', e);
    }
  }

  return {
    id: String(backendAuction.id),
    title: backendAuction.title,
    description: backendAuction.description || '',
    category: backendAuction.category || 'Uncategorized',
    currentBid: Number(backendAuction.current_price || backendAuction.currentBid || 0),
    startingBid: Number(backendAuction.starting_price || backendAuction.startingBid || 0),
    image: fullImageUrl,
    sellerFirstname: backendAuction.seller?.firstname || backendAuction.firstname || backendAuction.seller_firstname || '',
    sellerLastname: backendAuction.seller?.lastname || backendAuction.lastname || backendAuction.seller_lastname || '',
    sellerId: String(backendAuction.seller_id || backendAuction.sellerId || ''),
    endTime: backendAuction.end_time ? new Date(backendAuction.end_time) : new Date(),
    status: backendAuction.status || 'active',
    bidCount: backendAuction.bidCount || 0,
    winningBidderId: backendAuction.winning_bidder_id || backendAuction.winningBidderId || undefined,
    paymentStatus: backendAuction.payment_status || backendAuction.paymentStatus || undefined,
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
          id: String(profile.id),
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
          role: profile.role,
          avatar: profile.firstname?.charAt(0).toUpperCase() || 'U',
        });
      } catch (error: any) {
        if (error.status === 401) {
          api.removeToken();
          setCurrentUser(null);
        } else {
          console.error('Failed to fetch profile:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAuctions = async () => {
      try {
        const data = await api.getAuctions();
        setAuctions(data.auctions.map(transformAuction));
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
        toast.error('Failed to load auctions. Please check your connection.');
        setAuctions([]);
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
        id: String(profile.id),
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

        const response = await api.createAuction(formData) as any;
        if (response?.auction) {
          const transformedAuction = transformAuction(response.auction);
          setAuctions(prev => [...prev, transformedAuction]);
        } else {
          await refreshAuctions();
        }
        toast.success('Auction created successfully!');
        return true;
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to create auction');
        return false;
      }
    };

const updateAuction = async (auctionId: string, auctionData: {
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
        formData.append('_method', 'PUT');

        if (auctionData.images) {
          auctionData.images.forEach((file, i) => {
            formData.append(`images[${i}]`, file);
          });
        }

        const response = await api.updateAuction(auctionId, formData) as any;
        if (response?.auction) {
          const transformedAuction = transformAuction(response.auction);
          setAuctions(prev => prev.map(a => a.id === auctionId ? transformedAuction : a));
        } else {
          await refreshAuctions();
        }
        toast.success('Auction updated successfully!');
        return true;
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to update auction');
        return false;
      }
    };

    const deleteAuction = async (auctionId: string): Promise<boolean> => {
      if (!currentUser) return false;

      try {
        await api.deleteAuction(auctionId);
        setAuctions(prev => prev.filter(a => a.id !== auctionId));
        toast.success('Auction deleted successfully!');
        return true;
      } catch (error: any) {
        toast.error(error?.data?.error || 'Failed to delete auction');
        return false;
      }
    };

   const getBidsForAuction = async (auctionId: string): Promise<Bid[]> => {
    try {
      const data = await api.getAuction(auctionId);
      const transformedBids = data.bids?.map(transformBid) || [];
      setBids(prev => ({ ...prev, [auctionId]: transformedBids }));
      return transformedBids;
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      return [];
    }
  };

  const getUserListings = (): Auction[] => {
    return auctions.filter(a => a.sellerId === currentUser?.id);
  };

  const getUserBids = async (): Promise<Bid[]> => {
    if (!currentUser) return [];

    try {
      const data = await api.getUserBids();
      return data.bids.map(transformBid);
    } catch (error) {
      console.error('Failed to fetch user bids:', error);
      return [];
    }
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
      const transformed = data.auctions.map(transformAuction);
      setAuctions(prev => {
        const seen = new Set(transformed.map(a => a.id));
        const filteredPrev = prev.filter(a => !seen.has(a.id));
        return [...filteredPrev, ...transformed];
      });
    } catch (error) {
      console.error('Failed to refresh auctions:', error);
      toast.error('Failed to refresh auctions.');
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
        updateAuction,
        deleteAuction,
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