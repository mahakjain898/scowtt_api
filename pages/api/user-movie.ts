import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  const email = session.user.email;

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { email } });
    const movies = user?.favoriteMovies
      ? user.favoriteMovies.split(",").map((m: string) => m.trim())
      : [];
    return res.json({ movies });
  }

  if (req.method === "POST") {
    const { movie } = req.body;
    if (!movie) return res.status(400).json({ error: "Movie name required" });

    const user = await prisma.user.findUnique({ where: { email } });
    const existing = user?.favoriteMovies?.split(",").map((m: string) => m.trim()) || [];

    if (existing.includes(movie)) {
      return res.status(400).json({ error: "Movie already added" });
    }

    const updated = [...existing, movie].join(", ");

    await prisma.user.update({
      where: { email },
      data: { favoriteMovies: updated },
    });

    return res.status(200).json({ movie });
  }

  return res.status(405).end();
}
