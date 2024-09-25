// components/Layout.js
import Link from 'next/link';
import LiveScoreFeed from './LiveScoreFeed';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black text-white p-4 justify-center">
        <h1 className="text-xl font-bold">GAA Score Tracker</h1>
        <ThemeToggle />
      </header>
      
      <main className="flex-grow flex">
        <div className="w-4/4 p-4">
          {children}
        </div>

      </main>
      
      <nav className="bg-white border-t fixed bottom-0 left-0 right-0">
        <ul className="flex justify-around">
          <li>
            <Link href="/" className="block p-4">
              Home
            </Link>
          </li>
          <li>
            <Link href="/counties" className="block p-4">
              Counties
            </Link>
          </li>
          <li>
            <Link href="/live" className="block p-4">
              Latest Scores Feed
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}