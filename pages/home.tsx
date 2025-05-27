import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Head from "next/head";
import { log } from "console";

export default function Home() {
  const { data: session, status } = useSession();
  const [favoriteMovie, setFavoriteMovie] = useState<string | null>(null);
  const [movieInput, setMovieInput] = useState("");
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user-movie")
        .then((res) => res.json())
        .then((data) => {
          setFavoriteMovie(data.movie);
          if (data.movie) fetchFact();
        })
        .catch(console.error);
    }
  }, [status]);

  const fetchFact = async () => {
    if (refreshCount >= 2) {
      setFact("You’ve reached your refresh limit for this session.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/fact");
      const json = await res.json();

      if (!res.ok) {
        setFact(json.error || "Failed to fetch fact.");
      } else {
        setFact(json.fact);
        setRefreshCount((prev) => prev + 1);
      }
    } catch {
      setFact("Failed to fetch fact.");
    } finally {
      setLoading(false);
    }
  };

  const saveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: movieInput.trim() }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setFavoriteMovie(json.movie);
      fetchFact();
    } catch {
      console.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Loading session…</p>;
  }

  if (status !== "authenticated") {
    return <p className="text-center mt-10">Please sign in first.</p>;
  }
  const isDefaultGoogleImage = session.user?.image?.includes("default-user");
  return (
    <>
      <Head>
        <title>Home | Movie Facts</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
            {!isDefaultGoogleImage && session.user?.image && (
              <img
                src={session.user.image}
                alt="User"
                className="w-full h-full object-cover rounded-full"
              />
            )}

            </div>
            <h2 className="text-xl font-bold">{session.user?.name}</h2>
            <p className="text-sm text-gray-500">{session.user?.email}</p>
          </div>

          {favoriteMovie === null ? (
            <form onSubmit={saveMovie} className="space-y-4">
              <label className="block text-gray-700">
                What’s your favorite movie?
              </label>
              <input
                value={movieInput}
                onChange={(e) => setMovieInput(e.target.value)}
                placeholder="e.g. The Matrix"
                className="w-full border px-4 py-2 rounded-md focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 rounded-md"
              >
                {loading ? "Saving…" : "Save Movie"}
              </button>
            </form>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-orange-600">
                🎬 Fun Fact about “{favoriteMovie}”
              </h3>
              {loading ? (
                <p className="text-gray-400 animate-pulse">Fetching a fresh fact…</p>
              ) : (
                <p className="text-gray-800">{fact}</p>
              )}
              {refreshCount < 2 && (
                <button
                  onClick={fetchFact}
                  className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition mt-4"
                  disabled={loading}
                >
                  {loading ? "Fetching…" : "Get Another Fact"}
                </button>
              )}
            </>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
