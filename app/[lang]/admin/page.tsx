import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import AdminClient from './admin-client';

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  try {
    await requireAdmin();
  } catch {
    redirect(`/${lang}/login`);
  }
  return <AdminClient />;
}
