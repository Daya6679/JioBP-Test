import { redirect } from 'next/navigation';

export default function RootPage() {
  // This will immediately move the user to the dashboard
  redirect('/dashboard');
}