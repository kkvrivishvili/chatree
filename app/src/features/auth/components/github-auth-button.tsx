'use client';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/supabase/hooks';

export default function GithubSignInButton() {
  const [isPending, startTransition] = useTransition();
  const { signInWithOAuth, loading } = useAuth();

  const handleClick = () => {
    startTransition(async () => {
      const { error } = await signInWithOAuth('github');
      
      if (error) {
        toast.error(error.message);
      }
    });
  };

  return (
    <Button
      variant='outline'
      type='button'
      disabled={isPending || loading}
      onClick={handleClick}
      className='w-full'
    >
      {(isPending || loading) ? (
        <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Icons.gitHub className='mr-2 h-4 w-4' />
      )}
      Github
    </Button>
  );
}
