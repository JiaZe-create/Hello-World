import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { signOut } from './actions';
export default async function Navigation() {
  const user = await getUser();
  return <header className="border-b border-zinc-200 dark:border-zinc-800"><nav aria-label="Main navigation" className="mx-auto flex max-w-5xl flex-wrap items-center gap-5 px-6 py-5"><Link href="/" className="mr-auto font-semibold">Humor studies</Link><Link href="/">Catalog</Link>{user ? <><Link href="/lab">Comedy Lab</Link><Link href="/profile">Profile</Link><form action={signOut}><button className="underline">Sign out</button></form></> : <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">Sign in</Link>}</nav></header>;
}
