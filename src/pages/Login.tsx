import { useEffect } from 'react';
import { useVisualFX } from '@/context/VisualFXProvider';
import { SignInForm } from '@/features/auth/SignInForm';

export default function Login() {
  const { setPreset } = useVisualFX();

  useEffect(() => {
    setPreset('standard');
  }, [setPreset]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-20">
      <div className="relative z-10 w-full">
        <SignInForm />
      </div>
    </div>
  );
}
