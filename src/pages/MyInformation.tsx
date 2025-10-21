import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisualFX } from '@/context/VisualFXProvider';
import { useAuth } from '@/context/AuthContext';
import { authService, clearToken } from '@/services/authService';
import type { MyInformationDto } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MyInformation() {
  const navigate = useNavigate();
  const { setPreset } = useVisualFX();
  const { logout } = useAuth();
  const [userInfo, setUserInfo] = useState<MyInformationDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPreset('dense');
    
    const fetchUserInfo = async () => {
      try {
        // TODO: In LIVE mode, this calls /api/MyInformation on the ASP.NET backend with Bearer token
        const data = await authService.myInformation();
        setUserInfo(data);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        toast.error('Failed to load your information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [setPreset]);

  const handleCopyUserId = () => {
    if (userInfo?.userId) {
      navigator.clipboard.writeText(userInfo.userId);
      toast.success('User ID copied to clipboard');
    }
  };

  const handleLogout = async () => {
    clearToken();
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/discover')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="backdrop-blur-glass border-border/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-display">My Information</CardTitle>
              <CardDescription>
                View your account details
                {/* TODO: Add edit profile functionality */}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : userInfo ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={userInfo.displayName}
                      readOnly
                      className="rounded-2xl bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={userInfo.email}
                      readOnly
                      className="rounded-2xl bg-muted/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userInfo.firstName}
                        readOnly
                        className="rounded-2xl bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userInfo.lastName}
                        readOnly
                        className="rounded-2xl bg-muted/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="userId"
                        value={userInfo.userId}
                        readOnly
                        className="rounded-2xl bg-muted/50 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyUserId}
                        className="rounded-2xl flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* TODO: Add change password functionality */}
                  {/* TODO: Add edit profile functionality (firstName, lastName, displayName) */}
                  
                  <div className="pt-6 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full rounded-2xl"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load user information
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
