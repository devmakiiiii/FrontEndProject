import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, getUserListings, deleteAuction } = useAuction();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const listings = getUserListings();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-balance">
          My Listings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your auction listings
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="flex items-center justify-center min-h-64 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">You haven't listed any auctions yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((auction) => (
            <Link key={auction.id} to={`/auction/${auction.id}`}>
              <Card className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full transform-gpu">
                <div className="flex flex-col lg:flex-row gap-6 cursor-default">
                  <div className="lg:w-1/3">
                    <img
                      src={auction.image || 'https://placehold.co/400x400?text=No+Image'}
                      alt={auction.title}
                      className="w-full aspect-square object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                      }}
                    />
                  </div>

                  <div className="lg:w-2/3 space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">{auction.category}</p>
                      <h3 className="text-2xl font-bold">{auction.title}</h3>
                      <p className="text-muted-foreground">{auction.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Current Bid</p>
                        <p className="text-xl font-bold text-primary">${auction.currentBid}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Starting Bid</p>
                        <p className="text-xl font-bold">${auction.startingBid}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Bids</p>
                        <p className="text-xl font-bold">{auction.bidCount}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Time Remaining</p>
                        <p className="text-xl font-bold">
                          {(() => {
                            const hours = Math.ceil((auction.endTime.getTime() - Date.now()) / (1000 * 60 * 60));
                            return hours > 0 ? `${hours}h` : 'Ended';
                          })()}
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {auction.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-auction/${auction.id}`);
                      }}>
                        Edit Listing
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAuctionToDelete(auction.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Auction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this auction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAuctionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (auctionToDelete) {
                  deleteAuction(auctionToDelete);
                  setDeleteDialogOpen(false);
                  setAuctionToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}