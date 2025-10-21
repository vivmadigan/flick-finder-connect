import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { authService, saveToken } from '@/services/authService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: In LIVE mode, this calls /api/SignIn on the ASP.NET backend
      const response = await authService.signIn({
        email: formData.email,
        password: formData.password,
      });

      saveToken(response.token);
      
      const user = {
        id: response.userId,
        email: response.email,
        displayName: response.displayName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.email}`,
      };
      
      login(user, response.token);
      toast.success('Welcome back!');
      navigate('/discover');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      
      // TODO: In LIVE mode, parse ASP.NET error responses (401 for invalid credentials)
      if (errorMessage.includes('401')) {
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('400')) {
        toast.error('Please check your email and password');
      } else {
        toast.error('Sign in failed. Please try again.');
      }
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-glass border-border/50 rounded-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
        <CardDescription>Log in to find your perfect movie date</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Log in
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
