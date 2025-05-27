// pages/index.tsx
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.push("/home");
  }, [status, router]);
  if (status === "loading") return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-10 to-orange-300">
      <img
        src="/movie_background.jpg"
        className="absolute inset-0 w-full h-full object-cover opacity-80 -z-10"
        alt="Background"
      />
      <div className="bg-orange-50 bg-opacity-75 p-8 rounded-2xl shadow-lg max-w-sm w-full text-center z-10">
        <h1 className="text-3xl font-bold mb-6">Sign In</h1>
        <input
          type="email"
          placeholder="Email Address"
          className="w-full mb-4 px-4 py-2 rounded bg-white placeholder-gray-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded bg-white placeholder-gray-500 focus:outline-none"
        />
        <button
          disabled
          className="w-full bg-red-600 text-white py-2 rounded font-semibold mb-4 opacity-50 cursor-not-allowed"
        >
          Sign In
        </button>
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded hover:bg-gray-100 transition"
        >
          <img
            src="/google_logo.png"
            alt="Google logo"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
