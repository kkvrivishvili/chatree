import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/supabase/server';

export default async function Dashboard() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin');
  }

  redirect('/dashboard/overview');
}
