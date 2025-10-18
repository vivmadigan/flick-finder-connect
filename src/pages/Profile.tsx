import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisualFX } from '@/context/VisualFXProvider';
import { usePreferences } from '@/context/PreferencesContext';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { setPreset } = useVisualFX();
  const { resetPreferences } = usePreferences();
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setPreset('dense');
  }, [setPreset]);

  const handleReset = () => {
    resetPreferences();
    setShowResetModal(false);
    toast.success('Preferences reset');
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
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

          {/* Danger Zone */}
          <div className="mt-12 p-6 border border-destructive/30 rounded-2xl bg-destructive/5">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Reset Preferences</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clear your genre, length, and liked movies to start fresh.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowResetModal(true)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset & Rechoose
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        open={showResetModal}
        onOpenChange={setShowResetModal}
        title="Reset preferences?"
        description="This clears your genre, length, and liked movies so you can choose again."
        confirmText="Reset"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleReset}
      />
    </div>
  );
}
