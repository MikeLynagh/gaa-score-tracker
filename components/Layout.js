import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-black text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">GAA Score Tracker</h1>
          {/* <ThemeToggle /> */}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 mb-16">
        {children}
      </main>
      
      <nav className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 fixed bottom-0 left-0 right-0">
        <ul className="flex justify-around max-w-md mx-auto">
          <li>
            <Link href="/" className="block py-3 px-4 text-center text-sm">
              <span className="block text-gray-800 dark:text-gray-200">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/counties" className="block py-3 px-4 text-center text-sm">
              <span className="block text-gray-800 dark:text-gray-200">Counties</span>
            </Link>
          </li>
          <li>
            <Link href="/live" className="block py-3 px-4 text-center text-sm">
              <span className="block text-gray-800 dark:text-gray-200">See Matches</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}