import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function Home() {
  const { data: session, status } = useSession();
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
  const [movieInput, setMovieInput] = useState("");
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user-movie")
        .then((res) => res.json())
        .then((data) => {
          setFavoriteMovies(data.movies || []);
        })
        .catch(console.error);
    }
  }, [status]);
//changee this logic a bit. 
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
      if (!res.ok) throw new Error("Failed to save");
      const json = await res.json();
      setFavoriteMovies((prev) => [...prev, json.movie]);
      setMovieInput("");
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFact= async (movie: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie }),
      });
      const data = await res.json();
      setFact(`🎬 Fun Fact about "${movie}": ${data.fact}`);
    } catch (err) {
      setFact("Failed to fetch fact.");
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

          <form onSubmit={saveMovie} className="space-y-4">
            <label className="block text-gray-700">
              Add a favorite movie:
            </label>
            <input
              value={movieInput}
              onChange={(e) => setMovieInput(e.target.value)}
              placeholder="e.g. Interstellar"
              className="w-full border px-4 py-2 rounded-md focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 rounded-md"
            >
              {loading ? "Saving…" : "Add Movie"}
            </button>
          </form>
          {/* as discussed separataed it from the add mvie logic */}
          {favoriteMovies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-orange-600">
                Your Favorite Movies:
              </h3>
              {favoriteMovies.map((movie, index) => (
                <div key={index} className="flex justify-between items-center bg-orange-50 p-2 rounded">
                  <span>{movie}</span>
                  <button
                    onClick={() => fetchFact(movie)}
                    className="text-sm bg-orange-400 text-white px-2 py-1 rounded hover:bg-orange-500"
                  >
                    Get Fact
                  </button>
                </div>
              ))}
            </div>
          )}

          {fact && <p className="mt-4 text-gray-800">{fact}</p>}

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
