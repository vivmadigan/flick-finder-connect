import { useEffect } from 'react';
import { useVisualFX } from '@/context/VisualFXProvider';
import { AuthForm } from '@/features/auth/AuthForm';

export default function Register() {
  const { setPreset } = useVisualFX();

  useEffect(() => {
    setPreset('standard');
  }, [setPreset]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-20">
      <div className="relative z-10 w-full">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
