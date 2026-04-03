'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Auction, Bid, User, mockAuctions, mockBids, mockUsers } from './mock-data';

interface AuctionContextType {
  auctions: Auction[];
  bids: Record<string, Bid[]>;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  placeBid: (auctionId: string, amount: number) => boolean;
  getBidsForAuction: (auctionId: string) => Bid[];
  getUserListings: () => Auction[];
  getUserBids: () => Bid[];
  getHighestBidder: (auctionId: string) => Bid | null;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [auctions, setAuctions] = useState<Auction[]>(mockAuctions);
  const [bids, setBids] = useState<Record<string, Bid[]>>(mockBids);
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers['current']);
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, { email: string; password: string; user: User }>>({
    'john@example.com': { email: 'john@example.com', password: 'password', user: mockUsers['current'] },
  });

  const login = (email: string, password: string): boolean => {
    const user = registeredUsers[email];
    if (user && user.password === password) {
      setCurrentUser(user.user);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    if (registeredUsers[email]) {
      return false; // Email already exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: name.charAt(0).toUpperCase(),
      joinDate: new Date(),
      rating: 5,
    };

    setRegisteredUsers(prev => ({
      ...prev,
      [email]: { email, password, user: newUser },
    }));

    setCurrentUser(newUser);
    return true;
  };

  const logout = (): void => {
    setCurrentUser(null);
  };

  const placeBid = (auctionId: string, amount: number): boolean => {
    if (!currentUser) return false;
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || amount <= auction.currentBid) {
      return false;
    }

    // Update auction with new bid
    setAuctions(prev => prev.map(a => 
      a.id === auctionId 
        ? { ...a, currentBid: amount, bidCount: a.bidCount + 1 }
        : a
    ));

    // Add new bid to history
    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      auctionId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount,
      timestamp: new Date(),
    };

    setBids(prev => ({
      ...prev,
      [auctionId]: [...(prev[auctionId] || []), newBid],
    }));

    return true;
  };

  const getBidsForAuction = (auctionId: string): Bid[] => {
    return bids[auctionId] || [];
  };

  const getUserListings = (): Auction[] => {
    return auctions.filter(a => a.sellerId === currentUser.id);
  };

  const getUserBids = (): Bid[] => {
    const allBids = Object.values(bids).flat();
    return allBids.filter(b => b.bidderId === currentUser.id);
  };

  const getHighestBidder = (auctionId: string): Bid | null => {
    const auctionBids = bids[auctionId] || [];
    if (auctionBids.length === 0) return null;
    return auctionBids.reduce((highest, current) => 
      current.amount > highest.amount ? current : highest
    );
  };

  return (
    <AuctionContext.Provider value={{
      auctions,
      bids,
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      signup,
      logout,
      placeBid,
      getBidsForAuction,
      getUserListings,
      getUserBids,
      getHighestBidder,
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
