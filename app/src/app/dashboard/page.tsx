import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/supabase/server';

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
    return;
  }

  redirect('/dashboard/overview');
}