import { redirect } from 'next/navigation';

export default function Home() {
  // For now, immediately redirect the root to one of the dashboards
  // Once we have a real login page, we'll redirect to /login instead.
  redirect('/dashboard/station-manager');
}
