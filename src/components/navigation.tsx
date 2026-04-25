import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuction();

  const isActive = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Bidly
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Browse
              </Link>
              <Link
                to="/my-listings"
                className={`text-sm font-medium transition-colors ${
                  isActive('/my-listings')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Listings
              </Link>
              <Link
                to="/my-bids"
                className={`text-sm font-medium transition-colors ${
                  isActive('/my-bids')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Bids
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className={`text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors ${
                  isActive('/profile')
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {currentUser?.avatar}
                </div>
                <span className="hidden sm:inline">{currentUser?.name.split(' ')[0]}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}