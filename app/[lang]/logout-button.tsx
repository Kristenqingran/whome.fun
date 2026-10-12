'use client';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await getSupabaseBrowser().auth.signOut();
    router.refresh();
  }
  return <button className="nav-button" type="button" onClick={logout}>退出</button>;
}
