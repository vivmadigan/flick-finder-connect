import { ProfileForm } from '@/features/profile/ProfileForm';
import { BokehBackdrop } from '@/components/BokehBackdrop';
import { BokehOrbs } from '@/components/BokehOrbs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      <BokehBackdrop />
      <BokehOrbs />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/discover')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
