import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  mobilenumber: string;
  role: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, auctions } = useAuction();
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, currentUser, navigate]);

const fetchUsers = async () => {
    try {
      const usersData = await api.getAllUsers();
      setUsers(usersData.users);
    } catch (error: any) {
      toast.error('Failed to load users');
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      await api.promoteUser(userId);
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to promote user');
    }
  };

  const handleCloseAuction = async (auctionId: string) => {
    try {
      await api.closeAuction(auctionId);
      toast.success('Auction closed');
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to close auction');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage users and auctions</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.firstname} {user.lastname}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          onClick={() => handlePromote(user.id)}
                        >
                          Promote to Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="auctions">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>{auction.title}</TableCell>
                    <TableCell>${auction.currentBid}</TableCell>
                    <TableCell>{auction.endTime.toLocaleDateString()}</TableCell>
                    <TableCell>{auction.status}</TableCell>
                    <TableCell>
                      {auction.status === 'active' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCloseAuction(auction.id)}
                        >
                          Close Auction
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}