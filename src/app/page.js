import Link from "next/link";

export default function Home() {
  return (
 <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            BorzAI
          </Link>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 font-medium rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-6 flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800">
          Welcome to MyChatAI
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Your intelligent assistant powered by state-of-the-art AI. Chat, learn,
          and get things done—effortlessly.
        </p>
        <div className="mt-8 flex space-x-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 rounded-md border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
          >
            Create Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="container mx-auto px-6 text-center text-gray-500">
          &copy; {new Date().getFullYear()} MyChatAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
