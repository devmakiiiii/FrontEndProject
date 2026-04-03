import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, getUserListings, getUserBids, logout } = useAuction();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const listings = getUserListings();
  const bids = getUserBids();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Profile</h1>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {currentUser.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{currentUser.reputation}</p>
              <p className="text-sm text-muted-foreground">Reputation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{listings.length}</p>
              <p className="text-sm text-muted-foreground">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{bids.length}</p>
              <p className="text-sm text-muted-foreground">Bids</p>
            </div>
          </div>
        </Card>

        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Sign Out
        </Button>
      </div>
    </main>
  );
}