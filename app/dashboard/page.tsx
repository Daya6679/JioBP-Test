import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Automatically send users to the Vehicles page
  redirect('/dashboard/drivers');
}