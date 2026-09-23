import { redirect } from 'next/navigation';

export default function DashboardIndex() {
  // Redirect to a specific role dashboard
  redirect('/dashboard/station-manager');
}
