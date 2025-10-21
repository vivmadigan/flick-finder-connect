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

export function SignUpForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    displayName: '',
  });

  const validateDisplayName = (value: string): string | null => {
    if (value.length < 3 || value.length > 20) {
      return 'Display name must be 3-20 characters';
    }
    if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
      return 'Display name can only contain letters, numbers, _, ., and -';
    }
    return null;
  };

  const handleDisplayNameChange = (value: string) => {
    setFormData({ ...formData, displayName: value });
    const error = validateDisplayName(value);
    setErrors({ ...errors, displayName: error || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const displayNameError = validateDisplayName(formData.displayName);
    if (displayNameError) {
      setErrors({ ...errors, displayName: displayNameError });
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ ...errors, password: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // TODO: In LIVE mode, this calls /api/SignUp on the ASP.NET backend
      const response = await authService.signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
      });

      saveToken(response.token);
      
      const user = {
        id: response.userId,
        email: response.email,
        displayName: response.displayName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.email}`,
      };

      login(user, response.token);
      toast.success('Welcome to CineMatch!');
      navigate('/onboarding');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      
      // TODO: In LIVE mode, parse ASP.NET error responses (409 for conflicts, 400 for validation)
      if (errorMessage.includes('409') || errorMessage.includes('already')) {
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors({ email: 'Email is already in use' });
        } else if (errorMessage.toLowerCase().includes('display')) {
          setErrors({ displayName: 'Display name is already taken' });
        } else {
          toast.error('Email or display name already taken');
        }
      } else if (errorMessage.includes('400')) {
        toast.error('Invalid input. Please check your details.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-glass border-border/50 rounded-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Create your account</CardTitle>
        <CardDescription>Sign up to start matching with movie lovers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              className="rounded-2xl"
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, _, ., and - only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-2xl"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="rounded-2xl"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="rounded-2xl"
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign up
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
