import { redirect } from 'next/navigation';

export default function ServiceDetailStatic() {
  // Redirect to the main dashboard if accessed without an ID
  redirect('/clerk/dashboard');
}
