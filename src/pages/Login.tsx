import { AuthForm } from '@/features/auth/AuthForm';
import { BokehBackdrop } from '@/components/BokehBackdrop';
import { BokehOrbs } from '@/components/BokehOrbs';

export default function Login() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-20">
      <BokehBackdrop />
      <BokehOrbs />
      <div className="relative z-10 w-full">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
