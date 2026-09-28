'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="page-shell"><h1 className="page-title">Something went wrong</h1><p className="my-6">We couldn’t load this page. Please try again.</p><button onClick={reset} className="button">Try again</button></main>;
}
