import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { signOut } from './actions';
export default async function Navigation() {
 const user=await getUser();
 return <header className="site-header"><nav aria-label="Main navigation" className="site-nav"><Link href="/" className="wordmark">off campus<span>✦</span></Link><div className="nav-links"><Link href="/">The feed</Link><Link href="/catalog">Humor studies</Link>{user?<><Link href="/profile">Profile</Link><form action={signOut}><button>Sign out</button></form></>:<Link href="/login">Sign in</Link>}<Link href="/lab" className="nav-create">Create <span>↗</span></Link></div></nav></header>;
}
