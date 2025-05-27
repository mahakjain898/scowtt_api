import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { status } = useSession();

  return (
    <nav className="w-full px-6 py-3 backdrop-blur-sm bg-white/70 border-b border-white/30 fixed top-0 left-0 z-50 flex justify-between items-center">
      <Link href="/">
        <img src="/scowtt-logo.png" alt="Logo" className="h-10 w-auto" />
      </Link>

      {status === "authenticated" && (
        <div className="flex gap-6 items-center text-sm text-gray-700 font-medium">
          <Link href="/home">Home</Link>
          <a href="#">Team</a>
          <a href="#">Services</a>
          <a href="#">Career</a>
          <a href="#">Contact</a>
          <button className="bg-orange-500 text-white px-4 py-1 rounded-md hover:bg-orange-600 transition">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
