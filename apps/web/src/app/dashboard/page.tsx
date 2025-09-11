'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Dashboard
          </h2>
          <p className="text-center text-sm text-gray-600">
            Welcome, {session.user.email}!
          </p>
          <Button onClick={() => signOut()} className="w-full">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // This case should ideally not be reached if unauthenticated users are redirected
  return null;
}