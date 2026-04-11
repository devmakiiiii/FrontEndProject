import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { AuctionGrid } from '@/components/auction-grid';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function BrowsePage() {
  const navigate = useNavigate();
  const { auctions, isAuthenticated } = useAuction();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(auctions.map(a => a.category))];
    return uniqueCategories.sort();
  }, [auctions]);

  const filteredAuctions = useMemo(() => {
    return auctions.filter(auction => {
      const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          auction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || auction.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [auctions, searchTerm, categoryFilter, statusFilter]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-balance">
          Browse Auctions
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover and bid on amazing items from sellers worldwide
        </p>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Active Auctions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <AuctionGrid
        auctions={filteredAuctions}
        emptyMessage="No auctions match your search criteria."
      />
    </main>
  );
}