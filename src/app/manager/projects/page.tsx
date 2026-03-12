import { redirect } from 'next/navigation';

export default function ProjectsIndex() {
  // the dashboard already lists projects, so just forward
  redirect('/manager/dashboard');
}
