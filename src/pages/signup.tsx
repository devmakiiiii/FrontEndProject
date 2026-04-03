import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuction } from '@/lib/auction-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuction();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (signup(name, email, password)) {
        navigate('/');
      } else {
        setError('Email already exists');
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2"> 
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground text-sm font-bold">AP</span>
        </div>
        <span className="text-xl font-bold hidden sm:inline">Auction Pro</span>
      </Link>

      <div className="flex items-center gap-6">
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
      </div>
    </div>
  </nav>
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
            ⚡
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join Auction Pro and start bidding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </main>
    </>
  );
}