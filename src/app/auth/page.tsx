import { DataForm } from '@/components/forms';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
export default async function AuthPage() {
  if (await currentUser()) redirect('/profile');
  return <div className="container"><div className="page-header"><h1>Your next team starts here</h1></div><DataForm kind="auth" /></div>;
}
