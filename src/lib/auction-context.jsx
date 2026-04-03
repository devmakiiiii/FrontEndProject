import React, { createContext, useContext, useState } from 'react';
import { mockAuctions, mockBids, mockUsers } from './mock-data';

const AuctionContext = createContext(undefined);

export function AuctionProvider({ children }) {
  const [auctions, setAuctions] = useState(mockAuctions);
  const [bids, setBids] = useState(mockBids);
  const [currentUser, setCurrentUser] = useState(mockUsers['current']);
  const [registeredUsers, setRegisteredUsers] = useState({
    'john@example.com': { email: 'john@example.com', password: 'password', user: mockUsers['current'] },
  });

  const login = (email, password) => {
    const user = registeredUsers[email];
    if (user && user.password === password) {
      setCurrentUser(user.user);
      return true;
    }
    return false;
  };

  const signup = (name, email, password) => {
    if (registeredUsers[email]) {
      return false; // Email already exists
    }

    const newUser = {
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

  const logout = () => {
    setCurrentUser(null);
  };

  const placeBid = (auctionId, amount) => {
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
    const newBid = {
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

  const getBidsForAuction = (auctionId) => {
    return bids[auctionId] || [];
  };

  const getUserListings = () => {
    return auctions.filter(a => a.sellerId === currentUser?.id);
  };

  const getUserBids = () => {
    const allBids = Object.values(bids).flat();
    return allBids.filter(b => b.bidderId === currentUser?.id);
  };

  const getHighestBidder = (auctionId) => {
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
